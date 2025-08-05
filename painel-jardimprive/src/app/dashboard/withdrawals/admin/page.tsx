'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Withdrawal {
  id: string;
  amount: number;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function WithdrawalsAdminPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/withdrawal/admin'); // Ajuste conforme sua API admin
      setWithdrawals(res.data);
    } catch (err) {
      console.error('Erro ao buscar saques:', err);
      setError('Erro ao carregar saques.');
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: 'APROVADO' | 'RECUSADO') => {
    const confirmMessage =
      status === 'APROVADO'
        ? 'Tem certeza que deseja aprovar este pedido de saque?'
        : 'Tem certeza que deseja recusar este pedido de saque?';
    if (!confirm(confirmMessage)) return;

    setProcessingId(id);
    setError(null);
    try {
      await api.patch(`/withdrawal/${id}`, { status });
      await fetchWithdrawals();
    } catch (err) {
      console.error(`Erro ao atualizar status do saque ${id}:`, err);
      setError('Erro ao atualizar o status.');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="mx-4 sm:mx-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📋 Saques para Aprovação</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-400"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p>Carregando saques...</p>
          ) : withdrawals.length === 0 ? (
            <p>Nenhum saque pendente.</p>
          ) : (
            <table className="min-w-full text-left text-sm border-collapse" role="table" aria-label="Tabela de pedidos de saque">
              <thead>
                <tr className="border-b bg-muted">
                  <th className="py-2 px-3">Usuário</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Valor</th>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b even:bg-gray-50">
                    <td className="py-2 px-3">{w.user.name}</td>
                    <td className="py-2 px-3 break-all">{w.user.email}</td>
                    <td className="py-2 px-3">R$ {w.amount.toFixed(2)}</td>
                    <td className="py-2 px-3">{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-3 font-semibold">
                      {w.status === 'PENDENTE' && <span className="text-yellow-700">Pendente</span>}
                      {w.status === 'APROVADO' && <span className="text-green-700">Aprovado</span>}
                      {w.status === 'RECUSADO' && <span className="text-red-700">Recusado</span>}
                    </td>
                    <td className="py-2 px-3 space-x-2">
                      {w.status === 'PENDENTE' ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateWithdrawalStatus(w.id, 'APROVADO')}
                            disabled={processingId === w.id}
                            aria-label={`Aprovar pedido de saque de ${w.user.name}`}
                          >
                            {processingId === w.id ? 'Processando...' : 'Aprovar'}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => updateWithdrawalStatus(w.id, 'RECUSADO')}
                            disabled={processingId === w.id}
                            aria-label={`Recusar pedido de saque de ${w.user.name}`}
                          >
                            {processingId === w.id ? 'Processando...' : 'Recusar'}
                          </Button>
                        </>
                      ) : (
                        <span className="italic text-gray-500">Sem ações</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
