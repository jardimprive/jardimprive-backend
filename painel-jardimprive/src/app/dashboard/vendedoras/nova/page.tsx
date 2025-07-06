'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function NovaVendedoraPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (form.password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', {
        ...form,
        role: 'VENDEDORA',
      });

      if (typeof window !== 'undefined') {
        alert('✅ Vendedora cadastrada com sucesso!');
      }

      router.push('/dashboard/vendedoras');
    } catch (err: any) {
      console.error('Erro ao cadastrar vendedora:', err);
      setErrorMsg(err.response?.data?.error || 'Erro ao cadastrar vendedora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 md:px-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>👩‍💼 Cadastrar Nova Vendedora</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Formulário de cadastro de vendedora"
          >
            {errorMsg && (
              <div
                className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm"
                role="alert"
                aria-live="assertive"
              >
                {errorMsg}
              </div>
            )}

            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de 6 caracteres.
              </p>
            </div>

            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={form.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="mt-4 w-full sm:w-auto"
              disabled={loading}
              aria-busy={loading}
              aria-label="Cadastrar nova vendedora"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Vendedora'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
