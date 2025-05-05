import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Define the validation schema for the signup form
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  plan: z.enum(['solo', 'scale', 'enterprise']),
  numReps: z.number().min(1, 'Number of reps must be at least 1'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = signupSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Email already registered'
        },
        { status: 400 }
      );
    }

    // Generate a random password for the user
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: validatedData.company,
          subdomain: validatedData.company.toLowerCase().replace(/\s+/g, '-'),
          plan: validatedData.plan,
        },
      });

      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          hashedPassword,
          role: 'ADMIN', // First user is admin
          organizationId: organization.id,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'SIGNUP',
          details: `User ${user.name} signed up with plan ${validatedData.plan}`,
        },
      });

      return { organization, user };
    });

    // TODO: Send welcome email with temporary password
    // TODO: Create Stripe customer and subscription

    return NextResponse.json(
      { 
        success: true,
        message: 'Signup successful',
        data: {
          organization: {
            id: result.organization.id,
            name: result.organization.name,
            subdomain: result.organization.subdomain,
          },
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
          },
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation failed',
          errors: error.errors
        },
        { status: 400 }
      );
    }
    
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'An error occurred during signup'
      },
      { status: 500 }
    );
  }
} 