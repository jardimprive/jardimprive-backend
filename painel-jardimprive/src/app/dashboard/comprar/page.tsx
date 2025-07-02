'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  variations: {
    id: string;
    size: string;
    price: number;
    stock: number;
  }[];
}

interface CarrinhoItem {
  variationId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function ComprarPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [quantidades, setQuantidades] = useState<{ [variationId: string]: number }>({});

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const res = await api.get('/products');
        const ativos = res.data.filter((p: Product) => p.active);
        setProdutos(ativos);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      }
    };

    fetchProdutos();
  }, []);

  const adicionarAoCarrinho = (produto: Product, variacaoId: string) => {
    const variacao = produto.variations.find((v) => v.id === variacaoId);
    if (!variacao) return;

    const quantidade = quantidades[variacaoId] || 1;
    if (quantidade < 1) return alert('Quantidade inválida.');
    if (quantidade > variacao.stock) return alert('Estoque insuficiente.');

    const novoItem: CarrinhoItem = {
      variationId: variacao.id,
      name: produto.name,
      size: variacao.size,
      price: variacao.price,
      quantity: quantidade,
    };

    const carrinhoAtual: CarrinhoItem[] = JSON.parse(localStorage.getItem('carrinho') || '[]');

    const existente = carrinhoAtual.find((i) => i.variationId === novoItem.variationId);
    if (existente) {
      existente.quantity += novoItem.quantity;
    } else {
      carrinhoAtual.push(novoItem);
    }

    localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
    alert('Produto adicionado ao carrinho!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🛍️ Comprar Produtos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {produtos.map((produto) => (
          <div key={produto.id} className="border p-4 rounded">
            <h2 className="font-bold text-lg">{produto.name}</h2>
            <p className="text-sm text-muted-foreground mb-2">{produto.description}</p>

            {produto.variations.map((v) => (
              <div
                key={v.id}
                className="flex flex-col md:flex-row md:items-center justify-between text-sm border-t pt-2 mt-2 gap-2"
              >
                <p>
                  {v.size} • R$ {v.price.toFixed(2)} • Estoque: {v.stock}
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={v.stock}
                    className="w-20"
                    value={quantidades[v.id] || 1}
                    onChange={(e) =>
                      setQuantidades((prev) => ({
                        ...prev,
                        [v.id]: parseInt(e.target.value),
                      }))
                    }
                  />
                  <Button
                    size="sm"
                    onClick={() => adicionarAoCarrinho(produto, v.id)}
                    disabled={v.stock === 0}
                  >
                    {v.stock === 0 ? 'Esgotado' : 'Comprar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
