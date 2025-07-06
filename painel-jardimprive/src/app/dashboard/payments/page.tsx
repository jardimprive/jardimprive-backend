'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  orderId: string;
  status: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  // Exemplo: lendo token do localStorage para api (caso precise)
  // useEffect(() => {
  //   const token = localStorage.getItem('authToken');
  //   if (token) {
  //     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  //   }
  // }, []);

  const fetchPayments = () => {
    api.get('/payment/my').then((res) => {
      setPayments(res.data);
    });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handlePay = async (id: string) => {
    await api.post(`/payment/${id}/pay`);
    fetchPayments();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Meus Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p>Você ainda não possui pagamentos.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-4 gap-3"
                >
                  <div className="flex flex-col space-y-1 max-w-full">
                    <p className="font-semibold text-lg">
                      Valor: R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Vencimento: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      Pedido: {item.orderId}
                    </p>
                    <p className="text-sm">
                      Status:{' '}
                      <span
                        className={`font-semibold ${
                          item.status === 'PAGO' ? 'text-green-600' : 'text-yellow-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </p>
                  </div>

                  {item.status !== 'PAGO' && (
                    <Button
                      onClick={() => handlePay(item.id)}
                      size="sm"
                      className="w-full sm:w-auto"
                      aria-label={`Pagar pagamento no valor de R$ ${item.amount.toFixed(2)}`}
                    >
                      Pagar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
