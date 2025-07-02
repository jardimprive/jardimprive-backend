'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Pedido {
  id: string;
  createdAt: string;
  status: string;
  paymentType: string;
  user: {
    name: string;
    email: string;
  };
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
}

export default function PedidosAdminPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [paymentFiltro, setPaymentFiltro] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const router = useRouter();

  const fetchPedidos = async () => {
    try {
      const params: any = {};

      if (statusFiltro) params.status = statusFiltro;
      if (paymentFiltro) params.paymentType = paymentFiltro;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/orders/admin', { params });
      setPedidos(res.data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, [statusFiltro, paymentFiltro, startDate, endDate]);

  const exportarCSV = async () => {
    try {
      const res = await api.get('/admin/export/pedidos', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio-pedidos.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      alert('Erro ao exportar o relatório');
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    const buscaLower = busca.toLowerCase();
    const nomeMatch = p.user.name.toLowerCase().includes(buscaLower);
    const idMatch = p.id.toLowerCase().includes(buscaLower);
    return nomeMatch || idMatch;
  });

  return (
    <Card>
      <CardHeader className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>📦 Pedidos Recebidos</CardTitle>
        <Button onClick={exportarCSV}>⬇️ Exportar CSV</Button>
      </CardHeader>

      <CardContent>
        {/* 🔍 Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>Buscar por nome ou ID</Label>
            <Input
              placeholder="Digite algo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue>Todos os status</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="EM ANDAMENTO">EM ANDAMENTO</SelectItem>
                <SelectItem value="ENVIADO">ENVIADO</SelectItem>
                <SelectItem value="ENTREGUE">ENTREGUE</SelectItem>
                <SelectItem value="CANCELADO">CANCELADO</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Pagamento</Label>
            <Select value={paymentFiltro} onValueChange={setPaymentFiltro}>
              <SelectTrigger>
                <SelectValue>Todas as formas</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="AVISTA">À vista</SelectItem>
                <SelectItem value="PARCELADO">Parcelado</SelectItem>
                <SelectItem value="CARTAO">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>De</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label>Até</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 🧾 Tabela */}
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Vendedora</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Pagamento</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((p) => {
                const total = p.items.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 px-4">{p.id}</td>
                    <td className="py-2 px-4">{p.user.name}</td>
                    <td className="py-2 px-4">{p.status}</td>
                    <td className="py-2 px-4">{p.paymentType}</td>
                    <td className="py-2 px-4">R$ {total.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      {format(new Date(p.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-2 px-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(`/dashboard/pedidos/${p.id}`)
                        }
                      >
                        👁 Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pedidosFiltrados.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Nenhum pedido encontrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
