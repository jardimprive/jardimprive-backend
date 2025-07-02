'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Pedido {
  id: string;
  status: string;
  createdAt: string;
  trackingCode: string | null;
  items: {
    quantity: number;
    price: number;
    variation: {
      size: string;
      product: {
        name: string;
      };
    };
  }[];
  payments?: {
    id: string;
    type: string;
    amount: number;
    status: string;
    dueDate: string;
  }[];
}

export default function PedidoDetalhadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const fetchPedido = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setPedido(res.data);
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
    }
  };

  useEffect(() => {
    if (id) fetchPedido();
  }, [id]);

  if (!pedido) return <p>Carregando...</p>;

  const total = pedido.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <CardTitle>📦 Detalhes do Pedido</CardTitle>
        <Button onClick={() => router.push('/dashboard/meus-pedidos')}>
          Voltar
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        <p><strong>ID do Pedido:</strong> {pedido.id}</p>
        <p><strong>Status:</strong> {pedido.status}</p>
        <p><strong>Data:</strong> {format(new Date(pedido.createdAt), 'dd/MM/yyyy')}</p>
        {pedido.trackingCode && (
          <p><strong>Código de Rastreio:</strong> {pedido.trackingCode}</p>
        )}

        <hr />

        <h3 className="font-semibold">Itens do Pedido:</h3>
        <ul className="space-y-2">
          {pedido.items.map((item, idx) => (
            <li key={idx} className="border rounded p-2">
              <p><strong>Produto:</strong> {item.variation.product.name}</p>
              <p><strong>Tamanho:</strong> {item.variation.size}</p>
              <p><strong>Preço unitário:</strong> R$ {item.price.toFixed(2)}</p>
              <p><strong>Quantidade:</strong> {item.quantity}</p>
              <p><strong>Total:</strong> R$ {(item.price * item.quantity).toFixed(2)}</p>
            </li>
          ))}
        </ul>

        <hr />

        <p className="text-right text-lg font-bold">Total do Pedido: R$ {total.toFixed(2)}</p>

        {pedido.payments && pedido.payments.length > 0 && (
          <>
            <hr />
            <h3 className="font-semibold">Pagamentos:</h3>
            <ul className="space-y-2">
              {pedido.payments.map((p) => (
                <li key={p.id} className="border rounded p-2 bg-zinc-50">
                  <p><strong>Tipo:</strong> {p.type}</p>
                  <p><strong>Valor:</strong> R$ {p.amount.toFixed(2)}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p><strong>Vencimento:</strong> {format(new Date(p.dueDate), 'dd/MM/yyyy')}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
