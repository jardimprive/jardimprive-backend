'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState('');
  const [commission, setCommission] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [summary, setSummary] = useState({
    totalVendas: 0,
    totalComissoes: 0,
    totalBonus: 0,
    totalSaques: 0,
  });
  const [meta, setMeta] = useState({
    totalVendasValidas: 0,
    totalBonus: 0,
    progresso: 0,
    ganhouHotel: false,
  });

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/api/profile/me');
      const role = profileRes.data.role;
      setUserRole(role);

      if (role === 'VENDEDORA') {
        const [commRes, bonusRes, withdrawRes, paymentRes] = await Promise.all([
          api.get('/commission/me'),
          api.get('/bonus/me'),
          api.get('/withdrawals/me'),
          api.get('/payments'),
        ]);

        const comm = Array.isArray(commRes.data) ? commRes.data : [];
        setCommission(comm.filter((c: any) => c.status === 'PENDENTE').reduce((acc, item) => acc + item.amount, 0));

        const bonusArr = Array.isArray(bonusRes.data) ? bonusRes.data : [];
        setBonus(bonusArr.reduce((acc, item) => acc + item.value, 0));

        const withdrawArr = Array.isArray(withdrawRes.data) ? withdrawRes.data : [];
        setWithdrawals(withdrawArr.reduce((acc, item) => acc + item.amount, 0));

        const pendings = Array.isArray(paymentRes.data) ? paymentRes.data : [];
        setPendingPayments(pendings.filter((p: any) => p.status !== 'PAGO').reduce((acc, item) => acc + item.amount, 0));

        const summaryRes = await api.get('/dashboard/summary');
        setSummary(summaryRes.data);

        const metaRes = await api.get('/bonus/progress');
        setMeta(metaRes.data);
      }

      if (role === 'ADMIN') {
        const summaryRes = await api.get('/dashboard/summary');
        setSummary(summaryRes.data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, []);

  const pieData = [
    { name: 'Vendas', value: summary.totalVendas },
    { name: 'Comissões', value: summary.totalComissoes },
    { name: 'Bônus', value: summary.totalBonus },
    { name: 'Saques', value: summary.totalSaques },
  ];

  const barData = [
    { name: 'Vendas', valor: summary.totalVendas },
    { name: 'Comissões', valor: summary.totalComissoes },
    { name: 'Bônus', valor: summary.totalBonus },
    { name: 'Saques', valor: summary.totalSaques },
  ];

  const COLORS = ['#60A5FA', '#34D399', '#FBBF24', '#A78BFA'];

  const cards = [
    { title: '💰 Comissão Disponível', value: commission, color: 'bg-green-100 text-green-800' },
    { title: '🎁 Total de Bônus', value: bonus, color: 'bg-yellow-100 text-yellow-800' },
    { title: '🏦 Total de Saques', value: withdrawals, color: 'bg-purple-100 text-purple-800' },
    { title: '💳 Pagamentos Pendentes', value: pendingPayments, color: 'bg-red-100 text-red-800' },
    { title: '🛒 Total de Vendas', value: summary.totalVendas, color: 'bg-blue-100 text-blue-800' },
    { title: '💰 Comissões Recebidas', value: summary.totalComissoes, color: 'bg-green-100 text-green-800' },
    { title: '🎁 Bônus Recebidos', value: summary.totalBonus, color: 'bg-yellow-100 text-yellow-800' },
    { title: '🏦 Saques Realizados', value: summary.totalSaques, color: 'bg-purple-100 text-purple-800' },
  ];

  const getProgressColor = () => {
    if (meta.progresso >= 70) return 'bg-green-500';
    if (meta.progresso >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-screen px-4 sm:px-6 space-y-6 overflow-x-hidden">
      {userRole === 'VENDEDORA' && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>🎯 Progresso da Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Você completou <strong>{meta.totalVendasValidas}</strong> de <strong>60</strong> vendas.
              </p>
              <Progress value={Math.min(meta.progresso, 100)} className={getProgressColor()} />
              <p>{meta.progresso.toFixed(0)}% da meta concluída</p>
              <p className="text-sm text-muted-foreground">
                A cada 10 vendas de no mínimo R$250 você ganha <strong>R$200</strong> de bônus.
              </p>

              {meta.ganhouHotel && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  🎉 <strong>Parabéns!</strong> Você concluiu a meta de 60 vendas!
                  <br />
                  <Button className="mt-2" onClick={() => router.push('/dashboard/hotel')}>
                    Agendar hospedagem no hotel 5 estrelas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {userRole === 'ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle>🌟 Bem-vindo(a), Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Acesse o menu lateral para gerenciar pedidos, produtos, vendedoras, saques etc.
            </p>
          </CardContent>
        </Card>
      )}

      {userRole === 'VENDEDORA' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className={`${card.color} rounded-2xl shadow-md`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">R$ {Number(card.value || 0).toFixed(2)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-0 sm:p-4">
              <CardHeader>
                <CardTitle>📊 Distribuição Geral</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent = 0 }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `R$ ${Number(value).toFixed(2).replace('.', ',')}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-0 sm:p-4">
              <CardHeader>
                <CardTitle>📈 Comparativo Geral</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `R$ ${Number(value).toFixed(2).replace('.', ',')}`
                    }
                  />
                  <Legend />
                  <Bar dataKey="valor" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
