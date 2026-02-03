import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { differenceInCalendarDays } from 'date-fns'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  // Set start and end of the day
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        court: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { suspendedUntil: true }
  })

  if (me?.suspendedUntil && me.suspendedUntil > new Date()) {
    return NextResponse.json({ error: 'Konto midlertidig utestengt' }, { status: 403 })
  }

  const body = await request.json()
  const { courtId, startTime, durationMinutes } = body

  if (!courtId || !startTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  const duration = typeof durationMinutes === 'number' && durationMinutes > 0 ? durationMinutes : 60
  const end = new Date(start.getTime() + duration * 60 * 1000)

  // Enforce 3 calendar days window for non-admin users (inclusive of today + 3 days)
  const today = new Date(); today.setHours(0,0,0,0)
  const startDay = new Date(start); startDay.setHours(0,0,0,0)
  const dayDiff = differenceInCalendarDays(startDay, today)
  if ((session.user.role !== 'ADMIN') && dayDiff > 3) {
    return NextResponse.json({ error: 'Kan ikke booke mer enn 3 dager i forveien' }, { status: 403 })
  }

  try {
    // Check for overlapping bookings within requested interval
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 409 })
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
