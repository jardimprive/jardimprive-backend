'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ItemCarrinho {
  variationId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function CarrinhoPage() {
  const router = useRouter();
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      setCarrinho(JSON.parse(saved));
    }
  }, []);

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    const quantidade = parseInt(novaQuantidade.toString());
    if (!quantidade || quantidade <= 0) return;

    const novoCarrinho = [...carrinho];
    novoCarrinho[index].quantity = quantidade;
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
  };

  const removerItem = (index: number) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho));
  };

  const limparCarrinho = () => {
    if (confirm('Deseja realmente esvaziar o carrinho?')) {
      localStorage.removeItem('carrinho');
      setCarrinho([]);
    }
  };

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle>🛒 Carrinho</CardTitle>
        {carrinho.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={limparCarrinho}>
              Limpar Carrinho
            </Button>
            <Button onClick={() => router.push('/dashboard/checkout')}>
              Finalizar Pedido
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {carrinho.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div className="space-y-4">
            {carrinho.map((item, index) => (
              <div
                key={index}
                className="border p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-2"
              >
                <div>
                  <p className="font-semibold">
                    {item.name} - {item.size}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      atualizarQuantidade(index, parseInt(e.target.value))
                    }
                    className="w-16 border rounded px-2 text-sm"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removerItem(index)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            <div className="text-right font-bold mt-4">
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
