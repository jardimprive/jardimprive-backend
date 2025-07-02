'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [user, setUser] = useState<any>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    photo: '',
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchUser = async () => {
    const res = await api.get('/me');
    setUser(res.data);
    setPreview(res.data.photo || null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/me', {
        name: user.name,
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        photo: preview,
      });
      alert('Dados atualizados com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar os dados.');
      console.error(err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      return alert('A senha deve ter pelo menos 6 caracteres.');
    }

    if (newPassword !== confirmPassword) {
      return alert('As senhas não coincidem.');
    }

    try {
      await api.put('/me/password', { password: newPassword });
      alert('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Erro ao alterar senha.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🧑‍💼 Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Foto de Perfil */}
          <div className="flex items-center space-x-4">
            {preview ? (
              <img
                src={preview}
                alt="Foto de perfil"
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                🤖
              </div>
            )}
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {/* Dados Editáveis */}
          <div>
            <label className="block mb-1">Nome</label>
            <Input name="name" value={user.name} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Email (não editável)</label>
            <Input name="email" value={user.email} disabled />
          </div>
          <div>
            <label className="block mb-1">CPF</label>
            <Input name="cpf" value={user.cpf} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Telefone</label>
            <Input name="phone" value={user.phone || ''} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Endereço</label>
            <Input name="address" value={user.address || ''} onChange={handleChange} />
          </div>

          <Button onClick={handleSave}>Salvar Dados</Button>

          {/* Trocar Senha */}
          <hr className="my-4" />
          <h3 className="font-semibold">🔒 Alterar Senha</h3>
          <div>
            <label className="block mb-1">Nova Senha</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Confirmar Nova Senha</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword}>Alterar Senha</Button>
        </CardContent>
      </Card>
    </div>
  );
}
