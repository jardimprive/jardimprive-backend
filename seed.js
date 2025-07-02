require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@jardimprive.com.br';
  const password = 'admin123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin já existe');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name: 'Admin Jardim',
      email,
      cpf: '00000000000',
      phone: '11999999999',
      address: 'Sede Jardim Privé',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ATIVA',
    },
  });

  console.log('✅ Admin criado com sucesso!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
