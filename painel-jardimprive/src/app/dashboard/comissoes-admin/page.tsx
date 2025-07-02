'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default function ComissoesAdminPage() {
  const [comissoes, setComissoes] = useState<Commission[]>([]);

  const fetchComissoes = async () => {
    try {
      const res = await api.get('/commission');
      setComissoes(res.data);
    } catch (err) {
      console.error('Erro ao buscar comissões:', err);
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/commission/${id}`, { status });
      fetchComissoes();
    } catch (err) {
      console.error('Erro ao atualizar status da comissão:', err);
    }
  };

  useEffect(() => {
    fetchComissoes();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Gerenciar Comissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Vendedora</th>
                <th className="py-2 px-4">E-mail</th>
                <th className="py-2 px-4">Valor</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Pedido</th>
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {comissoes.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-4">{c.user.name}</td>
                  <td className="py-2 px-4">{c.user.email}</td>
                  <td className="py-2 px-4">R$ {c.amount.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant="default"
                      className={
                        c.status === 'PAGA'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-4">{c.orderId}</td>
                  <td className="py-2 px-4">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4">
                    {c.status === 'PENDENTE' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => atualizarStatus(c.id, 'PAGA')}
                      >
                        Marcar como PAGA
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
