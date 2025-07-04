const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Verifica se já existem usuários para não duplicar
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@jardimprive.com' } });
  const existingSeller = await prisma.user.findUnique({ where: { email: 'vendedora@jardimprive.com' } });

  if (existingAdmin || existingSeller) {
    console.log('Usuários já existem. Nada foi criado.');
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const sellerPassword = await bcrypt.hash('vendedora123', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Administrador',
        email: 'admin@jardimprive.com',
        cpf: '00000000000',
        phone: '11999999999',
        address: 'Endereço Admin',
        password: adminPassword,
        role: 'ADMIN',
      },
      {
        name: 'Vendedora Teste',
        email: 'vendedora@jardimprive.com',
        cpf: '11111111111',
        phone: '11988888888',
        address: 'Endereço Vendedora',
        password: sellerPassword,
        role: 'VENDEDORA',
      },
    ],
  });

  console.log('✅ Usuários de teste criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
