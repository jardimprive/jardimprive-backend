'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
  variations: {
    id: string;
    size: string;
    sku: string;
    price: number;
    stock: number;
  }[];
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Product[]>([]);
  const router = useRouter();

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/products');
      setProdutos(res.data);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      await api.put(`/products/${id}`, { active: !ativo });
      fetchProdutos();
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const deletarProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await api.delete(`/products/${id}`);
      fetchProdutos();
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle>📦 Gerenciar Produtos</CardTitle>

        {/* ✅ Botão para adicionar novo produto */}
        <Button onClick={() => router.push('/dashboard/produtos/novo')}>
          ➕ Novo Produto
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-auto">
          <table className="min-w-full mt-4 text-sm text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Produto</th>
                <th className="py-2 px-4">Ativo</th>
                <th className="py-2 px-4">Variações</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id} className="border-b">
                  <td className="py-2 px-4">
                    <strong>{produto.name}</strong>
                    <p className="text-muted-foreground">{produto.description}</p>
                  </td>
                  <td className="py-2 px-4">
                    <Switch
                      checked={produto.active}
                      onCheckedChange={() => toggleAtivo(produto.id, produto.active)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    {produto.variations.map((v) => (
                      <div key={v.id}>
                        <p className="text-xs">
                          {v.size} • R$ {v.price.toFixed(2)} • Estoque: {v.stock}
                        </p>
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/produtos/${produto.id}/editar`)} // ✅ Atualizado
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletarProduto(produto.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
