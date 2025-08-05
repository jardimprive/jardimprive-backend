'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Withdrawal {
  id: string;
  amount: number;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  createdAt: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [commission, setCommission] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [commRes, withdrawRes] = await Promise.all([
        api.get('/commission/my'),
        api.get('/withdrawal/my'),
      ]);

      const pending = commRes.data.filter((item: any) => item.status === 'PENDENTE');
      const total = pending.reduce((acc: number, item: any) => acc + item.amount, 0);
      setCommission(total);
      setWithdrawals(withdrawRes.data);
    } catch (err) {
      console.error('Erro ao buscar dados de saque:', err);
      alert('Erro ao carregar informações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setRequesting(true);
    try {
      await api.post('/withdrawal/request');
      await fetchData();
    } catch (err) {
      console.error('Erro ao solicitar saque:', err);
      alert('Erro ao solicitar saque.');
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="px-2 sm:px-4 md:px-6 max-w-3xl mx-auto space-y-6">
      {/* Card de Saldo */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Saldo Disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-3xl font-bold text-green-600">
              R$ {typeof commission === 'number' ? commission.toFixed(2) : '0,00'}
            </p>
            <Button
              onClick={handleWithdraw}
              disabled={commission < 1 || requesting}
              className="w-full sm:w-auto"
            >
              {requesting ? 'Solicitando...' : 'Solicitar Saque'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card de Lista de Saques */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Meus Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">🔄 Carregando saques...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não possui saques.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md p-3 bg-white shadow-sm"
                >
                  <p className="font-semibold">
                    Valor:{' '}
                    <span className="text-green-700">
                      R${' '}
                      {typeof item.amount === 'number'
                        ? item.amount.toFixed(2)
                        : '0,00'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Data:{' '}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : '—'}
                  </p>
                  <p className="text-sm">
                    Status:{' '}
                    <span
                      className={`font-medium ${
                        item.status === 'APROVADO'
                          ? 'text-green-600'
                          : item.status === 'RECUSADO'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
