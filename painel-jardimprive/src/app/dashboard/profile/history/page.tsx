'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Login {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export default function LoginHistoryPage() {
  const [history, setHistory] = useState<Login[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Erro ao buscar histórico de login:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return <p className="p-4 text-center text-muted-foreground">Carregando histórico...</p>;
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🕓 Histórico de Login</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground">🔍 Nenhum histórico de login encontrado.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 bg-white shadow-sm text-sm break-words"
                >
                  <p>
                    <strong>Data:</strong>{' '}
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <p>
                    <strong>IP:</strong> {item.ip}
                  </p>
                  <p>
                    <strong>Dispositivo:</strong> {item.userAgent}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
