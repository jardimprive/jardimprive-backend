'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function BonusPage() {
  const [bonus, setBonus] = useState([]);

  useEffect(() => {
    api.get('/bonus/my').then((res) => {
      setBonus(res.data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meus Bônus</CardTitle>
        </CardHeader>
        <CardContent>
          {bonus.length === 0 ? (
            <p>Você ainda não possui bônus.</p>
          ) : (
            <div className="space-y-2">
              {bonus.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border rounded-lg p-2"
                >
                  <div>
                    <p className="font-semibold">Valor: R$ {item.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.status === 'PAGO'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
