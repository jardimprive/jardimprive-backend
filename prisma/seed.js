const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient(); // ✅ Correção aqui

async function main() {
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const senhaVendedora = await bcrypt.hash('vendedora123', 10);

  // 👑 Admin
  await prisma.user.upsert({
    where: { email: 'admin@jardimprive.com' },
    update: {},
    create: {
      name: 'Admin Jardim Privé',
      email: 'admin@jardimprive.com',
      password: senhaAdmin,
      cpf: '00200000000',
      phone: '00000000000',
      address: 'Admin Street, 123',
      role: 'ADMIN',
      status: 'ATIVA',
    },
  });

  // 👩 Vendedora
  await prisma.user.upsert({
    where: { email: 'vendedora@jardimprive.com' },
    update: {},
    create: {
      name: 'Vendedora Teste',
      email: 'vendedora@jardimprive.com',
      password: senhaVendedora,
      cpf: '11119111111',
      phone: '11111111111',
      address: 'Rua da Vendedora, 456',
      role: 'VENDEDORA',
      status: 'ATIVA',
    },
  });

  console.log('✅ Admin e Vendedora criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
