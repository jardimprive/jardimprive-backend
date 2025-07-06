'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Função para validar CPF básico (formato e dígitos)
function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;

  // Elimina CPFs inválidos conhecidos
  if (/^(.)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

// Função para aplicar máscara de telefone (ex: (99) 99999-9999)
function formatarTelefone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 10) {
    // Formato (99) 9999-9999
    return digits
      .replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
      .replace(/-$/, '');
  } else {
    // Formato (99) 99999-9999 para celular
    return digits
      .replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
      .replace(/-$/, '');
  }
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setForm({ ...form, phone: formatarTelefone(value) });
    } else if (name === 'cpf') {
      // opcional: formatar CPF também, ex: 000.000.000-00
      const cpfFormatado = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setForm({ ...form, cpf: cpfFormatado });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações antes do submit
    if (!validarCPF(form.cpf)) {
      setError('CPF inválido.');
      return;
    }

    // Verifica se telefone tem pelo menos 10 dígitos
    const telDigits = form.phone.replace(/\D/g, '');
    if (telDigits.length < 10) {
      setError('Telefone inválido.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        ...form,
        role: 'VENDEDORA',
      });

      setSuccess('Cadastro realizado com sucesso! Você será redirecionada para o login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.details ||
        err.response?.data?.error ||
        'Erro ao cadastrar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Cadastro de Vendedora
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="name"
              placeholder="Nome completo"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.name}
            />
            <Input
              name="email"
              type="email"
              placeholder="E-mail"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.email}
            />
            <Input
              name="cpf"
              placeholder="CPF (000.000.000-00)"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.cpf}
            />
            <Input
              name="phone"
              placeholder="Telefone (ex: (99) 99999-9999)"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.phone}
            />
            <Input
              name="address"
              placeholder="Endereço completo"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.address}
            />
            <Input
              name="password"
              type="password"
              placeholder="Senha"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.password}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
          {success && <p className="text-green-600 mt-4 text-center">{success}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
