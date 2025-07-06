'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Bonus {
  id: string;
  amount: number;
  createdAt: string;
  status: string;
}

export default function BonusPage() {
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBonus = async () => {
      try {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await api.get('/bonus/my', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBonus(res.data);
      } catch (error) {
        console.error('Erro ao carregar bônus:', error);
        router.push('/login');
      }
    };

    fetchBonus();
  }, [router]);

  return (
    <div className="space-y-4 mx-4 sm:mx-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Meus Bônus</CardTitle>
        </CardHeader>
        <CardContent>
          {bonus.length === 0 ? (
            <p>Você ainda não possui bônus.</p>
          ) : (
            <div className="space-y-2">
              {bonus.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between border rounded-lg p-4 bg-white"
                >
                  <div>
                    <p className="font-semibold text-lg">
                      Valor: R$ {item.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-right flex items-center justify-end">
                    <span
                      className={`px-3 py-1 rounded text-sm font-medium ${
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
