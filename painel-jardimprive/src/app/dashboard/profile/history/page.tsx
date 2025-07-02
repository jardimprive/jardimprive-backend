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

  const fetchHistory = async () => {
    const res = await api.get('/profile/history');
    setHistory(res.data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🕓 Histórico de Login</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p>🔍 Nenhum histórico de login encontrado.</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 bg-white shadow-sm"
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
