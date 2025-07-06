'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const exportar = useCallback(async (tipo: string) => {
    setError(null);
    setLoading(tipo);

    try {
      if (typeof window === 'undefined') throw new Error('Ambiente inválido');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Usuário não autenticado');

      const res = await fetch(`/api/export/${tipo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status}: ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      link.href = url;
      link.download = `${tipo}-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError('Erro ao exportar arquivo. Tente novamente.');
    } finally {
      setLoading('');
    }
  }, []);

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>📤 Exportar Relatórios</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Clique para exportar os dados em formato CSV.
          </p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded border border-red-400"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {['pedidos', 'comissoes', 'bonus', 'saques'].map((tipo) => (
              <Button
                key={tipo}
                onClick={() => exportar(tipo)}
                disabled={loading === tipo}
                aria-label={`Exportar relatório de ${tipo}`}
                className="w-full"
              >
                {loading === tipo ? 'Exportando...' :
                  tipo === 'pedidos' ? '📦 Pedidos' :
                  tipo === 'comissoes' ? '💰 Comissões' :
                  tipo === 'bonus' ? '🎁 Bônus' :
                  tipo === 'saques' ? '🏦 Saques' : tipo}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
