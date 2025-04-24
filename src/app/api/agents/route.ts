import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agents = await prisma.agent.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(agents)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const agent = await prisma.agent.create({
    data: {
      name,
      organizationId: session.user.organizationId
    }
  })

  return NextResponse.json(agent)
} 