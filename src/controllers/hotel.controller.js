const prisma = require('../config/prisma');

// ✅ Vendedora agenda sua diária
exports.agendarDiaria = async (req, res) => {
  const { date } = req.body;
  const userId = req.user.id;

  if (!date) {
    return res.status(400).json({ error: 'Data da diária é obrigatória' });
  }

  try {
    // Verifica se já existe reserva
    const existente = await prisma.hotelBooking.findUnique({
      where: { userId },
    });

    if (existente) {
      return res.status(400).json({ error: 'Você já agendou sua diária.' });
    }

    // Cria a reserva
    const reserva = await prisma.hotelBooking.create({
      data: {
        userId,
        date: new Date(date),
      },
    });

    res.status(201).json({ message: 'Diária agendada com sucesso!', reserva });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao agendar diária', details: err.message });
  }
};

// ✅ Vendedora consulta a própria diária
exports.verMinhaDiaria = async (req, res) => {
  const userId = req.user.id;

  try {
    const reserva = await prisma.hotelBooking.findUnique({
      where: { userId },
    });

    if (!reserva) {
      return res.json({ message: 'Nenhuma diária agendada ainda.' });
    }

    res.json(reserva);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar diária', details: err.message });
  }
};

// ✅ ADMIN: ver todos os agendamentos
exports.verTodasAsReservas = async (req, res) => {
  try {
    const reservas = await prisma.hotelBooking.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            id: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json(reservas);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar reservas', details: err.message });
  }
};
// ✅ Verifica se pode agendar hotel (60 vendas válidas)
exports.checarMetaHotel = async (req, res) => {
  const userId = req.user.id;
  const tresMesesAtras = new Date();
  tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);

  try {
    const vendasValidas = await prisma.order.findMany({
      where: {
        userId,
        status: 'ENTREGUE',
        createdAt: {
          gte: tresMesesAtras,
        },
        payments: {
          some: {
            status: 'PAGO',
          },
        },
      },
      include: {
        payments: true,
      },
    });

    const totalVendas = vendasValidas.filter((pedido) => {
      const totalPago = pedido.payments.reduce(
        (sum, p) => (p.status === 'PAGO' ? sum + p.amount : sum),
        0
      );
      return totalPago >= 250;
    });

    const liberado = totalVendas.length >= 60;
    res.json({ liberado });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao verificar meta', details: err.message });
  }
};
