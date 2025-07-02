const prisma = require('../config/prisma');

exports.createProduct = async (req, res) => {
  const { name, description, image, active, variations } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        active,
        variations: {
          create: variations.map((v) => ({
            sku: v.sku,
            size: v.size,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
      include: { variations: true },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar produto', details: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { variations: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar produtos', details: error.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variations: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao buscar produto', details: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, image, active, variations } = req.body;

  try {
    // Verifica se o produto existe
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Atualiza os dados principais do produto
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        image,
        active,
      },
    });

    // Remove todas as variações antigas
    await prisma.productVariation.deleteMany({
      where: { productId: id },
    });

    // Cria as novas variações
    if (variations && variations.length > 0) {
      await prisma.productVariation.createMany({
        data: variations.map((v) => ({
          productId: id,
          sku: v.sku,
          size: v.size,
          price: v.price,
          stock: v.stock,
        })),
      });
    }

    res.json({ message: 'Produto e variações atualizados com sucesso!' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica se existe
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar produto', details: error.message });
  }
};
