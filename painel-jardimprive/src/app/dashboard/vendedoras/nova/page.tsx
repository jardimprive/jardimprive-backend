'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card, CardHeader, CardTitle, CardContent,
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

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.post('/users/register', {
        ...form,
        role: 'VENDEDORA',
      });

      alert('Vendedora cadastrada com sucesso!');
      router.push('/dashboard/vendedoras');
    } catch (err) {
      console.error('Erro ao cadastrar vendedora:', err);
      alert('Erro ao cadastrar vendedora');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>👩‍💼 Cadastrar Nova Vendedora</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />
          </div>
          <div>
            <Label>CPF</Label>
            <Input value={form.cpf} onChange={(e) => handleChange('cpf', e.target.value)} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div>
            <Label>Endereço</Label>
            <Input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
          </div>

          <Button type="submit" className="mt-4">Cadastrar Vendedora</Button>
        </form>
      </CardContent>
    </Card>
  );
}
