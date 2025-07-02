'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

export default function VendedorasPage() {
  const [vendedoras, setVendedoras] = useState([]);
  const router = useRouter();

  const fetchVendedoras = async () => {
    try {
      const res = await api.get('/users/admin/all');
      setVendedoras(res.data);
    } catch (err) {
      console.error('Erro ao buscar vendedoras:', err);
    }
  };

  const toggleStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/users/admin/sellers/${id}/status`, {
        status: status === 'ATIVA' ? 'INATIVA' : 'ATIVA',
      });
      fetchVendedoras(); // Recarrega lista
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  useEffect(() => {
    fetchVendedoras();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle>👥 Gerenciar Vendedoras</CardTitle>

        <Button onClick={() => router.push('/dashboard/vendedoras/nova')}>
          ➕ Nova Vendedora
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Nome</th>
                <th className="py-2 px-4">E-mail</th>
                <th className="py-2 px-4">Telefone</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Bloqueado</th>
                <th className="py-2 px-4">Criado em</th>
                <th className="py-2 px-4">Ação</th>
              </tr>
            </thead>
            <tbody>
              {vendedoras.map((v: any) => (
                <tr key={v.id} className="border-b">
                  <td className="py-2 px-4">{v.name}</td>
                  <td className="py-2 px-4">{v.email}</td>
                  <td className="py-2 px-4">{v.phone}</td>
                  <td className="py-2 px-4">{v.status}</td>
                  <td className="py-2 px-4">{v.isBlocked ? 'Sim' : 'Não'}</td>
                  <td className="py-2 px-4">{format(new Date(v.createdAt), 'dd/MM/yyyy')}</td>
                  <td className="py-2 px-4 space-y-1">
                    {/* 🔁 Botão switch para status */}
                    <Switch
                      checked={v.status === 'ATIVA'}
                      onCheckedChange={() => toggleStatus(v.id, v.status)}
                    />
                    <br />
                    {/* 👁 Botão para ver perfil */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => router.push(`/dashboard/vendedoras/${v.id}`)}
                    >
                      👁 Ver perfil
                    </Button>
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
