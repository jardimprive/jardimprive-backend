'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Validação de CPF
function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf[10])
}

// Máscara para telefone
function formatarTelefone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits.length <= 10
    ? digits.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '')
    : digits.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3').replace(/-$/, '')
}

export default function CadastroPage() {
  const router = useRouter()
  const nameRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      setForm({ ...form, phone: formatarTelefone(value) })
    } else if (name === 'cpf') {
      const cpfFormatado = value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      setForm({ ...form, cpf: cpfFormatado })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validarCPF(form.cpf)) {
      setError('CPF inválido.')
      return
    }

    const telDigits = form.phone.replace(/\D/g, '')
    if (telDigits.length < 10) {
      setError('Telefone inválido.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/register', { ...form, role: 'VENDEDORA' })
      setSuccess('Cadastro realizado com sucesso! Redirecionando...')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: any) {
      console.error(err)
      setError(
        err?.response?.data?.details ||
        err?.response?.data?.error ||
        'Erro ao cadastrar. Tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

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
              ref={nameRef}
              name="name"
              placeholder="Nome completo"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.name}
              autoComplete="name"
            />
            <Input
              name="email"
              type="email"
              placeholder="E-mail"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.email}
              autoComplete="email"
            />
            <Input
              name="cpf"
              placeholder="CPF (000.000.000-00)"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.cpf}
              autoComplete="off"
            />
            <Input
              name="phone"
              placeholder="Telefone (ex: (99) 99999-9999)"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.phone}
              autoComplete="tel"
            />
            <Input
              name="address"
              placeholder="Endereço completo"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.address}
              autoComplete="street-address"
            />
            <Input
              name="password"
              type="password"
              placeholder="Senha"
              required
              onChange={handleChange}
              disabled={loading}
              value={form.password}
              autoComplete="new-password"
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
  )
}
