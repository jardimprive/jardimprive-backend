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
    <Card>
      <CardHeader>
        <CardTitle>🏨 Reservas do Hotel (Admin)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Vendedora</th>
                <th className="py-2 px-4">E-mail</th>
                <th className="py-2 px-4">Data Agendada</th>
                <th className="py-2 px-4">ID</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2 px-4">{r.user.name}</td>
                  <td className="py-2 px-4">{r.user.email}</td>
                  <td className="py-2 px-4">{format(new Date(r.date), 'dd/MM/yyyy')}</td>
                  <td className="py-2 px-4">{r.user.id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {reservas.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Nenhuma reserva encontrada.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
