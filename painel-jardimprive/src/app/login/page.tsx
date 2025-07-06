'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token } = res.data

      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('token', token)
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Erro ao fazer login:', err)
      setError('Login falhou. Verifique suas credenciais.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  const goToRegister = () => {
    router.push('/register')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Entrar na sua conta</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="sr-only" htmlFor="email">Email</label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={handleKeyPress}
              autoComplete="username"
            />

            <label className="sr-only" htmlFor="password">Senha</label>
            <Input
              id="password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={handleKeyPress}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Button variant="outline" onClick={goToRegister} disabled={loading} className="w-full">
            Criar nova conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
