'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface ItemCarrinho {
  variationId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function ProdutosParaPedidoPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/products');
      const ativos = res.data.filter((p: Product) => p.active);
      setProdutos(ativos);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const adicionarAoCarrinho = (produto: Product, variacaoId: string, quantidade: number) => {
    const variacao = produto.variations.find((v) => v.id === variacaoId);
    if (!variacao || quantidade <= 0 || quantidade > variacao.stock) return;

    const novoItem: ItemCarrinho = {
      variationId: variacao.id,
      name: produto.name,
      size: variacao.size,
      price: variacao.price,
      quantity: quantidade,
    };

    setCarrinho((prev) => [...prev, novoItem]);
  };

  const removerItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🛍️ Produtos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="border p-4 rounded space-y-2">
              <h2 className="font-bold text-lg">{produto.name}</h2>
              <p className="text-sm text-muted-foreground">{produto.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {produto.variations.map((v) => (
                  <div key={v.id} className="border rounded p-3 flex flex-col gap-2">
                    <div>
                      <strong>{v.size}</strong> - R$ {v.price.toFixed(2)}<br />
                      Estoque: {v.stock}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const quantidade = parseInt((form.elements.namedItem('quantidade') as HTMLInputElement).value);
                        adicionarAoCarrinho(produto, v.id, quantidade);
                        form.reset();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Label htmlFor="quantidade">Qtd</Label>
                      <Input
                        type="number"
                        name="quantidade"
                        min={1}
                        max={v.stock}
                        className="w-20"
                      />
                      <Button type="submit">Adicionar</Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 🛒 Carrinho */}
      <Card>
        <CardHeader>
          <CardTitle>🧾 Carrinho</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {carrinho.length === 0 ? (
            <p className="text-muted-foreground">Nenhum item no carrinho.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {carrinho.map((item, index) => (
                  <li key={index} className="flex justify-between items-center border p-2 rounded">
                    <div>
                      {item.name} - {item.size} • {item.quantity} un • R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => removerItem(index)}>
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="text-right font-bold text-lg mt-4">
                Total: R$ {carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
              </div>

              <Button
                className="mt-4"
                onClick={() =>
                  alert('✅ Aqui depois redirecionamos para a próxima etapa do pedido (endereço e forma de pagamento).')
                }
              >
                Finalizar Pedido
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
