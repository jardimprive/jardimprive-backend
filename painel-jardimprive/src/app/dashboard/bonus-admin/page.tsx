'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

  const fetchBonuses = async () => {
    try {
      const res = await api.get('/bonus');
      setBonusList(res.data);
    } catch (err) {
      console.error('Erro ao buscar bônus:', err);
    }
  };

  const marcarComoPago = async (id: string) => {
    try {
      await api.patch(`/payments/bonus/${id}`, { status: 'PAGO' });
      fetchBonuses();
    } catch (err) {
      console.error('Erro ao marcar bônus como pago:', err);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const bonusesFiltrados = bonusList.filter((b) =>
    b.user.name.toLowerCase().includes(search.toLowerCase()) ||
    b.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎁 Bônus das Vendedoras</CardTitle>
        <div className="mt-4">
          <Label>Buscar por nome ou e-mail</Label>
          <Input
            placeholder="Digite para filtrar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
                <th className="py-2 px-4">Data</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bonusesFiltrados.map((b) => (
                <tr key={b.id} className="border-b">
                  <td className="py-2 px-4">{b.user.name}</td>
                  <td className="py-2 px-4">{b.user.email}</td>
                  <td className="py-2 px-4">R$ {b.value.toFixed(2)}</td>
                  <td className="py-2 px-4">
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
                  <td className="py-2 px-4">
                    {format(new Date(b.createdAt), 'dd/MM/yyyy')}
                  </td>
                  <td className="py-2 px-4">
                    {b.status === 'PENDENTE' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => marcarComoPago(b.id)}
                      >
                        Marcar como PAGO
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
