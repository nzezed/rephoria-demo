import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Permission, hasPermission } from '@/lib/auth/permissions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, Permission.VIEW_ORGANIZATION)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
} 