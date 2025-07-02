'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Atividades {
  pedidos: {
    id: string;
    status: string;
    createdAt: string;
    total: number;
  }[];
  bonus: {
    id: string;
    value: number;
    type: string;
    status: string;
    createdAt: string;
  }[];
  saques: {
    id: string;
    amount: number;
    status: string;
    pixKey: string;
    createdAt: string;
  }[];
}

export default function AtividadesPage() {
  const [dados, setDados] = useState<Atividades | null>(null);

  const fetchAtividades = async () => {
    try {
      const res = await api.get('/profile/atividades');
      setDados(res.data);
    } catch (err) {
      console.error('Erro ao buscar atividades:', err);
    }
  };

  useEffect(() => {
    fetchAtividades();
  }, []);

  if (!dados) return <p>Carregando atividades...</p>;

  return (
    <div className="space-y-6">
      {/* 🧾 Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>🧾 Meus Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {dados.pedidos.length === 0 ? (
            <p>Nenhum pedido encontrado.</p>
          ) : (
            <ul className="space-y-2">
              {dados.pedidos.map((p) => (
                <li key={p.id} className="border p-3 rounded text-sm bg-white shadow-sm">
                  <p><strong>ID:</strong> {p.id}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p><strong>Total:</strong> R$ {p.total.toFixed(2)}</p>
                  <p><strong>Data:</strong> {format(new Date(p.createdAt), 'dd/MM/yyyy')}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 🎁 Bônus */}
      <Card>
        <CardHeader>
          <CardTitle>🎁 Bônus Recebidos</CardTitle>
        </CardHeader>
        <CardContent>
          {dados.bonus.length === 0 ? (
            <p>Nenhum bônus encontrado.</p>
          ) : (
            <ul className="space-y-2">
              {dados.bonus.map((b) => (
                <li key={b.id} className="border p-3 rounded text-sm bg-white shadow-sm">
                  <p><strong>Tipo:</strong> {b.type}</p>
                  <p><strong>Valor:</strong> R$ {b.value.toFixed(2)}</p>
                  <p><strong>Status:</strong> <Badge>{b.status}</Badge></p>
                  <p><strong>Data:</strong> {format(new Date(b.createdAt), 'dd/MM/yyyy')}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 🏦 Saques */}
      <Card>
        <CardHeader>
          <CardTitle>🏦 Meus Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {dados.saques.length === 0 ? (
            <p>Nenhum saque solicitado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {dados.saques.map((s) => (
                <li key={s.id} className="border p-3 rounded text-sm bg-white shadow-sm">
                  <p><strong>Valor:</strong> R$ {s.amount.toFixed(2)}</p>
                  <p><strong>PIX:</strong> {s.pixKey}</p>
                  <p><strong>Status:</strong> <Badge>{s.status}</Badge></p>
                  <p><strong>Data:</strong> {format(new Date(s.createdAt), 'dd/MM/yyyy')}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
