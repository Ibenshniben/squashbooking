import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bannedUntil: true,
        image: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { userId, bannedUntil, role } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Only SUPER_ADMIN can change roles
    if (role && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admins can change roles' }, { status: 403 })
    }

    // Regular ADMIN can only ban/modify USERs, not other ADMINs or SUPER_ADMINs
    if (session.user.role === 'ADMIN' && targetUser.role !== 'USER') {
      return NextResponse.json({ error: 'Admins can only manage regular users' }, { status: 403 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        bannedUntil: bannedUntil !== undefined ? (bannedUntil ? new Date(bannedUntil) : null) : undefined,
        role: role || undefined
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Regular ADMIN can only delete USERs
    if (session.user.role === 'ADMIN' && targetUser.role !== 'USER') {
      return NextResponse.json({ error: 'Admins can only delete regular users' }, { status: 403 })
    }

    // SUPER_ADMIN cannot delete themselves
    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
