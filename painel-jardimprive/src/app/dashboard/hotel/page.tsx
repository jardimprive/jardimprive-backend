'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface Reserva {
  id: string;
  date: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function HotelAdminPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const fetchReservas = async () => {
    try {
      const res = await api.get('/hotel/admin/todas');
      setReservas(res.data);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      alert('Erro ao buscar reservas de hotel.');
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return (
    <Card className="p-4 max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>🏨 Reservas de Diárias no Hotel (Admin)</CardTitle>
      </CardHeader>
      <CardContent>
        {reservas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma reserva encontrada.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full mt-4 text-sm border rounded table-auto">
              <thead className="bg-gray-50">
                <tr className="text-left border-b">
                  <th className="py-3 px-4">Vendedora</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Data Agendada</th>
                  <th className="py-3 px-4">ID Usuária</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 max-w-xs truncate">{r.user.name}</td>
                    <td className="py-2 px-4 max-w-xs truncate">{r.user.email}</td>
                    <td className="py-2 px-4 whitespace-nowrap">{format(new Date(r.date), 'dd/MM/yyyy')}</td>
                    <td className="py-2 px-4 whitespace-nowrap">{r.user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
