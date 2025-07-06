'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Saque {
  id: string;
  amount: number;
  status: string;
  pixKey: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function SaquesAdminPage() {
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSaques = useCallback(async () => {
    if (typeof window === 'undefined') return; // Evita chamadas no SSR

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/withdrawal/admin');
      setSaques(res.data);
    } catch (err) {
      console.error('Erro ao buscar saques:', err);
      setError('Erro ao buscar pedidos de saque. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const atualizarStatus = useCallback(
    async (id: string, status: string) => {
      setActionLoading(id);
      setError(null);
      try {
        await api.patch(`/withdrawal/${id}`, { status });
        await fetchSaques();
      } catch (err) {
        console.error(`Erro ao atualizar status do saque ${id}:`, err);
        setError('Erro ao atualizar o status. Tente novamente.');
      } finally {
        setActionLoading(null);
      }
    },
    [fetchSaques]
  );

  useEffect(() => {
    fetchSaques();
  }, [fetchSaques]);

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>🏦 Pedidos de Saque</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-400"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Carregando...</p>
          ) : (
            <div className="overflow-auto">
              <table
                className="min-w-full mt-4 text-sm text-left border-collapse"
                role="table"
                aria-label="Pedidos de Saque"
              >
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4 font-semibold">Vendedora</th>
                    <th className="py-2 px-4 font-semibold">Valor</th>
                    <th className="py-2 px-4 font-semibold">Status</th>
                    <th className="py-2 px-4 font-semibold">PIX</th>
                    <th className="py-2 px-4 font-semibold">Data</th>
                    <th className="py-2 px-4 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {saques.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhum pedido de saque encontrado.
                      </td>
                    </tr>
                  ) : (
                    saques.map((s) => (
                      <tr key={s.id} className="border-b even:bg-gray-50">
                        <td className="py-2 px-4 break-words max-w-[120px]">{s.user.name}</td>
                        <td className="py-2 px-4">R$ {s.amount.toFixed(2)}</td>
                        <td className="py-2 px-4">
                          <Badge
                            variant={
                              s.status === 'PENDENTE'
                                ? 'default'
                                : s.status === 'APROVADO'
                                ? 'outline'
                                : 'destructive'
                            }
                          >
                            {s.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-2 px-4 break-words max-w-[140px]">{s.pixKey}</td>
                        <td className="py-2 px-4">
                          {format(new Date(s.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="py-2 px-4">
                          {s.status === 'PENDENTE' ? (
                            <div className="flex flex-col gap-2 md:flex-row">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => atualizarStatus(s.id, 'APROVADO')}
                                disabled={actionLoading === s.id}
                                aria-label={`Aprovar pedido de saque de ${s.user.name}`}
                              >
                                {actionLoading === s.id ? 'Processando...' : 'Aprovar'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => atualizarStatus(s.id, 'RECUSADO')}
                                disabled={actionLoading === s.id}
                                aria-label={`Recusar pedido de saque de ${s.user.name}`}
                              >
                                {actionLoading === s.id ? 'Processando...' : 'Recusar'}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
