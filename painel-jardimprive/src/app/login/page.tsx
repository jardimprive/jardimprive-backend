'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password }) // corrigido
      const { token } = res.data
      localStorage.setItem('token', token)
      router.push('/dashboard') // redireciona após login
    } catch (err) {
      alert('Login falhou. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  const goToRegister = () => {
    router.push('/register') // redireciona para página de cadastro
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <Input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button onClick={handleLogin} disabled={loading} className="w-full max-w-xs">
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Button variant="outline" onClick={goToRegister} className="w-full max-w-xs">
        Criar conta
      </Button>
    </div>
  )
}
