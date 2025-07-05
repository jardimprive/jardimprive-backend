'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // 🔄 Para redirecionar
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
      const profileRes = await api.get('/users/profile');
      const role = profileRes.data.role;
      setUserRole(role);

      if (role === 'VENDEDORA') {
        const [commRes, bonusRes, withdrawRes, paymentRes] = await Promise.all([
          api.get('/commission/me'),
          api.get('/bonus/me'),
          api.get('/withdrawals/me'),
          api.get('/payments'),
        ]);

        const comm = commRes.data.filter((c: any) => c.status === 'PENDENTE');
        setCommission(comm.reduce((acc: number, item: any) => acc + item.amount, 0));

        setBonus(bonusRes.data.reduce((acc: number, item: any) => acc + item.value, 0));
        setWithdrawals(withdrawRes.data.reduce((acc: number, item: any) => acc + item.amount, 0));

        const pendings = paymentRes.data.filter((p: any) => p.status !== 'PAGO');
        setPendingPayments(pendings.reduce((acc: number, item: any) => acc + item.amount, 0));

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

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  useEffect(() => {
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

  return (
    <div className="space-y-6">
      {userRole === 'ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle>🌟 Bem-vindo(a), Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Acesse o menu lateral para gerenciar pedidos, produtos, vendedoras, saques, etc.
            </p>
          </CardContent>
        </Card>
      )}

      {userRole === 'VENDEDORA' && (
        <>
          {/* Cards principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${card.color} rounded-2xl shadow-md`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">R$ {card.value.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>📈 Comparativo Geral</CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#60A5FA" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Progresso da meta */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>🎯 Progresso da Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Você completou <strong>{meta.totalVendasValidas}</strong> de <strong>60</strong> vendas.
              </p>
              <Progress value={meta.progresso} />
              <p className="text-sm text-muted-foreground">
                A cada 10 vendas de no mínimo R$250 você ganha <strong>R$200</strong> de bônus.
              </p>

              {meta.ganhouHotel && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  🎉 <strong>Parabéns!</strong> Você concluiu a meta de 60 vendas!
                  <br />
                  <Button className="mt-2">Agendar hospedagem no hotel 5 estrelas</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
