'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import NotificationsBanner from '@/components/notifications-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [temDiaria, setTemDiaria] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setIsAdmin(decoded.role === 'ADMIN');
      } catch (err) {
        console.error('Erro ao decodificar token:', err);
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    const verificarDiaria = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) return;

        const res = await fetch('/api/hotel/minha-diaria', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.date) setTemDiaria(true);
        }
      } catch (err) {
        console.error('Erro ao verificar diária:', err);
      }
    };

    verificarDiaria();
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  };

  const menu = [
    { label: '🏠 Início', href: '/dashboard' },
    { label: '🛍 Comprar Produtos', href: '/dashboard/comprar' },
    { label: '🛒 Carrinho', href: '/dashboard/carrinho' },
    { label: '🎁 Bônus', href: '/dashboard/bonus' },
    { label: '💰 Comissões', href: '/dashboard/commissions' },
    { label: '💳 Pagamentos', href: '/dashboard/payments' },
    { label: '🏦 Saques', href: '/dashboard/withdrawals' },
    { label: '🧾 Meus Pedidos', href: '/dashboard/meus-pedidos' },
    { label: '📜 Atividades', href: '/dashboard/atividades' },
    { label: '🕓 Histórico de Login', href: '/dashboard/profile/history' },
  ];

  if (temDiaria) {
    menu.push({ label: '🏨 Minha Diária no Hotel', href: '/dashboard/hotel' });
  }

  const adminMenu = [
    { label: '👥 Vendedoras', href: '/dashboard/vendedoras' },
    { label: '📦 Produtos', href: '/dashboard/produtos' },
    { label: '📊 Pedidos', href: '/dashboard/pedidos' },
    { label: '🧾 Saques (admin)', href: '/dashboard/saques' },
    { label: '🎁 Bônus (admin)', href: '/dashboard/bonus-admin' },
    { label: '🏨 Reservas do Hotel (Admin)', href: '/dashboard/hotel/admin' }, // ✅ ADICIONADO AQUI
    { label: '🔐 Alterar Senha', href: '/dashboard/profile/senha' },
    { label: '📤 Relatórios', href: '/dashboard/relatorios' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">Jardim Privé</h1>

        <nav className="flex-1 space-y-4">
          {menu.map((item) => (
            <Link key={item.href} href={item.href}>
              <p
                className={cn(
                  'cursor-pointer hover:text-zinc-300',
                  pathname === item.href && 'text-zinc-300 font-semibold'
                )}
              >
                {item.label}
              </p>
            </Link>
          ))}

          {isAdmin && (
            <>
              <hr className="my-4 border-zinc-700" />
              <p className="text-sm uppercase text-zinc-400">Admin</p>
              {adminMenu.map((item) => (
                <Link key={item.href} href={item.href}>
                  <p
                    className={cn(
                      'cursor-pointer hover:text-zinc-300',
                      pathname === item.href && 'text-zinc-300 font-semibold'
                    )}
                  >
                    {item.label}
                  </p>
                </Link>
              ))}
            </>
          )}
        </nav>

        <div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-zinc-50 p-6 space-y-4">
        <NotificationsBanner />
        {children}
      </main>
    </div>
  );
}
