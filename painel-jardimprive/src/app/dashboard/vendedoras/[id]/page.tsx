'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const { id } = useParams();
  const router = useRouter();

  const [vendedora, setVendedora] = useState<Vendedora | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendedora = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/vendedoras/${id}`);
      setVendedora(res.data);
    } catch (err) {
      console.error('Erro ao buscar dados da vendedora:', err);
      setError('Erro ao carregar dados da vendedora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const toggleBloqueio = useCallback(async () => {
    if (!vendedora) return;
    setToggleLoading(true);
    setError(null);
    try {
      await api.patch(`/users/admin/sellers/${id}/status`, {
        status: vendedora.status === 'ATIVA' ? 'BLOQUEADA' : 'ATIVA',
      });
      await fetchVendedora();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setError('Erro ao alterar status da vendedora. Tente novamente.');
    } finally {
      setToggleLoading(false);
    }
  }, [id, vendedora, fetchVendedora]);

  useEffect(() => {
    if (id) fetchVendedora();
  }, [id, fetchVendedora]);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground" role="status" aria-live="polite">
        🔄 Carregando dados da vendedora...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 text-center text-red-700 bg-red-100 rounded"
        role="alert"
        aria-live="assertive"
      >
        {error}
      </div>
    );
  }

  if (!vendedora) {
    return (
      <div className="p-6 text-center text-muted-foreground" role="status" aria-live="polite">
        Nenhum dado encontrado.
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>👤 Perfil da Vendedora</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Nome:</strong> {vendedora.name}
          </p>
          <p>
            <strong>Email:</strong> {vendedora.email}
          </p>
          <p>
            <strong>CPF:</strong> {vendedora.cpf}
          </p>
          <p>
            <strong>Telefone:</strong> {vendedora.phone}
          </p>
          <p>
            <strong>Status:</strong> {vendedora.status}
          </p>
          <p>
            <strong>Bloqueada:</strong> {vendedora.isBlocked ? 'Sim' : 'Não'}
          </p>
          <p>
            <strong>Criado em:</strong> {format(new Date(vendedora.createdAt), 'dd/MM/yyyy')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={toggleBloqueio}
              variant="destructive"
              disabled={toggleLoading}
              aria-label={`${vendedora.status === 'ATIVA' ? 'Bloquear' : 'Desbloquear'} vendedora ${
                vendedora.name
              }`}
            >
              {toggleLoading
                ? vendedora.status === 'ATIVA'
                  ? 'Bloqueando...'
                  : 'Desbloqueando...'
                : vendedora.status === 'ATIVA'
                ? 'Bloquear'
                : 'Desbloquear'}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/vendedoras')}
              aria-label="Voltar para lista de vendedoras"
            >
              ← Voltar para lista
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
