'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Pedido {
  id: string;
  status: string;
  vendedora: string;
  total: number;
  data: string;
}

export default function DashboardAdminPage() {
  const [data, setData] = useState({
    totalVendedoras: 0,
    totalPedidos: 0,
    totalVendas: 0,
    totalComissoes: 0,
    totalBonus: 0,
    ultimosPedidos: [] as Pedido[],
    pedidosMensais: [] as { mes: string; total: number }[],
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard admin:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 🧾 Totais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>👥 Vendedoras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalVendedoras}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>📦 Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalPedidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>💰 Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {data.totalVendas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>💸 Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {data.totalComissoes.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>🎁 Bônus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ {data.totalBonus.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* 📈 Gráfico de Vendas Mensais */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Vendas dos Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.pedidosMensais}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 📋 Últimos Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>🕓 Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4">ID</th>
                  <th className="py-2 px-4">Vendedora</th>
                  <th className="py-2 px-4">Valor</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimosPedidos.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 px-4">{p.id}</td>
                    <td className="py-2 px-4">{p.vendedora}</td>
                    <td className="py-2 px-4">R$ {p.total.toFixed(2)}</td>
                    <td className="py-2 px-4">{p.status}</td>
                    <td className="py-2 px-4">
                      {format(new Date(p.data), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
