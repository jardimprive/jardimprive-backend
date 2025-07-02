'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

interface Item {
  quantity: number;
  price: number;
  variation: {
    size: string;
    product: {
      name: string;
    };
  };
}

interface Pedido {
  id: string;
  status: string;
  trackingCode: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: Item[];
}

export default function PedidoDetalhesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [status, setStatus] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  const fetchPedido = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setPedido(res.data);
      setStatus(res.data.status || '');
      setTrackingCode(res.data.trackingCode || '');
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
    }
  };

  useEffect(() => {
    if (id) fetchPedido();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.put(`/orders/${id}`, {
        status,
        trackingCode,
      });

      alert('Pedido atualizado com sucesso!');
      router.push('/dashboard/pedidos');
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
      alert('Erro ao atualizar pedido');
    }
  };

  if (!pedido) return <p>Carregando pedido...</p>;

  const total = pedido.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Card>
  <CardHeader>
    <CardTitle>🧾 Detalhes do Pedido</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* 🔹 Informações gerais do pedido */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>ID do Pedido</Label>
        <p className="font-mono">{pedido.id}</p>
      </div>
      <div>
        <Label>Data</Label>
        <p>{format(new Date(pedido.createdAt), 'dd/MM/yyyy')}</p>
      </div>
      <div>
        <Label>Vendedora</Label>
        <p>{pedido.user.name} ({pedido.user.email})</p>
      </div>
      <div>
        <Label>Total</Label>
        <p className="font-bold text-lg">R$ {total.toFixed(2)}</p>
      </div>
    </div>

    {/* 🔹 Lista de produtos */}
    <div>
      <Label className="mb-2 block">Produtos</Label>
      <ul className="space-y-2">
        {pedido.items.map((item, index) => (
          <li key={index} className="border p-2 rounded text-sm">
            {item.variation.product.name} - {item.variation.size} •{' '}
            {item.quantity} un • R$ {item.price.toFixed(2)} cada
          </li>
        ))}
      </ul>
    </div>

    {/* 🔹 Formulário de atualização */}
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Status do Pedido</Label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Selecione o status</option>
          <option value="EM ANDAMENTO">EM ANDAMENTO</option>
          <option value="ENVIADO">ENVIADO</option>
          <option value="ENTREGUE">ENTREGUE</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>
      </div>

      <div>
        <Label>Código de Rastreio</Label>
        <Input
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Ex: BR123456789SE"
        />
      </div>

      <Button type="submit">Salvar Alterações</Button>
    </form>
  </CardContent>
</Card>
  );
}
