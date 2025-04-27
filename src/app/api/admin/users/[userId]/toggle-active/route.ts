import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId } = params
    const body = await request.json()
    const { isActive } = body

    // Don't allow toggling your own status
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own status' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        organizationId: true,
        createdAt: true,
        lastLoginAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle user status' },
      { status: 500 }
    )
  }
} 