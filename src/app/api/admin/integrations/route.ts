import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Permission, hasPermission } from '@/lib/auth/permissions';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, Permission.VIEW_INTEGRATIONS)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const integrations = await prisma.integration.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Failed to fetch integrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
} 