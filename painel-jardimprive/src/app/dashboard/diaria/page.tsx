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

  // ✅ Verifica se já tem diária agendada
  const fetchReserva = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/hotel/minha-diaria');
      setReserva(res.data.date); // retorna string ISO
    } catch (err: any) {
      if (err.response?.status === 404) {
        setReserva(null); // nenhuma diária ainda
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
      fetchReserva(); // atualiza interface
    } catch (err) {
      alert('Erro ao agendar sua diária.');
    }
  };

  useEffect(() => {
    fetchReserva();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏨 Agendamento de Diária no Hotel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {carregando ? (
          <p>Carregando...</p>
        ) : reserva ? (
          <div>
            <p>
              ✅ Você já agendou sua diária para o dia:{' '}
              <strong>{format(new Date(reserva), 'dd/MM/yyyy')}</strong>
            </p>
            <p className="text-muted-foreground mt-1">
              Caso deseje alterar, entre em contato com o suporte.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              Parabéns! Você atingiu a meta e tem direito a 1 diária com tudo incluído em um hotel 5 estrelas.
            </p>
            <div>
              <Label>Escolha a data da sua diária</Label>
              <Input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />
            </div>
            <Button onClick={agendarDiaria}>Agendar Diária</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
