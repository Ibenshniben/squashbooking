import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addDays, startOfDay, isAfter, isBefore } from 'date-fns'
import {
  SLOT_MINUTES,
  FIRST_SLOT_HOUR,
  LAST_END_HOUR,
  MAX_SLOTS_USER,
  MAX_SLOTS_ADMIN,
  MAX_DAYS_AHEAD_USER,
  CANCEL_LIMIT_HOURS,
  isAdminRole,
  osloMinutes,
} from '@/lib/booking-rules'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  // The signed-in user's own upcoming bookings
  if (searchParams.get('mine')) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId: session.user.id, endTime: { gt: new Date() } },
        select: { id: true, startTime: true, endTime: true, courtId: true, userId: true, court: true },
        orderBy: { startTime: 'asc' },
      })
      return NextResponse.json(bookings)
    } catch (error) {
      return NextResponse.json({ error: 'Kunne ikke hente bookinger' }, { status: 500 })
    }
  }

  const date = searchParams.get('date')

  if (!date || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: 'Dato er påkrevd' }, { status: 400 })
  }

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: start,
          lte: end,
        },
      },
      // Only admins get to see who booked a slot
      select: isAdminRole(session.user.role)
        ? {
            id: true,
            startTime: true,
            endTime: true,
            courtId: true,
            userId: true,
            court: true,
            user: { select: { id: true, name: true, email: true } },
          }
        : { id: true, startTime: true, endTime: true, courtId: true, userId: true },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke hente bookinger' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  }
  const { courtId, startTime, isRecurring = false } = body
  const slots = Number(body.slots ?? 1)
  const weeks = Number(body.weeks ?? 1)

  if (!courtId || !startTime) {
    return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 })
  }

  const start = new Date(startTime)
  const isAdmin = isAdminRole(session.user.role)
  const maxSlots = isAdmin ? MAX_SLOTS_ADMIN : MAX_SLOTS_USER

  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Ugyldig tidspunkt' }, { status: 400 })
  }
  if (!Number.isInteger(slots) || slots < 1 || slots > maxSlots) {
    return NextResponse.json({ error: `Du kan booke maksimalt ${maxSlots * SLOT_MINUTES} minutter` }, { status: 400 })
  }
  if (isRecurring && (!Number.isInteger(weeks) || weeks < 1 || weeks > 52)) {
    return NextResponse.json({ error: 'Antall uker må være mellom 1 og 52' }, { status: 400 })
  }

  const durationMinutes = SLOT_MINUTES * slots
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
  const startMinutes = osloMinutes(start)

  if (start.getSeconds() !== 0 || start.getMilliseconds() !== 0 || startMinutes % SLOT_MINUTES !== 0) {
    return NextResponse.json({ error: 'Booking må starte på hel eller halv time' }, { status: 400 })
  }
  if (startMinutes < FIRST_SLOT_HOUR * 60 || startMinutes + durationMinutes > LAST_END_HOUR * 60) {
    return NextResponse.json({ error: 'Tidspunktet er utenfor åpningstiden' }, { status: 400 })
  }
  if (isBefore(end, new Date())) {
    return NextResponse.json({ error: 'Du kan ikke booke tilbake i tid' }, { status: 400 })
  }

  if (!isAdmin) {
    const lastBookableDay = addDays(startOfDay(new Date()), MAX_DAYS_AHEAD_USER)
    lastBookableDay.setHours(23, 59, 59, 999)
    if (isAfter(start, lastBookableDay)) {
      return NextResponse.json({ error: `Du kan kun booke ${MAX_DAYS_AHEAD_USER} dager frem i tid` }, { status: 403 })
    }
  }

  try {
    // The session token can outlive a ban, so check the database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bannedUntil: true },
    })
    if (!dbUser) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
    }
    if (dbUser.bannedUntil && dbUser.bannedUntil > new Date()) {
      return NextResponse.json({
        error: `Kontoen din er utestengt til ${dbUser.bannedUntil.toLocaleDateString('no-NO', { timeZone: 'Europe/Oslo' })}`
      }, { status: 403 })
    }

    // Admins can book on behalf of a member
    let userId = session.user.id
    if (isAdmin && body.userId && body.userId !== session.user.id) {
      const member = await prisma.user.findUnique({ where: { id: body.userId }, select: { id: true } })
      if (!member) {
        return NextResponse.json({ error: 'Fant ikke medlemmet' }, { status: 404 })
      }
      userId = member.id
    }

    const court = await prisma.court.findUnique({ where: { id: courtId }, select: { id: true } })
    if (!court) {
      return NextResponse.json({ error: 'Fant ikke banen' }, { status: 404 })
    }

    const checkOverlap = async (s: Date, e: Date) => {
      return await prisma.booking.findFirst({
        where: {
          courtId,
          OR: [
            { startTime: { lt: e }, endTime: { gt: s } }
          ]
        }
      })
    }

    if (isRecurring && isAdmin) {
      const recurringId = crypto.randomUUID()
      const bookingsToCreate = []

      for (let i = 0; i < weeks; i++) {
        const currentStart = addDays(start, i * 7)
        const currentEnd = new Date(currentStart.getTime() + durationMinutes * 60 * 1000)

        const conflict = await checkOverlap(currentStart, currentEnd)
        if (conflict) {
          return NextResponse.json({ 
            error: `Konflikt funnet for en av de gjentakende tidene: ${currentStart.toLocaleDateString('no-NO', { timeZone: 'Europe/Oslo' })} ${currentStart.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' })}` 
          }, { status: 409 })
        }

        bookingsToCreate.push({
          userId,
          courtId,
          startTime: currentStart,
          endTime: currentEnd,
          isRecurring: true,
          recurringId,
        })
      }

      await prisma.booking.createMany({ data: bookingsToCreate })
      return NextResponse.json({ success: true, count: bookingsToCreate.length })
    }

    const conflict = await checkOverlap(start, end)
    if (conflict) {
      return NextResponse.json({ error: 'Valgt varighet overlapper med en eksisterende booking' }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        courtId,
        startTime: start,
        endTime: end,
      },
    })

    return NextResponse.json(booking)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Tidspunktet er allerede booket' }, { status: 409 })
    }
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Kunne ikke opprette booking' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Uautorisert' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Mangler ID' }, { status: 400 })

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) return NextResponse.json({ error: 'Booking ikke funnet' }, { status: 404 })

    // If not admin, check if it's their own booking and if it's more than 24h away
    if (!isAdminRole(session.user.role)) {
      if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: 'Du kan kun slette dine egne bookinger' }, { status: 403 })
      }

      const cancelLimit = new Date(Date.now() + CANCEL_LIMIT_HOURS * 60 * 60 * 1000)
      if (isBefore(new Date(booking.startTime), cancelLimit)) {
        return NextResponse.json({ error: `Du kan kun avbestille inntil ${CANCEL_LIMIT_HOURS} timer før start` }, { status: 403 })
      }
    }

    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke slette booking' }, { status: 500 })
  }
}
