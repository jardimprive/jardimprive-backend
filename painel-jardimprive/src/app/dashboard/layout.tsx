'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import NotificationsBanner from '@/components/notifications-banner';

interface MenuItem {
  label: string;
  href: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [temDiaria, setTemDiaria] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      setIsAdmin(decoded.role === 'ADMIN');
    } catch (err) {
      console.error('Erro ao decodificar token:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const verificarDiaria = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/hotel/minha-diaria', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok && data?.date) {
          setTemDiaria(true);
        }
      } catch (err) {
        console.error('Erro ao verificar diária:', err);
      }
    };

    verificarDiaria();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const baseMenu: MenuItem[] = [
    { label: '🏠 Início', href: '/dashboard' },
    { label: '🛍 Comprar Produtos', href: '/dashboard/comprar' },
    { label: '🛒 Carrinho', href: '/dashboard/carrinho' },
    { label: '🎁 Bônus', href: '/dashboard/bonus' },
    { label: '💰 Comissões', href: '/dashboard/commissions' },
    { label: '💳 Pagamentos', href: '/dashboard/payments' },
    { label: '🏦 Saques', href: '/dashboard/withdrawals' },
    { label: '🧾 Meus Pedidos', href: '/dashboard/meus-pedidos' },
    { label: '🕓 Histórico de Login', href: '/dashboard/profile/history' },
  ];

  if (temDiaria) {
    baseMenu.push({ label: '🏨 Minha Diária no Hotel', href: '/dashboard/hotel' });
  }

  const adminMenu: MenuItem[] = [
    { label: '📜 Atividades', href: '/dashboard/atividades' }, // <- agora só para admins
    { label: '👥 Vendedoras', href: '/dashboard/vendedoras' },
    { label: '📦 Produtos', href: '/dashboard/produtos' },
    { label: '➕ Cadastrar Produto', href: '/dashboard/produtos/novo' },
    { label: '📊 Pedidos', href: '/dashboard/pedidos' },
    { label: '🧾 Saques (admin)', href: '/dashboard/saques' },
    { label: '🎁 Bônus (admin)', href: '/dashboard/bonus-admin' },
    { label: '🏨 Reservas do Hotel (Admin)', href: '/dashboard/hotel/admin' },
    { label: '🔐 Alterar Senha', href: '/dashboard/profile/senha' },
    { label: '📤 Relatórios', href: '/dashboard/relatorios' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Jardim Privé</h1>

        <nav className="flex-1 space-y-4 overflow-y-auto">
          {baseMenu.map((item) => (
            <Link key={item.href} href={item.href}>
              <p
                className={cn(
                  'cursor-pointer px-2 py-1 rounded hover:bg-zinc-800 transition-all',
                  pathname === item.href && 'bg-zinc-800 font-semibold'
                )}
              >
                {item.label}
              </p>
            </Link>
          ))}

          {isAdmin && (
            <>
              <hr className="my-4 border-zinc-700" />
              <p className="text-xs uppercase text-zinc-400">Admin</p>
              {adminMenu.map((item) => (
                <Link key={item.href} href={item.href}>
                  <p
                    className={cn(
                      'cursor-pointer px-2 py-1 rounded hover:bg-zinc-800 transition-all',
                      pathname === item.href && 'bg-zinc-800 font-semibold'
                    )}
                  >
                    {item.label}
                  </p>
                </Link>
              ))}
            </>
          )}
        </nav>

        <Button
          variant="destructive"
          className="mt-6 w-full"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-zinc-50 p-4 sm:p-6 space-y-4 overflow-x-auto">
        <NotificationsBanner />
        {children}
      </main>
    </div>
  );
}
