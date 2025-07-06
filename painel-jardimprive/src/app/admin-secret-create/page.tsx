'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminSecretCreatePage() {
  const [acesso, setAcesso] = useState('')
  const [liberado, setLiberado] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const senhaSecreta = '21324658Br*1' // ⚠️ Senha visível no front-end: cuidado!

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const acessoSalvo = localStorage.getItem('admin_acesso_liberado')
      if (acessoSalvo === 'true') {
        setLiberado(true)
      }
    }
  }, [])

  const handleAcesso = () => {
    if (acesso === senhaSecreta) {
      setLiberado(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_acesso_liberado', 'true')
      }
      setMensagem('')
    } else {
      setMensagem('Senha incorreta!')
    }
  }

  const criarAdmin = async () => {
    try {
      await api.post('/auth/register', {
        name: 'JONATHAN MACIEL F',
        email: 'admin2@jardimprive.com',
        password: '96164696Kg*1',
        cpf: '32442353450',
        phone: '11999999999',
        address: 'Rua do Admin, Nº 1',
        role: 'ADMIN',
      })

      setMensagem('✅ Admin criado com sucesso!')
    } catch (error: any) {
      console.error(error)
      setMensagem('❌ Erro ao criar admin. Talvez ele já exista.')
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 max-w-md mx-auto py-10 space-y-4 overflow-x-hidden">
      {!liberado ? (
        <>
          <h1 className="text-xl font-bold">Acesso restrito</h1>
          <Input
            type="password"
            placeholder="Digite a senha secreta"
            value={acesso}
            onChange={(e) => setAcesso(e.target.value)}
          />
          <Button className="mt-2 w-full sm:w-auto" onClick={handleAcesso}>
            Entrar
          </Button>
          {mensagem && <p className="text-red-600">{mensagem}</p>}
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold">Criar conta de ADMIN</h1>
          <Button className="w-full sm:w-auto" onClick={criarAdmin}>
            Criar Admin
          </Button>
          {mensagem && <p className="text-green-600">{mensagem}</p>}
        </>
      )}
    </div>
  )
}
