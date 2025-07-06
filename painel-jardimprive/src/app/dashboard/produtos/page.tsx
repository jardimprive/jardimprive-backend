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

  // Carrega do localStorage e depois atualiza com dados da API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('produtos_cache');
      if (saved) setProdutos(JSON.parse(saved));
    }
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const res = await api.get('/products');
      setProdutos(res.data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('produtos_cache', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
    }
  };

  const toggleAtivo = async (id: string, ativo: boolean) => {
    try {
      await api.put(`/products/${id}`, { active: !ativo });
      setProdutos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, active: !ativo } : p
        )
      );
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const deletarProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      await api.delete(`/products/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao deletar produto:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 sm:px-6 md:px-8">
        <CardTitle className="text-lg sm:text-xl">📦 Gerenciar Produtos</CardTitle>

        <Button
          onClick={() => router.push('/dashboard/produtos/novo')}
          className="w-full sm:w-auto"
        >
          ➕ Novo Produto
        </Button>
      </CardHeader>

      <CardContent className="px-2 sm:px-4 md:px-6">
        <div className="overflow-x-auto">
          <table className="min-w-full mt-4 text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-2 px-2 sm:px-4 whitespace-nowrap">Produto</th>
                <th className="py-2 px-2 sm:px-4 whitespace-nowrap text-center">Ativo</th>
                <th className="py-2 px-2 sm:px-4 whitespace-nowrap">Variações</th>
                <th className="py-2 px-2 sm:px-4 whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 sm:px-4 max-w-xs truncate" title={produto.description}>
                    <strong>{produto.name}</strong>
                    <p className="text-muted-foreground truncate text-xs sm:text-sm">
                      {produto.description}
                    </p>
                  </td>
                  <td className="py-2 px-2 sm:px-4 text-center">
                    <Switch
                      checked={produto.active}
                      onCheckedChange={() =>
                        toggleAtivo(produto.id, produto.active)
                      }
                      aria-label={`Ativar ou desativar ${produto.name}`}
                    />
                  </td>
                  <td className="py-2 px-2 sm:px-4 space-y-1 max-w-xs">
                    {produto.variations.map((v) => (
                      <div
                        key={v.id}
                        className="text-xs sm:text-sm truncate"
                        title={`${v.size} • R$ ${v.price.toFixed(
                          2
                        )} • Estoque: ${v.stock}`}
                      >
                        {v.size} • R$ {v.price.toFixed(2)} • Estoque: {v.stock}
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-2 sm:px-4">
                    <div className="flex flex-wrap gap-2 justify-start sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/produtos/${produto.id}/editar`)
                        }
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

              {produtos.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
