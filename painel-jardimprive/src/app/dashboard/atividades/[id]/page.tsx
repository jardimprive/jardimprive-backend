'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Atividade {
  id: string;
  tipo: 'PEDIDO' | 'SAQUE' | 'BONUS' | 'COMISSAO';
  data: string;
  status: string;
  valor?: number;
  detalhes?: string;
}

export default function DetalhesAtividadePage() {
  const { id } = useParams();
  const router = useRouter();
  const [atividade, setAtividade] = useState<Atividade | null>(null);

  const fetchDetalhes = async () => {
    try {
      const res = await api.get('/dashboard/atividade');
      const historico: Atividade[] = res.data;
      const encontrada = historico.find((a) => a.id === id);
      setAtividade(encontrada || null);
    } catch (err) {
      console.error('Erro ao buscar detalhes da atividade:', err);
    }
  };

  useEffect(() => {
    fetchDetalhes();
  }, [id]);

  if (!atividade) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade não encontrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Verifique se o ID está correto ou tente novamente.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔎 Detalhes da Atividade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong>ID:</strong> {atividade.id}</p>
        <p><strong>Tipo:</strong> {atividade.tipo}</p>
        <p><strong>Data:</strong> {format(new Date(atividade.data), 'dd/MM/yyyy HH:mm')}</p>
        <p><strong>Status:</strong> {atividade.status}</p>
        {atividade.valor !== undefined && (
          <p><strong>Valor:</strong> R$ {atividade.valor.toFixed(2)}</p>
        )}
        {atividade.detalhes && (
          <p><strong>Detalhes:</strong> {atividade.detalhes}</p>
        )}
        <Button className="mt-4" variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </CardContent>
    </Card>
  );
}
