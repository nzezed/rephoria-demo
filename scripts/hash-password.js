const bcrypt = require('bcryptjs');

const password = 'Welcome123!'; // This will be your temporary password

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(password, 12);
  console.log('Your temporary password is:', password);
  console.log('Hashed password to put in Prisma Studio:', hashedPassword);
}

hashPassword().catch(console.error); 