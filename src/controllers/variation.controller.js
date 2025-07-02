const prisma = require('../config/prisma');

// ✅ Atualizar uma variação pelo ID
exports.updateVariation = async (req, res) => {
  const { id } = req.params;
  const { sku, size, price, stock } = req.body;

  try {
    const variation = await prisma.productVariation.update({
      where: { id },
      data: {
        sku,
        size,
        price: parseFloat(price),
        stock: parseInt(stock),
      },
    });

    res.json({ message: 'Variação atualizada com sucesso', variation });
  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    res.status(400).json({
      error: 'Erro ao atualizar variação',
      details: error.message,
    });
  }
};
