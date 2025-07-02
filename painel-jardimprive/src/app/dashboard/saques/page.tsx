'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Saque {
  id: string;
  amount: number;
  status: string;
  pixKey: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function SaquesAdminPage() {
  const [saques, setSaques] = useState<Saque[]>([]);

  const fetchSaques = async () => {
    try {
      const res = await api.get('/withdrawal/admin');
      setSaques(res.data);
    } catch (err) {
      console.error('Erro ao buscar saques:', err);
      alert('Erro ao buscar saques.');
    }
  };

  const atualizarStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/withdrawal/${id}`, { status });
      fetchSaques();
    } catch (err) {
      console.error('Erro ao atualizar status do saque:', err);
      alert('Erro ao atualizar o status.');
    }
  };

  useEffect(() => {
    fetchSaques();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏦 Pedidos de Saque</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Vendedora</th>
                <th className="py-2 px-4">Valor</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">PIX</th>
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {saques.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="py-2 px-4">{s.user.name}</td>
                  <td className="py-2 px-4">R$ {s.amount.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    <Badge
                      variant={
                        s.status === 'PENDENTE'
                          ? 'default'
                          : s.status === 'APROVADO'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {s.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-2 px-4">{s.pixKey}</td>
                  <td className="py-2 px-4">
                    {format(new Date(s.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-2 px-4">
                    {s.status === 'PENDENTE' && (
                      <div className="flex flex-col md:flex-row gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => atualizarStatus(s.id, 'APROVADO')}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => atualizarStatus(s.id, 'RECUSADO')}
                        >
                          Recusar
                        </Button>
                      </div>
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
