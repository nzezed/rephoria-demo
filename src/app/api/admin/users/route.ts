import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { Permission, hasPermission } from '@/lib/auth/permissions'; // Import Permission and hasPermission

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has permission to view users
  if (!session?.user || !hasPermission(session.user.role, Permission.VIEW_USERS)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); // Use 403 Forbidden for permission issues
  }

  // Ensure organizationId is present in the session user object
  if (!session?.user?.organizationId) {
    console.error('Organization ID missing from session for user:', session?.user?.id);
    return NextResponse.json({ error: 'Internal server error: Missing organization context' }, { status: 500 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId, // Filter by organization
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
