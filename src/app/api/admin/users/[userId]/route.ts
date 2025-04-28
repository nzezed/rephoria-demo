import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Role } from '@prisma/client';
import { Permission, hasPermission } from '@/lib/auth/permissions'; // Import Permission and hasPermission

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has permission to delete users
  if (!session?.user || !hasPermission(session.user.role, Permission.DELETE_USERS)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId } = params

    // Don't allow deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // --- Audit Log Entry ---
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id, // The admin/manager performing the action
          action: 'USER_DELETE',
          details: `Deleted user ID: ${userId}`,
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log for user deletion:', auditError);
    }
    // --- End Audit Log ---

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has permission to update users
  if (!session?.user || !hasPermission(session.user.role, Permission.UPDATE_USERS)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId } = params
    const body = await request.json()
    const { role } = body

    // Don't allow changing your own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.USER]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
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
    });

    // --- Audit Log Entry ---
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id, // The admin/manager performing the action
          action: 'USER_ROLE_UPDATE',
          details: `Updated role for user ID: ${userId} to ${role}`,
        },
      });
    } catch (auditError) {
      console.error('Failed to create audit log for role update:', auditError);
    }
    // --- End Audit Log ---

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}
