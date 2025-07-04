'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Atividade {
  id: string;
  tipo: 'PEDIDO' | 'SAQUE' | 'BONUS' | 'COMISSAO';
  data: string;
  status: string;
  valor: number;
  detalhes?: string;
}

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [filtro, setFiltro] = useState('');

  const fetchAtividades = async () => {
    try {
      const res = await api.get('/dashboard/atividade');
      setAtividades(res.data);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
    }
  };

  useEffect(() => {
    fetchAtividades();
  }, []);

  const atividadesFiltradas = atividades.filter((a) =>
    filtro ? a.tipo === filtro : true
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧾 Histórico de Atividades</CardTitle>
        <div className="mt-4 w-64">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger>
              <SelectValue>Filtrar por tipo</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="PEDIDO">Pedidos</SelectItem>
              <SelectItem value="SAQUE">Saques</SelectItem>
              <SelectItem value="BONUS">Bônus</SelectItem>
              <SelectItem value="COMISSAO">Comissões</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {atividadesFiltradas.length === 0 ? (
          <p>Nenhuma atividade encontrada.</p>
        ) : (
          <div className="space-y-3">
            {atividadesFiltradas.map((a) => (
              <div
                key={a.id}
                className="border rounded-md p-3 bg-white shadow-sm text-sm"
              >
                <div className="flex justify-between mb-1">
                  <strong>{a.tipo}</strong>
                  <span>{format(new Date(a.data), 'dd/MM/yyyy')}</span>
                </div>
                <p>Status: <strong>{a.status}</strong></p>
                <p>Valor: R$ {a.valor.toFixed(2)}</p>
                {a.detalhes && <p>Detalhes: {a.detalhes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
