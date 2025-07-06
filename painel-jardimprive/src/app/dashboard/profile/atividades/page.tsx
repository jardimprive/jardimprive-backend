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

  if (!dados) return <p className="p-4 text-center">Carregando atividades...</p>;

  const ListaItens = ({ children }: { children: React.ReactNode }) => (
    <ul className="space-y-2 max-h-[384px] overflow-y-auto">
      {children}
    </ul>
  );

  const ItemCard = ({ children }: { children: React.ReactNode }) => (
    <li className="border p-3 rounded text-sm bg-white shadow-sm break-words">
      {children}
    </li>
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      {/* 🧾 Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>🧾 Meus Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {dados.pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum pedido encontrado.</p>
          ) : (
            <ListaItens>
              {dados.pedidos.map((p) => (
                <ItemCard key={p.id}>
                  <p>
                    <strong>ID:</strong>{' '}
                    <span className="break-all">{p.id}</span>
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge className="capitalize">{p.status}</Badge>
                  </p>
                  <p><strong>Total:</strong> R$ {p.total.toFixed(2)}</p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {format(new Date(p.createdAt), 'dd/MM/yyyy')}
                  </p>
                </ItemCard>
              ))}
            </ListaItens>
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
            <p className="text-center text-muted-foreground">Nenhum bônus encontrado.</p>
          ) : (
            <ListaItens>
              {dados.bonus.map((b) => (
                <ItemCard key={b.id}>
                  <p><strong>Tipo:</strong> {b.type}</p>
                  <p><strong>Valor:</strong> R$ {b.value.toFixed(2)}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge className="capitalize">{b.status}</Badge>
                  </p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {format(new Date(b.createdAt), 'dd/MM/yyyy')}
                  </p>
                </ItemCard>
              ))}
            </ListaItens>
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
            <p className="text-center text-muted-foreground">Nenhum saque solicitado ainda.</p>
          ) : (
            <ListaItens>
              {dados.saques.map((s) => (
                <ItemCard key={s.id}>
                  <p><strong>Valor:</strong> R$ {s.amount.toFixed(2)}</p>
                  <p><strong>PIX:</strong> {s.pixKey}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge className="capitalize">{s.status}</Badge>
                  </p>
                  <p>
                    <strong>Data:</strong>{' '}
                    {format(new Date(s.createdAt), 'dd/MM/yyyy')}
                  </p>
                </ItemCard>
              ))}
            </ListaItens>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
