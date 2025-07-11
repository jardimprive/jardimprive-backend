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
type MetodoEntrada = 'PIX' | 'CARTAO';

export default function CheckoutPage() {
  const router = useRouter();

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<Pagamento>('AVISTA');
  const [metodoEntrada, setMetodoEntrada] = useState<MetodoEntrada>('PIX');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('carrinho');
    if (saved) {
      setCarrinho(JSON.parse(saved));
    }
  }, []);

  const total = carrinho.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const finalizarPedido = async () => {
    if (!endereco.trim()) {
      alert('Informe o endereço de entrega.');
      return;
    }

    if (!['AVISTA', 'PARCELADO', 'CARTAO'].includes(formaPagamento)) {
      alert('Selecione uma forma de pagamento válida.');
      return;
    }

    const payload = {
      items: carrinho.map((item) => ({
        variationId: item.variationId,
        quantity: item.quantity,
        price: item.price,
      })),
      address: endereco,
    };

    try {
      setCarregando(true);
      setErro(null);

      if (formaPagamento === 'CARTAO') {
        const res = await api.post('/orders/checkout', {
          ...payload,
          paymentMethod: 'CARTAO',
        });
        if (res.data.checkoutUrl) {
          localStorage.removeItem('carrinho');
          window.location.href = res.data.checkoutUrl;
        } else {
          setErro('Erro ao gerar link de pagamento.');
        }
      }

      else if (formaPagamento === 'AVISTA') {
        const res = await api.post('/orders/pix', payload);
        if (res.data.checkoutUrl) {
          localStorage.removeItem('carrinho');
          window.location.href = res.data.checkoutUrl;
        } else {
          setErro('Erro ao gerar QR Code PIX.');
        }
      }

      else if (formaPagamento === 'PARCELADO') {
        const res = await api.post('/orders', {
          ...payload,
          paymentMethod: metodoEntrada,
        });

        if (res.data.checkoutUrl) {
          localStorage.removeItem('carrinho');
          window.location.href = res.data.checkoutUrl;
        } else {
          setErro('Erro ao gerar link de entrada parcelada.');
        }
      }

    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      setErro('Erro ao criar pedido.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📦 Finalizar Pedido</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 px-4 sm:px-6 md:px-8">
        {/* ✅ Itens do carrinho */}
        <div className="space-y-2">
          <h2 className="font-semibold">Itens no Carrinho:</h2>
          <ul className="space-y-1 text-sm">
            {carrinho.map((item, index) => (
              <li key={index}>
                {item.name} - {item.size} • {item.quantity} un •{' '}
                <strong>R$ {item.price.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <p className="text-right font-bold text-lg">
            Total: R$ {total.toFixed(2)}
          </p>
        </div>

        {/* 🏠 Endereço */}
        <div>
          <Label htmlFor="endereco">Endereço de Entrega</Label>
          <Input
            id="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Rua, número, bairro, cidade..."
          />
        </div>

        {/* 💳 Forma de pagamento */}
        <div>
          <Label>Forma de Pagamento</Label>
          <RadioGroup
            value={formaPagamento}
            onValueChange={(val) => setFormaPagamento(val as Pagamento)}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="AVISTA" id="avista" />
              <Label htmlFor="avista">PIX (à vista)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PARCELADO" id="parcelado" />
              <Label htmlFor="parcelado">50% agora + 50% em 30 dias</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CARTAO" id="cartao" />
              <Label htmlFor="cartao">Cartão de Crédito (Mercado Pago)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Se selecionou 50/50, escolha PIX ou Cartão para a entrada */}
        {formaPagamento === 'PARCELADO' && (
          <div>
            <Label>Como deseja pagar a entrada (50%)?</Label>
            <RadioGroup
              value={metodoEntrada}
              onValueChange={(val) => setMetodoEntrada(val as MetodoEntrada)}
              className="mt-3 space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PIX" id="entrada_pix" />
                <Label htmlFor="entrada_pix">PIX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CARTAO" id="entrada_cartao" />
                <Label htmlFor="entrada_cartao">Cartão</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Erro */}
        {erro && <p className="text-sm text-red-500">{erro}</p>}

        <Button
          className="mt-4 w-full"
          onClick={finalizarPedido}
          disabled={carregando}
        >
          {carregando ? 'Finalizando...' : 'Finalizar Pedido'}
        </Button>
      </CardContent>
    </Card>
  );
}
