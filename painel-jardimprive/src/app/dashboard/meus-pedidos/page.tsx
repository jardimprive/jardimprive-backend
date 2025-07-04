'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

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
}

export default function MeusPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const router = useRouter();

  const fetchPedidos = async () => {
    try {
      const res = await api.get('/orders');
      setPedidos(res.data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    const buscaLower = busca.toLowerCase();
    const matchId = p.id.toLowerCase().includes(buscaLower);
    const matchProduto = p.items.some((item) =>
      item.variation.product.name.toLowerCase().includes(buscaLower)
    );
    const statusMatch = statusFiltro ? p.status === statusFiltro : true;

    return (matchId || matchProduto) && statusMatch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧾 Meus Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 🔍 Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por ID ou produto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger>
                <SelectValue>Filtrar por status</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="AGUARDANDO_APROVACAO">AGUARDANDO_APROVACAO</SelectItem>
                <SelectItem value="APROVADO">APROVADO</SelectItem>
                <SelectItem value="ENVIADO">ENVIADO</SelectItem>
                <SelectItem value="EM_TRANSITO">EM_TRANSITO</SelectItem>
                <SelectItem value="ENTREGUE">ENTREGUE</SelectItem>
                <SelectItem value="CANCELADO">CANCELADO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <p>Você ainda não realizou pedidos.</p>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((p) => {
              const total = p.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              const quantidade = p.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );

              return (
                <div
                  key={p.id}
                  className="border p-4 rounded-md shadow-sm text-sm bg-white"
                >
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold">Pedido: {p.id}</p>
                    <p>{format(new Date(p.createdAt), 'dd/MM/yyyy')}</p>
                  </div>
                  <p>Status: <strong>{p.status}</strong></p>
                  <p>Produtos: {quantidade}</p>
                  <p>Total: R$ {total.toFixed(2)}</p>

                  <div className="mt-2">
                    <p className="font-semibold">Itens:</p>
                    <ul className="list-disc ml-5">
                      {p.items.map((item, idx) => (
                        <li key={idx}>
                          {item.variation.product.name} - {item.variation.size} (
                          {item.quantity}x R$ {item.price.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>

                  {p.trackingCode && (
                    <p className="mt-2">
                      Rastreio:{' '}
                      <span className="font-mono text-blue-700">{p.trackingCode}</span>
                    </p>
                  )}

                  <div className="mt-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/meus-pedidos/${p.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
