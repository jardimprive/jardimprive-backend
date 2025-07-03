require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 🔒 Criação do Admin
  const adminEmail = 'admin@jardimprive.com.br';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: 'Admin Jardim',
        email: adminEmail,
        cpf: '00000000000',
        phone: '11999999999',
        address: 'Sede Jardim Privé',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ATIVA',
      },
    });

    console.log('✅ Admin criado com sucesso!');
  } else {
    console.log('✅ Admin já existe');
  }

  // 👩 Criação da vendedora Bruna
  const brunaEmail = 'bruna@jardimprive.com.br';
  const brunaPassword = 'bruna123';

  const existingBruna = await prisma.user.findUnique({ where: { email: brunaEmail } });
  if (!existingBruna) {
    const hashedPassword = await bcrypt.hash(brunaPassword, 10);

    await prisma.user.create({
      data: {
        name: 'Bruna Maciel',
        email: brunaEmail,
        cpf: '11111111111',
        phone: '11988888888',
        address: 'Rua das Vendedoras, 123',
        password: hashedPassword,
        role: 'VENDEDORA',
        status: 'ATIVA',
      },
    });

    console.log('✅ Vendedora Bruna criada com sucesso!');
  } else {
    console.log('✅ Bruna já existe');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
