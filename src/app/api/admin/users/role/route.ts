import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id, role } = await request.json()
  if (!id || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  await prisma.user.update({
    where: { id },
    data: { role }
  })

  return NextResponse.json({ success: true })
}
