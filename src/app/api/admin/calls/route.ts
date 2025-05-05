import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Permission, hasPermission } from '@/lib/auth/permissions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, Permission.VIEW_CALLS)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const calls = await prisma.call.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Limit to 100 most recent calls
    });

    return NextResponse.json(calls);
  } catch (error) {
    console.error('Failed to fetch calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' },
      { status: 500 }
    );
  }
} 