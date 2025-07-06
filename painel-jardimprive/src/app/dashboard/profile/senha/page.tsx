'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Errors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function AlterarSenhaPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  // Validação simples e clara da nova senha
  const validatePassword = (password: string) => {
    const errorsList = [];
    if (password.length < 8) errorsList.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errorsList.push('uma letra maiúscula');
    if (!/[0-9]/.test(password)) errorsList.push('um número');
    if (!/[\W_]/.test(password)) errorsList.push('um símbolo');
    return errorsList;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Errors = {};

    if (!currentPassword) newErrors.currentPassword = 'Informe sua senha atual.';

    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation.length > 0) {
      newErrors.newPassword = 'A senha deve conter: ' + passwordValidation.join(', ') + '.';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'A nova senha e a confirmação não coincidem.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // Para se tiver erros
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
      setErrors({});
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      alert(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🔐 Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                aria-describedby="error-currentPassword"
              />
              {errors.currentPassword && (
                <p id="error-currentPassword" className="text-sm text-red-600 mt-1">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                aria-describedby="error-newPassword"
              />
              {errors.newPassword && (
                <p id="error-newPassword" className="text-sm text-red-600 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="error-confirmPassword"
              />
              {errors.confirmPassword && (
                <p id="error-confirmPassword" className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
