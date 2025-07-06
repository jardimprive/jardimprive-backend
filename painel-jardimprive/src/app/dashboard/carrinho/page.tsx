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
    try {
      const saved = localStorage.getItem('carrinho');
      if (saved) {
        setCarrinho(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem('carrinho');
      setCarrinho([]);
    }
  }, []);

  const atualizarQuantidade = (index: number, novaQuantidade: number) => {
    const quantidade = Math.max(1, Math.floor(novaQuantidade));
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
    <Card className="mx-4 sm:mx-6 max-w-4xl">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>🛒 Carrinho</CardTitle>
        {carrinho.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:gap-2 gap-1 w-full md:w-auto">
            <Button variant="outline" className="w-full sm:w-auto" onClick={limparCarrinho}>
              Limpar Carrinho
            </Button>
            <Button className="w-full sm:w-auto" onClick={() => router.push('/dashboard/checkout')}>
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
                key={item.variationId + index}
                className="border rounded p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
              >
                <div>
                  <p className="font-semibold text-base">{item.name} - {item.size}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor={`quantidade-${index}`} className="sr-only">
                    Quantidade de {item.name}
                  </label>
                  <input
                    id={`quantidade-${index}`}
                    type="number"
                    min={1}
                    step={1}
                    value={item.quantity}
                    onChange={(e) => atualizarQuantidade(index, Number(e.target.value))}
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

            <div className="text-right font-bold mt-4 text-lg">
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
