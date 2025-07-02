'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type VariationField = 'sku' | 'size' | 'price' | 'stock';

interface Variation {
  sku: string;
  size: string;
  price: number;
  stock: number;
}

export default function NovoProdutoPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [active, setActive] = useState(true);

  const [variations, setVariations] = useState<Variation[]>([
    { sku: '', size: '', price: 0, stock: 0 },
  ]);

  const handleChangeVariation = (index: number, field: VariationField, value: any) => {
    const newVariations = [...variations];
    newVariations[index] = {
      ...newVariations[index],
      [field]: value,
    };
    setVariations(newVariations);
  };

  const addVariation = () => {
    setVariations([...variations, { sku: '', size: '', price: 0, stock: 0 }]);
  };

  const removeVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.post('/products', {
        name,
        description,
        image,
        active,
        variations,
      });

      alert('Produto criado com sucesso!');
      router.push('/dashboard/produtos');
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      alert('Erro ao criar produto');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📦 Novo Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nome do produto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div>
            <Label>Imagem (URL)</Label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <Label>Ativo</Label>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>

          <div className="space-y-2">
            <Label>Variações</Label>
            {variations.map((v, index) => (
              <div
                key={index}
                className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center border p-2 rounded"
              >
                <Input
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => handleChangeVariation(index, 'sku', e.target.value)}
                  required
                />
                <Input
                  placeholder="Tamanho"
                  value={v.size}
                  onChange={(e) => handleChangeVariation(index, 'size', e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Preço"
                  value={v.price}
                  onChange={(e) =>
                    handleChangeVariation(index, 'price', parseFloat(e.target.value))
                  }
                  required
                />
                <Input
                  type="number"
                  placeholder="Estoque"
                  value={v.stock}
                  onChange={(e) =>
                    handleChangeVariation(index, 'stock', parseInt(e.target.value))
                  }
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeVariation(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addVariation}>
              Adicionar Variação
            </Button>
          </div>

          <Button type="submit" className="mt-4">
            Criar Produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
