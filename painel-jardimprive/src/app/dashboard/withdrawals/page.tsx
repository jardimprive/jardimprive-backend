'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [commission, setCommission] = useState(0);

  const fetchData = () => {
    api.get('/commission/my').then((res) => {
      const pending = res.data.filter((item: any) => item.status === 'PENDENTE');
      const total = pending.reduce((acc: number, item: any) => acc + item.amount, 0);
      setCommission(total);
    });

    api.get('/withdrawal/my').then((res) => {
      setWithdrawals(res.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async () => {
    await api.post('/withdrawal/request');
    fetchData();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Disponível</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">
              R$ {commission.toFixed(2)}
            </p>
            <Button
              onClick={handleWithdraw}
              disabled={commission < 1}
            >
              Solicitar Saque
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p>Você ainda não possui saques.</p>
          ) : (
            <div className="space-y-2">
              {withdrawals.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border rounded-lg p-2"
                >
                  <div>
                    <p className="font-semibold">
                      Valor: R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data:{' '}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status:{' '}
                      <span
                        className={`${
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
