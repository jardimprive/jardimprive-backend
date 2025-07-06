'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO, isValid } from 'date-fns';

interface Diaria {
  id: string;
  date: string;
}

export default function AgendarHotelPage() {
  const [minhaDiaria, setMinhaDiaria] = useState<Diaria | null>(null);
  const [data, setData] = useState('');
  const [carregando, setCarregando] = useState(true);

  const fetchMinhaDiaria = async () => {
    try {
      setCarregando(true);
      const res = await api.get('/hotel/minha-diaria');
      if (res.data?.date) {
        setMinhaDiaria(res.data);
      }
    } catch (err) {
      console.error('Erro ao buscar diária:', err);
    } finally {
      setCarregando(false);
    }
  };

  const agendar = async () => {
    if (!data) {
      alert('Por favor, selecione uma data.');
      return;
    }

    try {
      await api.post('/hotel/agendar', { date: data });
      alert('Diária agendada com sucesso!');
      fetchMinhaDiaria(); // recarrega após agendamento
    } catch (err: any) {
      console.error('Erro ao agendar diária:', err);
      alert(err?.response?.data?.error || 'Erro ao agendar diária.');
    }
  };

  useEffect(() => {
    fetchMinhaDiaria();
  }, []);

  const dataFormatada =
    minhaDiaria?.date && isValid(parseISO(minhaDiaria.date))
      ? format(parseISO(minhaDiaria.date), 'dd/MM/yyyy')
      : null;

  return (
    <Card className="p-6 max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🏨 Agendar Diária no Hotel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando sua diária...</p>
        ) : minhaDiaria && dataFormatada ? (
          <p className="text-sm">
            Você já agendou sua diária para o dia:{' '}
            <strong>{dataFormatada}</strong>
          </p>
        ) : (
          <>
            <Label>Escolha a data desejada:</Label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // impede datas passadas
              className="w-full"
              required
            />

            <Button className="mt-2 w-full sm:w-auto" onClick={agendar}>
              Confirmar Agendamento
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
