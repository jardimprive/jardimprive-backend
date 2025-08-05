'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface Payment {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
  order: {
    id: string;
    createdAt: string;
  };
}

export default function PagamentosPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (error: any) {
      console.error('Erro ao buscar pagamentos:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentId: string) => {
    try {
      await api.post(`/payments/pay/${paymentId}`);
      alert('Pagamento realizado com sucesso!');
      fetchPayments(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao realizar pagamento:', error);
      alert('Erro ao realizar pagamento.');
    }
  };

  const createCheckout = async (orderId: string) => {
    try {
      const response = await api.post('/payments/checkout', { orderId });
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      alert('Erro ao gerar link de pagamento.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'AVISTA':
        return 'À Vista (PIX)';
      case 'PARCELA_ENTRADA':
        return 'Entrada (50%)';
      case 'PARCELA_FINAL':
        return 'Parcela Final (50%)';
      case 'CARTAO':
        return 'Cartão de Crédito';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const pendingPayments = payments.filter(p => p.status === 'PENDENTE');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando pagamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>💳 Pagamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-lg font-semibold text-yellow-800">
              Total Pendente: R$ {totalPending.toFixed(2)}
            </p>
            <p className="text-sm text-yellow-600">
              {pendingPayments.length} pagamento(s) aguardando quitação
            </p>
          </div>

          {payments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum pagamento encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {getTypeLabel(payment.type)}
                          </span>
                        </div>
                        
                        <p className="font-semibold text-lg">
                          R$ {payment.amount.toFixed(2)}
                        </p>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Pedido: #{payment.order.id.slice(0, 8)}</p>
                          <p>Vencimento: {formatDate(payment.dueDate)}</p>
                          <p>Criado em: {formatDate(payment.order.createdAt)}</p>
                        </div>
                      </div>

                      {payment.status === 'PENDENTE' && (
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => createCheckout(payment.order.id)}
                            className="w-full sm:w-auto"
                          >
                            Pagar via Mercado Pago
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handlePayment(payment.id)}
                            className="w-full sm:w-auto"
                          >
                            Marcar como Pago
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

