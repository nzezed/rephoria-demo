import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CallStatus } from '@prisma/client';

export async function GET() {
  try {
    const [totalCalls, activeCalls, calls] = await Promise.all([
      prisma.call.count(),
      prisma.call.count({
        where: {
          status: CallStatus.ACTIVE,
        },
      }),
      prisma.call.findMany({
        select: {
          status: true,
          duration: true,
        },
      }),
    ]);

    const callsByStatus = calls.reduce((acc, call) => {
      acc[call.status] = (acc[call.status] || 0) + 1;
      return acc;
    }, {} as Record<CallStatus, number>);

    const averageDuration = calls.reduce((acc, call) => acc + (call.duration || 0), 0) / totalCalls;

    return NextResponse.json({
      totalCalls,
      activeCalls,
      averageDuration,
      callsByStatus,
    });
  } catch (error) {
    console.error('Failed to fetch call stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call statistics' },
      { status: 500 }
    );
  }
} 