const prisma = require('../config/prisma');
const dayjs = require('dayjs');

const checkBonus = async (userId) => {
  const hoje = dayjs();
  const tresMesesAtras = hoje.subtract(3, 'month').toDate();

  // 🔍 Busca todos os pedidos ENTREGUES e totalmente pagos nos últimos 3 meses
  const pedidos = await prisma.order.findMany({
    where: {
      userId,
      status: 'ENTREGUE',
      createdAt: {
        gte: tresMesesAtras,
      },
    },
    include: {
      payments: true,
      items: true,
    },
  });

  // 🔎 Filtra pedidos com total pago >= 250
  const pedidosValidos = pedidos.filter((pedido) => {
    const todosPagos = pedido.payments.every((p) => p.status === 'PAGO');
    const total = pedido.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return todosPagos && total >= 250;
  });

  const totalVendasValidas = pedidosValidos.length;

  // ⚙️ Checa quantos bônus já existem nesse período
  const bonusExistentes = await prisma.bonus.findMany({
    where: {
      userId,
      createdAt: {
        gte: tresMesesAtras,
      },
    },
  });

  const quantidadeBonus200 = bonusExistentes.filter((b) => b.type.startsWith('META')).length;
  const temHotel = bonusExistentes.find((b) => b.type === 'HOTEL_MAJESTIC');

  // 🎯 Calcula se precisa gerar bônus de R$200
  const bonusAConceder = Math.floor(totalVendasValidas / 10);

  if (bonusAConceder > quantidadeBonus200) {
    const qtdNovos = bonusAConceder - quantidadeBonus200;
    for (let i = 1; i <= qtdNovos; i++) {
      await prisma.bonus.create({
        data: {
          userId,
          type: `META${(quantidadeBonus200 + i) * 10}`,
          value: 200,
          status: 'PENDENTE',
        },
      });
    }
  }

  // 🏨 Se fez 60 vendas, dá bônus do hotel
  if (totalVendasValidas >= 60 && !temHotel) {
    await prisma.bonus.create({
      data: {
        userId,
        type: 'HOTEL_MAJESTIC',
        value: 0,
        status: 'PENDENTE',
      },
    });
  }
};

module.exports = checkBonus;
