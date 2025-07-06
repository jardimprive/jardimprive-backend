'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface Vendedora {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ATIVA' | 'INATIVA';
  isBlocked: boolean;
  createdAt: string;
}

export default function VendedorasPage() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchVendedoras = async () => {
    try {
      const res = await api.get('/users/admin/all');
      setVendedoras(res.data);
    } catch (err) {
      console.error('Erro ao buscar vendedoras:', err);
      if (typeof window !== 'undefined') {
        alert('Erro ao buscar vendedoras.'); // Substituir por toast futuramente
      }
    }
  };

  const toggleStatus = async (id: string, status: 'ATIVA' | 'INATIVA') => {
    setLoadingId(id);
    try {
      await api.patch(`/users/admin/sellers/${id}/status`, {
        status: status === 'ATIVA' ? 'INATIVA' : 'ATIVA',
      });
      await fetchVendedoras();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      if (typeof window !== 'undefined') {
        alert('Erro ao atualizar status da vendedora.'); // Substituir por toast futuramente
      }
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchVendedoras();
  }, []);

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>👥 Gerenciar Vendedoras</CardTitle>
          <Button onClick={() => router.push('/dashboard/vendedoras/nova')}>
            ➕ Nova Vendedora
          </Button>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-[700px] w-full text-sm text-left">
            <thead>
              <tr className="border-b bg-muted text-muted-foreground">
                <th className="py-2 px-4">Nome</th>
                <th className="py-2 px-4">E-mail</th>
                <th className="py-2 px-4">Telefone</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Bloqueado</th>
                <th className="py-2 px-4">Criado em</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendedoras.length > 0 ? (
                vendedoras.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-accent/40 transition">
                    <td className="py-2 px-4">{v.name}</td>
                    <td className="py-2 px-4 break-all">{v.email}</td>
                    <td className="py-2 px-4">{v.phone || '-'}</td>
                    <td className="py-2 px-4">{v.status}</td>
                    <td className="py-2 px-4">{v.isBlocked ? 'Sim' : 'Não'}</td>
                    <td className="py-2 px-4">
                      {format(new Date(v.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <Switch
                          checked={v.status === 'ATIVA'}
                          onCheckedChange={() => toggleStatus(v.id, v.status)}
                          disabled={loadingId === v.id}
                          aria-label={`Alternar status de ${v.name}`}
                          className={loadingId === v.id ? 'opacity-50' : ''}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/vendedoras/${v.id}`)}
                          aria-label={`Ver perfil de ${v.name}`}
                        >
                          👁 Ver perfil
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted-foreground">
                    Nenhuma vendedora cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
