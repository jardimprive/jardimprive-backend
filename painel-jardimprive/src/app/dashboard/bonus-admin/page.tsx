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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Bonus {
  id: string;
  value: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function BonusAdminPage() {
  const [bonusList, setBonusList] = useState<Bonus[]>([]);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const fetchBonuses = async () => {
    try {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await api.get('/bonus', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBonusList(res.data);
    } catch (err) {
      console.error('Erro ao buscar bônus:', err);
      router.push('/login');
    }
  };

  const marcarComoPago = async (id: string) => {
    try {
      if (loadingId) return; // evita chamadas paralelas
      setLoadingId(id);

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await api.patch(
        `/payments/bonus/${id}`,
        { status: 'PAGO' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchBonuses();
    } catch (err) {
      console.error('Erro ao marcar bônus como pago:', err);
      alert('Erro ao atualizar o status do bônus.');
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const bonusesFiltrados = bonusList.filter(
    (b) =>
      b.user.name.toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="mx-4 sm:mx-6 max-w-full overflow-x-auto">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle>🎁 Bônus das Vendedoras</CardTitle>
        <div className="w-full sm:w-64">
          <Label htmlFor="search">Buscar por nome ou e-mail</Label>
          <Input
            id="search"
            placeholder="Digite para filtrar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        {bonusesFiltrados.length === 0 ? (
          <p>Nenhum bônus encontrado.</p>
        ) : (
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">Vendedora</th>
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">E-mail</th>
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">Valor</th>
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">Status</th>
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">Data</th>
                <th className="py-2 px-3 sm:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bonusesFiltrados.map((b) => (
                <tr key={b.id} className="border-b even:bg-gray-50">
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">{b.user.name}</td>
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">{b.user.email}</td>
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">
                    R$ {b.value.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">
                    <Badge
                      className={
                        b.status === 'PENDENTE'
                          ? 'bg-gray-100 text-gray-800'
                          : b.status === 'PAGO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {b.status}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">
                    {format(new Date(b.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-2 px-3 sm:px-4 whitespace-nowrap">
                    {b.status === 'PENDENTE' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => marcarComoPago(b.id)}
                        disabled={loadingId === b.id}
                      >
                        {loadingId === b.id ? 'Atualizando...' : 'Marcar como PAGO'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
