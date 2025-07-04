'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CadastroPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/users/register', {
        ...form,
        role: 'VENDEDORA', // ✅ Campo necessário para o backend
      });

      setSuccess('Cadastro realizado com sucesso!');
      setTimeout(() => {
        router.push('/login'); // Redireciona para login
      }, 2000);
    } catch (err: any) {
      console.error(err.response?.data); // útil para debug no console
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Erro ao cadastrar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Vendedora</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Nome completo" required onChange={handleChange} />
        <Input name="email" type="email" placeholder="E-mail" required onChange={handleChange} />
        <Input name="cpf" placeholder="CPF" required onChange={handleChange} />
        <Input name="phone" placeholder="Telefone" required onChange={handleChange} />
        <Input name="address" placeholder="Endereço completo" required onChange={handleChange} />
        <Input name="password" type="password" placeholder="Senha" required onChange={handleChange} />

        <Button type="submit" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-600 mt-2">{success}</p>}
    </div>
  );
}
