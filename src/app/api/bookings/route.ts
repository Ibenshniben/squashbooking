import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addDays, startOfDay, isAfter, subHours, isBefore } from 'date-fns'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
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
      include: {
        court: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke hante bookinger' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
  }

  const body = await request.json()
  const { courtId, startTime, slots = 1, isRecurring = false, weeks = 1 } = body

  if (!courtId || !startTime) {
    return NextResponse.json({ error: 'Mangler påkrevde felt' }, { status: 400 })
  }

  const start = new Date(startTime)
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    const threeDaysFromNow = addDays(startOfDay(new Date()), 3)
    threeDaysFromNow.setHours(23, 59, 59, 999)
    if (isAfter(start, threeDaysFromNow)) {
      return NextResponse.json({ error: 'Du kan kun booke 3 dager frem i tid' }, { status: 403 })
    }
  }

  const durationMinutes = 30 * slots
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  try {
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
            error: `Konflikt funnet for en av de gjentakende tidene: ${currentStart.toLocaleDateString('no-NO')} ${currentStart.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}` 
          }, { status: 409 })
        }

        bookingsToCreate.push({
          userId: session.user.id,
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
        userId: session.user.id,
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
      include: { user: true }
    })

    if (!booking) return NextResponse.json({ error: 'Booking ikke funnet' }, { status: 404 })

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    
    // If not admin, check if it's their own booking and if it's more than 24h away
    if (!isAdmin) {
      if (booking.userId !== session.user.id) {
        return NextResponse.json({ error: 'Du kan kun slette dine egne bookinger' }, { status: 403 })
      }

      const twentyFourHoursFromNow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      if (isBefore(new Date(booking.startTime), twentyFourHoursFromNow)) {
        return NextResponse.json({ error: 'Du kan kun avbestille inntil 24 timer før start' }, { status: 403 })
      }
    }

    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Kunne ikke slette booking' }, { status: 500 })
  }
}
