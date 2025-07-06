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
  const [quantidades, setQuantidades] = useState<{ [variationId: string]: number }>({});
  const [erro, setErro] = useState<string | null>(null);

  // Carregar produtos e carrinho do localStorage na inicialização
  useEffect(() => {
    fetchProdutos();

    // Verificar se estamos no ambiente de cliente (navegador)
    if (typeof window !== 'undefined') {
      const carrinhoStorage = localStorage.getItem('carrinho');
      if (carrinhoStorage) {
        try {
          setCarrinho(JSON.parse(carrinhoStorage));
        } catch {
          setCarrinho([]);
        }
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    // Verificar se estamos no ambiente de cliente (navegador)
    if (typeof window !== 'undefined') {
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }
  }, [carrinho]);

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/products');
      const ativos = res.data.filter((p: Product) => p.active);
      setProdutos(ativos);
    } catch (err) {
      setErro('Erro ao carregar produtos.');
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const adicionarAoCarrinho = (produto: Product, variacaoId: string) => {
    const variacao = produto.variations.find((v) => v.id === variacaoId);
    const qtd = quantidades[variacaoId] || 1;

    if (!variacao || qtd <= 0 || qtd > variacao.stock) {
      alert('Quantidade inválida ou estoque insuficiente.');
      return;
    }

    const novoItem: ItemCarrinho = {
      variationId: variacao.id,
      name: produto.name,
      size: variacao.size,
      price: variacao.price,
      quantity: qtd,
    };

    setCarrinho((prev) => [...prev, novoItem]);
    setQuantidades((prev) => ({ ...prev, [variacaoId]: 1 }));
  };

  const removerItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const finalizarPedido = () => {
    if (total < 250) {
      alert('O valor mínimo do pedido é R$250,00.');
      return;
    }
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    window.location.href = '/dashboard/checkout';
  };

  return (
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      {/* Erro ao carregar produtos */}
      {erro && <p className="text-sm text-red-500">{erro}</p>}

      {/* Produtos */}
      <Card>
        <CardHeader>
          <CardTitle>🛍️ Produtos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {produtos.length === 0 ? (
            <p>Sem produtos disponíveis.</p>
          ) : (
            produtos.map((produto) => (
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

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Label htmlFor={`qtd-${v.id}`}>Qtd</Label>
                        <Input
                          type="number"
                          id={`qtd-${v.id}`}
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
                          className="mt-2 sm:mt-0"
                          onClick={() => adicionarAoCarrinho(produto, v.id)}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Carrinho */}
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
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded"
                  >
                    <div>
                      {item.name} - {item.size} • {item.quantity} un • R${' '}
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2 sm:mt-0"
                      onClick={() => removerItem(index)}
                    >
                      Remover
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="text-right font-bold text-lg mt-4">
                Total: R$ {total.toFixed(2)}
              </div>

              <Button
                className="mt-4 w-full sm:w-auto"
                onClick={finalizarPedido}
                disabled={carrinho.length === 0}
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
