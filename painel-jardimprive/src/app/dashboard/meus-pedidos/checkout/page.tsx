'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import api from '@/lib/api';

interface ItemCarrinho {
  variationId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

type Pagamento = 'AVISTA' | 'PARCELADO' | 'CARTAO';

export default function CheckoutPage() {
  const router = useRouter();

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<Pagamento>('AVISTA');

  useEffect(() => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      setCarrinho(JSON.parse(saved));
    }
  }, []);

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const finalizarPedido = async () => {
    if (!endereco) {
      alert('Informe o endereço de entrega.');
      return;
    }

    const payload = {
      items: carrinho.map((item) => ({
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
      })),
      address: endereco,
      paymentMethod: formaPagamento,
    };

    try {
      if (formaPagamento === 'CARTAO') {
        const res = await api.post('/orders/checkout', payload);
        if (res.data.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          alert('Erro ao gerar link de pagamento.');
        }
      } else {
        const res = await api.post('/orders', {
          ...payload,
          paymentType: formaPagamento,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
        });

        alert('Pedido criado com sucesso!');
        localStorage.removeItem('carrinho');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      alert('Erro ao criar pedido');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📦 Finalizar Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo dos itens */}
        <div className="space-y-2">
          <h2 className="font-semibold">Itens:</h2>
          <ul className="space-y-1 text-sm">
            {carrinho.map((item, index) => (
              <li key={index}>
                {item.name} - {item.size} • {item.quantity} un • R$ {item.price.toFixed(2)} cada
              </li>
            ))}
          </ul>
          <p className="text-right font-bold">Total: R$ {total.toFixed(2)}</p>
        </div>

        {/* Endereço */}
        <div>
          <Label>Endereço de Entrega</Label>
          <Input
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua, número, bairro, cidade..."
            required
          />
        </div>

        {/* Forma de pagamento */}
        <div>
          <Label>Forma de Pagamento</Label>
          <RadioGroup
            value={formaPagamento}
            onValueChange={(val) => setFormaPagamento(val as Pagamento)}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="AVISTA" id="avista" />
              <Label htmlFor="avista">À vista (boleto ou manual)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PARCELADO" id="parcelado" />
              <Label htmlFor="parcelado">50% entrada + 50% em 30 dias</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CARTAO" id="cartao" />
              <Label htmlFor="cartao">Cartão de Crédito (Mercado Pago)</Label>
            </div>
          </RadioGroup>
        </div>

        <Button className="mt-4 w-full" onClick={finalizarPedido}>
          Finalizar Pedido
        </Button>
      </CardContent>
    </Card>
  );
}
