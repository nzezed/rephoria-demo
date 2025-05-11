import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Get the first organization
  const organization = await prisma.organization.findFirst();
  if (!organization) {
    console.error('No organization found. Please create an organization first.');
    process.exit(1);
  }

  // Get user email from command line argument
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email address as an argument');
    console.error('Usage: ts-node scripts/setup-admin.ts <email>');
    process.exit(1);
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: Role.ADMIN },
      });
      console.log(`Updated user ${email} to ADMIN role`);
    } else {
      // Create new admin user
      const hashedPassword = await hash('admin123', 12); // Default password
      const newUser = await prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          hashedPassword,
          role: Role.ADMIN,
          organizationId: organization.id,
        },
      });
      console.log(`Created new admin user ${email} with password: admin123`);
      console.log('Please change the password after first login');
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 