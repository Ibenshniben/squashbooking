import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { courtId, startDate, timeMinutes, durationMinutes, occurrences, intervalWeeks } = body

  if (!courtId || !startDate || typeof timeMinutes !== 'number' || !durationMinutes || !occurrences) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const weeks = typeof intervalWeeks === 'number' && intervalWeeks > 0 ? intervalWeeks : 1
  const duration = typeof durationMinutes === 'number' && durationMinutes > 0 ? durationMinutes : 60
  const count = Math.max(1, parseInt(occurrences, 10))

  let created = 0
  let skipped = 0

  try {
    for (let i = 0; i < count; i++) {
      const baseDate = new Date(startDate)
      baseDate.setDate(baseDate.getDate() + i * 7 * weeks)
      baseDate.setHours(Math.floor(timeMinutes / 60), timeMinutes % 60, 0, 0)

      const start = baseDate
      const end = new Date(start.getTime() + duration * 60 * 1000)

      const overlap = await prisma.booking.findFirst({
        where: {
          courtId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
      })

      if (overlap) {
        skipped++
        continue
      }

      await prisma.booking.create({
        data: {
          userId: session.user.id,
          courtId,
          startTime: start,
          endTime: end,
        },
      })
      created++
    }

    return NextResponse.json({ created, skipped })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create recurring bookings' }, { status: 500 })
  }
}

