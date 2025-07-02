'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState('');

  const exportar = async (tipo: string) => {
    try {
      setLoading(tipo);

      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      const res = await fetch(`/api/export/${tipo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao exportar');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${tipo}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Erro ao exportar arquivo.');
      console.error(err);
    } finally {
      setLoading('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📤 Exportar Relatórios</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Clique para exportar os dados em formato CSV.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            onClick={() => exportar('pedidos')}
            disabled={loading === 'pedidos'}
          >
            {loading === 'pedidos' ? 'Exportando...' : '📦 Pedidos'}
          </Button>

          <Button
            onClick={() => exportar('comissoes')}
            disabled={loading === 'comissoes'}
          >
            {loading === 'comissoes' ? 'Exportando...' : '💰 Comissões'}
          </Button>

          <Button
            onClick={() => exportar('bonus')}
            disabled={loading === 'bonus'}
          >
            {loading === 'bonus' ? 'Exportando...' : '🎁 Bônus'}
          </Button>

          <Button
            onClick={() => exportar('saques')}
            disabled={loading === 'saques'}
          >
            {loading === 'saques' ? 'Exportando...' : '🏦 Saques'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
