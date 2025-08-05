'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  type: string;
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications/me');
        setNotifications(res.data || []);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      }
    };

    fetchNotifications();
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="border-l-4 border-blue-500 bg-blue-50 p-4 shadow-sm"
        >
          <div className="text-sm text-blue-900">{notification.message}</div>
          <div className="text-xs text-blue-700">
            {new Date(notification.createdAt).toLocaleString('pt-BR')}
          </div>
        </Card>
      ))}
    </div>
  );
}
