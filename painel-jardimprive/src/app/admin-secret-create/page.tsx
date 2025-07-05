'use client'

import { useState } from 'react'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminSecretCreatePage() {
  const [acesso, setAcesso] = useState('')
  const [liberado, setLiberado] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const senhaSecreta = '21324658Br*1' // 🧠 Só você sabe

  const handleAcesso = () => {
    if (acesso === senhaSecreta) {
      setLiberado(true)
      setMensagem('')
    } else {
      setMensagem('Senha incorreta!')
    }
  }

  const criarAdmin = async () => {
    try {
      await api.post('/auth/register', {
        name: 'Admin Master',
        email: 'admin2@jardimprive.com',
        password: '96164696Kg*1',
        cpf: '00000000000',
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
    <div className="max-w-md mx-auto py-10">
      {!liberado ? (
        <>
          <h1 className="text-xl font-bold mb-4">Acesso restrito</h1>
          <Input
            type="password"
            placeholder="Digite a senha secreta"
            value={acesso}
            onChange={(e) => setAcesso(e.target.value)}
          />
          <Button className="mt-2" onClick={handleAcesso}>
            Entrar
          </Button>
          {mensagem && <p className="mt-2 text-red-600">{mensagem}</p>}
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold mb-4">Criar conta de ADMIN</h1>
          <Button onClick={criarAdmin}>Criar Admin</Button>
          {mensagem && <p className="mt-4 text-green-600">{mensagem}</p>}
        </>
      )}
    </div>
  )
}
