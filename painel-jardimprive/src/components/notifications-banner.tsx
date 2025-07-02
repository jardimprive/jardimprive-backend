'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const fecharNotificacao = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const notificacoesNaoLidas = notifications.filter((n) => !n.read);

  if (notificacoesNaoLidas.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {notificacoesNaoLidas.map((n) => (
        <Alert
          key={n.id}
          className="bg-yellow-50 border-yellow-400 text-yellow-900 relative"
        >
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fecharNotificacao(n.id)}
              className="p-1 h-auto w-auto text-yellow-900"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Info className="h-4 w-4" />
          <AlertTitle>📢 Notificação</AlertTitle>
          <AlertDescription>{n.message}</AlertDescription>
          <Button
            variant="link"
            size="sm"
            className="text-xs text-right text-blue-700 mt-2"
            onClick={() => marcarComoLida(n.id)}
          >
            Marcar como lida
          </Button>
        </Alert>
      ))}
    </div>
  );
}
