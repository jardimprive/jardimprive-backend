'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AlterarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert('A nova senha e a confirmação não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.put('/profile/password', {
        currentPassword,
        newPassword,
      });
      alert('Senha atualizada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      alert(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔐 Alterar Senha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Senha atual</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <Label>Nova senha</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <Label>Confirmar nova senha</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Nova Senha'}
        </Button>
      </CardContent>
    </Card>
  );
}
