'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function EditarProdutoPage() {
  const router = useRouter();
  const { id } = useParams();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [active, setActive] = useState(true);
  const [variations, setVariations] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const produto = res.data;
        setName(produto.name);
        setDescription(produto.description);
        setImage(produto.image);
        setActive(produto.active);
        setVariations(produto.variations || []);
      } catch (err) {
        console.error('Erro ao buscar produto:', err);
      }
    };

    if (id) fetchProduto();
  }, [id]);

  const handleChangeVariation = (index: number, field: string, value: any) => {
    const novas = [...variations];
    novas[index][field] = value;
    setVariations(novas);
  };

  const addVariation = () => {
    setVariations([...variations, { sku: '', size: '', price: 0, stock: 0 }]);
  };

  const removeVariation = (index: number) => {
    const novas = variations.filter((_, i) => i !== index);
    setVariations(novas);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await api.put(`/products/${id}`, {
        name,
        description,
        image,
        active,
        variations, // ✅ Envia todas as variações de uma vez
      });

      alert('Produto atualizado com sucesso!');
      router.push('/dashboard/produtos');
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      alert('Erro ao atualizar produto');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>✏️ Editar Produto</CardTitle>
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
                  onChange={(e) => handleChangeVariation(index, 'price', parseFloat(e.target.value))}
                  required
                />
                <Input
                  type="number"
                  placeholder="Estoque"
                  value={v.stock}
                  onChange={(e) => handleChangeVariation(index, 'stock', parseInt(e.target.value))}
                  required
                />
                <Button type="button" variant="destructive" onClick={() => removeVariation(index)}>
                  Remover
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addVariation}>
              Adicionar Variação
            </Button>
          </div>

          <Button type="submit" className="mt-4">
            Salvar Alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
