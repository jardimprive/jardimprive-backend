'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { format } from 'date-fns';

interface Vendedora {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  status: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function VendedoraDetalhesPage() {
  const { id } = useParams(); // pega o ID da URL
  const router = useRouter();
  const [vendedora, setVendedora] = useState<Vendedora | null>(null);

  const fetchVendedora = async () => {
    try {
      const res = await api.get(`/admin/vendedoras/${id}`);
      setVendedora(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados da vendedora:', err);
    }
  };

  const toggleBloqueio = async () => {
    try {
      await api.patch(`/users/admin/sellers/${id}/status`, {
        status: vendedora?.status === 'ATIVA' ? 'BLOQUEADA' : 'ATIVA',
      });
      fetchVendedora(); // recarrega dados
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVendedora();
    }
  }, [id]);

  if (!vendedora) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        🔄 Carregando dados da vendedora...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>👤 Perfil da Vendedora</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p><strong>Nome:</strong> {vendedora.name}</p>
        <p><strong>Email:</strong> {vendedora.email}</p>
        <p><strong>CPF:</strong> {vendedora.cpf}</p>
        <p><strong>Telefone:</strong> {vendedora.phone}</p>
        <p><strong>Status:</strong> {vendedora.status}</p>
        <p><strong>Bloqueada:</strong> {vendedora.isBlocked ? 'Sim' : 'Não'}</p>
        <p><strong>Criado em:</strong> {format(new Date(vendedora.createdAt), 'dd/MM/yyyy')}</p>

        <div className="flex gap-2 mt-4">
          <Button onClick={toggleBloqueio} variant="destructive">
            {vendedora.status === 'ATIVA' ? 'Bloquear' : 'Desbloquear'}
          </Button>

          <Button variant="outline" onClick={() => router.push('/dashboard/vendedoras')}>
            ← Voltar para lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
