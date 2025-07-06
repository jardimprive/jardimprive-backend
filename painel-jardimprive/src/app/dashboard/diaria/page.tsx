'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function DiariaPage() {
  const [reserva, setReserva] = useState<string | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [carregando, setCarregando] = useState(true);

  const fetchReserva = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/hotel/minha-diaria');
      setReserva(res.data.date);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setReserva(null);
      } else {
        alert('Erro ao buscar sua diária.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const agendarDiaria = async () => {
    if (!dataSelecionada) return alert('Escolha uma data válida.');

    try {
      await api.post('/hotel/agendar', { date: dataSelecionada });
      alert('Diária agendada com sucesso!');
      fetchReserva();
    } catch (err) {
      alert('Erro ao agendar sua diária.');
    }
  };

  useEffect(() => {
    fetchReserva();
  }, []);

  return (
    <Card className="p-6 max-w-md mx-auto"> {/* Container centralizado e largura max */}
      <CardHeader>
        <CardTitle>🏨 Agendamento de Diária no Hotel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {carregando ? (
          <p>Carregando...</p>
        ) : reserva ? (
          <div className="bg-green-50 p-4 rounded border text-green-800">
            <p className="font-medium">
              ✅ Você já agendou sua diária para:
              <br />
              <strong className="text-lg">
                {format(new Date(reserva), 'dd/MM/yyyy')}
              </strong>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Caso deseje alterar, entre em contato com o suporte.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              🎉 Parabéns! Você atingiu a meta e tem direito a 1 diária com tudo incluído em um hotel 5 estrelas.
            </p>

            <div className="space-y-2">
              <Label>Escolha a data da sua diária:</Label>
              <Input
                type="date"
                className="w-full"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />
            </div>

            <Button onClick={agendarDiaria} className="w-full sm:w-auto">
              Agendar Diária
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
