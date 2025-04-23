import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { name, email, password, organizationName, subdomain } = await req.json();

    // Validate input
    if (!name || !email || !password || !organizationName || !subdomain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Check if subdomain is available
    const existingOrg = await prisma.organization.findUnique({
      where: { subdomain },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Subdomain is already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          subdomain,
          plan: 'FREE', // Default plan
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
          role: 'ADMIN', // First user is admin
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    // Return success without sensitive data
    return NextResponse.json({
      message: 'Account created successfully',
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        subdomain: result.organization.subdomain,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
} 