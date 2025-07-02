'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meus Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p>Você ainda não possui pagamentos.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border rounded-lg p-2"
                >
                  <div>
                    <p className="font-semibold">
                      Valor: R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Vencimento:{' '}
                      {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pedido: {item.orderId}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status:{' '}
                      <span
                        className={`${
                          item.status === 'PAGO'
                            ? 'text-green-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </p>
                  </div>
                  {item.status !== 'PAGO' && (
                    <Button onClick={() => handlePay(item.id)}>
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
