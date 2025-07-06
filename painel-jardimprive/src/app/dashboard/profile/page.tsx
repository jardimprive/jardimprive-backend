'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface User {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  address: string;
  photo: string | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    photo: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fetchUserFromApi = useCallback(async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data);
      setPreview(res.data.photo || null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const localData = localStorage.getItem('userProfile');
    if (localData) {
      try {
        const parsed: User = JSON.parse(localData);
        setUser(parsed);
        setPreview(parsed.photo);
      } catch (e) {
        console.warn('Erro ao ler localStorage, buscando da API.');
        fetchUserFromApi();
      }
    } else {
      fetchUserFromApi();
    }
  }, [fetchUserFromApi]);

  const validateCPF = (cpf: string) => /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf);
  const validatePhone = (phone: string) => /^[\d\s()+-]{8,15}$/.test(phone);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUser((old) => ({ ...old, [e.target.name]: e.target.value }));
      setErrors((old) => ({ ...old, [e.target.name]: '' }));
    },
    []
  );

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((old) => ({ ...old, photo: 'Arquivo deve ser uma imagem' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((old) => ({ ...old, photo: 'Imagem deve ter no máximo 2MB' }));
      return;
    }

    setErrors((old) => ({ ...old, photo: '' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = useCallback(async () => {
    let validationErrors: { [key: string]: string } = {};

    if (!user.name.trim()) validationErrors.name = 'Nome é obrigatório';
    if (user.cpf && !validateCPF(user.cpf))
      validationErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
    if (user.phone && !validatePhone(user.phone))
      validationErrors.phone = 'Telefone inválido';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoadingData(true);
    try {
      await api.put('/me', {
        name: user.name.trim(),
        cpf: user.cpf,
        phone: user.phone,
        address: user.address,
        photo: preview,
      });

      alert('Dados atualizados com sucesso!');
      setErrors({});
      const updatedUser = { ...user, photo: preview };
      setUser(updatedUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      }
    } catch (err) {
      alert('Erro ao atualizar os dados.');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  }, [user, preview]);

  const handleChangePassword = useCallback(async () => {
    setErrors((old) => ({ ...old, password: '', confirmPassword: '' }));

    if (newPassword.length < 6) {
      setErrors((old) => ({ ...old, password: 'Senha deve ter pelo menos 6 caracteres' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors((old) => ({ ...old, confirmPassword: 'Senhas não coincidem' }));
      return;
    }

    setLoadingPass(true);
    try {
      await api.put('/me/password', { password: newPassword });
      alert('Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Erro ao alterar senha.');
      console.error(err);
    } finally {
      setLoadingPass(false);
    }
  }, [newPassword, confirmPassword]);

  return (
    <div className="px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🧑‍💼 Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Foto de Perfil */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            {preview ? (
              <img
                src={preview}
                alt="Foto de perfil"
                className="w-24 h-24 rounded-full object-cover border"
              />
            ) : (
              <div
                role="img"
                aria-label="Ícone de perfil padrão"
                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl select-none"
              >
                🤖
              </div>
            )}
            <div className="flex flex-col space-y-1 w-full sm:w-auto">
              <label htmlFor="photo-upload" className="font-medium cursor-pointer text-blue-600 hover:underline">
                Selecionar nova foto
              </label>
              <Input
                type="file"
                accept="image/*"
                id="photo-upload"
                onChange={handlePhotoChange}
                aria-label="Selecionar nova foto de perfil"
                aria-describedby="photo-error"
              />
              {errors.photo && (
                <p className="text-xs text-red-600 mt-1" id="photo-error" role="alert">
                  {errors.photo}
                </p>
              )}
            </div>
          </div>

          {/* Dados Editáveis */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">
                Nome <span className="text-red-600">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'error-name' : undefined}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1" id="error-name" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 font-medium">
                Email (não editável)
              </label>
              <Input id="email" name="email" value={user.email} disabled />
            </div>
            <div>
              <label htmlFor="cpf" className="block mb-1 font-medium">
                CPF
              </label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={user.cpf}
                onChange={handleChange}
                aria-invalid={!!errors.cpf}
                aria-describedby={errors.cpf ? 'error-cpf' : undefined}
              />
              {errors.cpf && (
                <p className="text-xs text-red-600 mt-1" id="error-cpf" role="alert">
                  {errors.cpf}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1 font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="+55 (11) 99999-9999"
                value={user.phone}
                onChange={handleChange}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'error-phone' : undefined}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1" id="error-phone" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="address" className="block mb-1 font-medium">
                Endereço
              </label>
              <Input
                id="address"
                name="address"
                value={user.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={loadingData} className="w-full sm:w-auto">
            {loadingData ? 'Salvando...' : 'Salvar Dados'}
          </Button>

          <hr className="my-6" />
          <h3 className="font-semibold mb-4">🔒 Alterar Senha</h3>
          <div className="space-y-4 max-w-sm">
            <div>
              <label htmlFor="new-password" className="block mb-1 font-medium">
                Nova Senha
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((old) => ({ ...old, password: '' }));
                }}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'error-password' : undefined}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1" id="error-password" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirm-password" className="block mb-1 font-medium">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((old) => ({ ...old, confirmPassword: '' }));
                }}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'error-confirm-password' : undefined}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1" id="error-confirm-password" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button onClick={handleChangePassword} disabled={loadingPass} className="w-full sm:w-auto">
              {loadingPass ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
