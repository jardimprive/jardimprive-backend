'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Commission {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  orderId: string;
  user: {
    name: string;
    email: string;
  };
}

export default function CommissionsAdminPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);

  const fetchCommissions = async () => {
    try {
      const res = await api.get('/commission/admin');
      setCommissions(res.data);
    } catch (err) {
      console.error('Erro ao buscar comissões:', err);
    }
  };

  const marcarComoPago = async (id: string) => {
    try {
      await api.patch(`/commission/${id}`, { status: 'PAGO' });
      fetchCommissions();
    } catch (err) {
      console.error('Erro ao atualizar comissão:', err);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  return (
    <Card className="mx-4 sm:mx-6 max-w-4xl">
      <CardHeader>
        <CardTitle>💰 Comissões (Admin)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full mt-4 text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted">
                <th className="py-2 px-2 sm:px-4">Vendedora</th>
                <th className="py-2 px-2 sm:px-4">Pedido</th>
                <th className="py-2 px-2 sm:px-4">Valor</th>
                <th className="py-2 px-2 sm:px-4">Data</th>
                <th className="py-2 px-2 sm:px-4">Status</th>
                <th className="py-2 px-2 sm:px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b even:bg-gray-50">
                  <td className="py-2 px-2 sm:px-4">{c.user.name}</td>
                  <td className="py-2 px-2 sm:px-4 break-all">{c.orderId}</td>
                  <td className="py-2 px-2 sm:px-4">R$ {c.amount.toFixed(2)}</td>
                  <td className="py-2 px-2 sm:px-4">{format(new Date(c.createdAt), 'dd/MM/yyyy')}</td>
                  <td className="py-2 px-2 sm:px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        c.status === 'PAGO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:px-4 whitespace-nowrap">
                    {c.status !== 'PAGO' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => marcarComoPago(c.id)}
                      >
                        Marcar como pago
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
