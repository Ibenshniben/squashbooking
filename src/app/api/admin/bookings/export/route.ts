import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { gte: startOfDay, lte: endOfDay }
    },
    include: {
      court: true,
      user: { select: { name: true, email: true } }
    },
    orderBy: { startTime: 'asc' }
  })

  const header = 'Start,End,Court,User Name,User Email\n'
  const rows = bookings.map(b => {
    const start = new Date(b.startTime).toISOString()
    const end = new Date(b.endTime).toISOString()
    const court = b.court.name.replace(/,/g, ' ')
    const uname = (b.user?.name ?? '').replace(/,/g, ' ')
    const uemail = (b.user?.email ?? '').replace(/,/g, ' ')
    return `${start},${end},${court},${uname},${uemail}`
  }).join('\n')

  const csv = header + rows + '\n'
  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bookings-${date}.csv"`
    }
  })
}
