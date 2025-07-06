'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface VendedoraInfo {
  name: string;
  email: string;
  totalVendido: number;
}

interface DashboardData {
  totalVendas: number;
  totalVendedoras: number;
  percentual: number;
  comissaoEstimativa: number;
  minhasVendedoras: VendedoraInfo[];
}

export default function PainelLiderPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [linkConvite, setLinkConvite] = useState('');

  const carregarDados = async () => {
    try {
      const res = await api.get('/leader/dashboard');
      setDados(res.data);
    } catch (err) {
      console.error('Erro ao carregar dados da equipe:', err);
      alert('Erro ao carregar dados da equipe.');
    }
  };

  useEffect(() => {
    // Troca Cookies.get por localStorage.getItem
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      const leaderId = decoded?.id;
      const link = `${window.location.origin}/cadastro?lider=${leaderId}`;
      setLinkConvite(link);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, []);

  const copiarLink = () => {
    navigator.clipboard.writeText(linkConvite);
    alert('Link de convite copiado com sucesso!');
  };

  if (!dados) return <p className="text-sm text-muted-foreground">Carregando painel...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Painel da Líder de Equipe</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 📎 Link de convite */}
        <div className="bg-white border rounded p-4 shadow-sm">
          <p className="text-sm text-gray-700 mb-2">
            Compartilhe este link para cadastrar novas vendedoras na sua equipe:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              className="border rounded px-2 py-1 w-full text-sm"
              value={linkConvite}
            />
            <button
              onClick={copiarLink}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              Copiar Link
            </button>
          </div>
        </div>

        {/* 📈 Métricas principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-100 p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600">Total de vendas (30 dias)</p>
            <p className="text-xl font-bold text-green-800">
              {formatCurrency(dados.totalVendas)}
            </p>
          </div>

          <div className="bg-blue-100 p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600">Nº de vendedoras</p>
            <p className="text-xl font-bold text-blue-800">
              {dados.totalVendedoras}
            </p>
          </div>

          <div className="bg-yellow-100 p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600">Comissão (%)</p>
            <p className="text-xl font-bold text-yellow-800">
              {dados.percentual}%
            </p>
          </div>

          <div className="bg-purple-100 p-4 rounded shadow-sm">
            <p className="text-sm text-gray-600">Comissão estimada</p>
            <p className="text-xl font-bold text-purple-800">
              {formatCurrency(dados.comissaoEstimativa)}
            </p>
          </div>
        </div>

        {/* 🧍‍♀️ Lista de vendedoras */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Vendedoras da sua equipe</h3>

          {dados.minhasVendedoras.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma vendedora cadastrada ainda.
            </p>
          ) : (
            // Adicionado overflow-x-auto para responsividade na tabela
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm mt-2 border rounded">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Nome</th>
                    <th className="py-2 px-4 text-left">E-mail</th>
                    <th className="py-2 px-4 text-left">Total Vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.minhasVendedoras.map((v, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{v.name}</td>
                      <td className="py-2 px-4">{v.email}</td>
                      <td className="py-2 px-4">{formatCurrency(v.totalVendido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
