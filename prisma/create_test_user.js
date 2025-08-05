const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test.user@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test.user@example.com",
      cpf: "11122233344",
      phone: "(11)99999-9999",
      address: "Rua Teste, 123, Bairro Teste, Cidade Teste, Estado Teste",
      password: hashedPassword,
      role: "VENDEDORA",
    },
  });

  console.log("Usuário de teste criado/atualizado:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


