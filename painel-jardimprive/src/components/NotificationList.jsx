import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Estilo visual de acordo com o tipo
const notificationStyles = {
  info: 'bg-blue-100 text-blue-800 border-blue-300',
  success: 'bg-green-100 text-green-800 border-green-300',
  error: 'bg-red-100 text-red-800 border-red-300',
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('/api/notifications') // ou 'http://localhost:3001/api/notifications' se você não usa proxy
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err) => {
        console.error('Erro ao buscar notificações:', err);
      });
  }, []);

  if (notifications.length === 0) {
    return <p className="text-gray-500">Nenhuma notificação encontrada.</p>;
  }

  return (
    <div className="space-y-4">
      {notifications.map((n, index) => (
        <div
          key={index}
          className={`flex items-start border-l-4 p-4 rounded shadow-sm ${notificationStyles[n.type] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
        >
          <div className="text-3xl mr-3">{n.icon}</div>
          <div>
            <p className="font-semibold">{n.title}</p>
            <p>{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
