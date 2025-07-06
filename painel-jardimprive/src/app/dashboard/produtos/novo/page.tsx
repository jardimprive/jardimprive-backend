'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function CadastrarProdutoPage() {
  const router = useRouter();

  // Inicializa estados com valores do localStorage, se existirem
  const [name, setName] = useState(() => localStorage.getItem('produto_name') || '');
  const [description, setDescription] = useState(() => localStorage.getItem('produto_description') || '');
  const [image, setImage] = useState(() => localStorage.getItem('produto_image') || '');
  const [active, setActive] = useState(() => {
    const saved = localStorage.getItem('produto_active');
    return saved === null ? true : saved === 'true';
  });
  const [variations, setVariations] = useState<any[]>(() => {
    const saved = localStorage.getItem('produto_variations');
    return saved ? JSON.parse(saved) : [{ sku: '', size: '', price: 0, stock: 0 }];
  });

  // Atualiza localStorage quando estados mudam
  useEffect(() => {
    localStorage.setItem('produto_name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('produto_description', description);
  }, [description]);

  useEffect(() => {
    localStorage.setItem('produto_image', image);
  }, [image]);

  useEffect(() => {
    localStorage.setItem('produto_active', active.toString());
  }, [active]);

  useEffect(() => {
    localStorage.setItem('produto_variations', JSON.stringify(variations));
  }, [variations]);

  const handleChangeVariation = (index: number, field: string, value: any) => {
    const novas = [...variations];
    novas[index][field] = value;
    setVariations(novas);
  };

  const addVariation = () => {
    setVariations([...variations, { sku: '', size: '', price: 0, stock: 0 }]);
  };

  const removeVariation = (index: number) => {
    if (variations.length > 1) {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      await api.post('/products', {
        name,
        description,
        image,
        active,
        variations,
      });

      alert('Produto cadastrado com sucesso!');
      // Limpa localStorage após sucesso
      localStorage.removeItem('produto_name');
      localStorage.removeItem('produto_description');
      localStorage.removeItem('produto_image');
      localStorage.removeItem('produto_active');
      localStorage.removeItem('produto_variations');

      router.push('/dashboard/produtos');
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      alert('Erro ao cadastrar produto');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🆕 Cadastrar Produto - Perfume</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Nome do Produto</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Perfume Rosa - 100ml"
              required
              className="text-base"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição detalhada do perfume"
              className="text-base"
            />
          </div>

          <div>
            <Label>URL da Imagem</Label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://exemplo.com/imagem-perfume.jpg"
              className="text-base"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label>Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="space-y-4">
            <Label>Variações</Label>
            {variations.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center border p-3 rounded"
              >
                <Input
                  placeholder="SKU (ex: PERF-R-100)"
                  value={v.sku}
                  onChange={(e) => handleChangeVariation(index, 'sku', e.target.value)}
                  required
                  className="w-full text-base"
                />
                <Input
                  placeholder="Tamanho (ex: 100ml)"
                  value={v.size}
                  onChange={(e) => handleChangeVariation(index, 'size', e.target.value)}
                  required
                  className="w-full text-base"
                />
                <Input
                  type="number"
                  placeholder="Preço (ex: 129.90)"
                  value={v.price}
                  onChange={(e) =>
                    handleChangeVariation(index, 'price', parseFloat(e.target.value))
                  }
                  required
                  className="w-full text-base"
                  min={0}
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Estoque"
                  value={v.stock}
                  onChange={(e) =>
                    handleChangeVariation(index, 'stock', parseInt(e.target.value))
                  }
                  required
                  className="w-full text-base"
                  min={0}
                  step="1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeVariation(index)}
                  className="w-full sm:w-auto"
                  disabled={variations.length === 1}
                >
                  Remover
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addVariation} className="w-full sm:w-auto">
              Adicionar Variação
            </Button>
          </div>

          <Button type="submit" className="mt-4 w-full sm:w-auto">
            Cadastrar Produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
