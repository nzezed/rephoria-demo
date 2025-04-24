import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callId = params.id
  try {
    // Cast prisma to any to access generated 'insight' delegate
    const insights = await (prisma as any).insight.findMany({
      where: {
        callId,
        call: { organizationId: session.user.organizationId }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(insights)
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
} 