'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SelectItem } from "@/components/select-item";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";

const produtos = [
  { id: "1", nome: "Perfume Jardin Rosé", preco: 150, variationId: "VARIACAO1" },
  { id: "2", nome: "Perfume Bouquet Blanc", preco: 180, variationId: "VARIACAO2" },
  { id: "3", nome: "Perfume Secret Garden", preco: 200, variationId: "VARIACAO3" },
];

interface Payment {
  type: string;
  amount: number;
  status: string;
}

interface Order {
  id: string;
  createdAt: string;
  paymentType: string;
  status: string;
  trackingCode?: string;
  items: {
    variation: {
      product: {
        name: string;
      };
      size: string;
    };
    quantity: number;
    price: number;
  }[];
  payments?: Payment[];
}

export default function OrdersPage() {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedPayment = localStorage.getItem("paymentMethod");
      const savedAddress = localStorage.getItem("address");

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedPayment) setPaymentMethod(savedPayment);
      if (savedAddress) setAddress(savedAddress);

      const fetchOrders = async () => {
        try {
          const res = await api.get("/orders");
          setOrders(res.data);
        } catch (error) {
          console.error("Erro ao buscar pedidos:", error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("paymentMethod", paymentMethod);
      localStorage.setItem("address", address);
    }
  }, [cart, paymentMethod, address]);

  const handleAdd = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id: string) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[id] > 1) {
        newCart[id] = newCart[id] - 1;
      } else {
        delete newCart[id];
      }
      return newCart;
    });
  };

  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const produto = produtos.find((p) => p.id === id);
    return acc + (produto ? produto.preco * qty : 0);
  }, 0);

  const handleSubmit = async () => {
    if (Object.keys(cart).length === 0) {
      alert("⚠️ Adicione pelo menos 1 produto!");
      return;
    }

    if (!paymentMethod) {
      alert("⚠️ Selecione a forma de pagamento!");
      return;
    }

    if (!address.trim()) {
      alert("⚠️ Informe o endereço de entrega!");
      return;
    }

    try {
      const items = Object.entries(cart).map(([id, qty]) => {
        const produto = produtos.find((p) => p.id === id);
        if (!produto) throw new Error("Produto não encontrado");
        return {
          variationId: produto.variationId,
          quantity: qty,
          price: produto.preco,
        };
      });

      const payload: any = {
        items,
        paymentMethod,
        address,
      };

      // Se o pagamento for parcelado, envie a dueDate
      if (paymentMethod === "PARCELADO") {
        payload.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias de prazo
      }

      const response = await api.post("/orders", payload);  // Corrigido para /orders

      if (response.data.checkoutUrl) {
        localStorage.removeItem("cart");
        localStorage.removeItem("paymentMethod");
        localStorage.removeItem("address");

        window.location.href = response.data.checkoutUrl;
      } else {
        alert("Erro ao gerar o link de pagamento.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao criar pedido.");
    }
  };

  const handlePagarParcelaFinal = async (orderId: string) => {
    try {
      const res = await api.post("/orders/parcela-final", {  // Corrigido para /orders
        orderId,
        paymentMethod: 'PARCELADO',
      });

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert("Erro ao gerar link de pagamento.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao gerar link de pagamento.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 space-y-10">
      <h1 className="text-3xl font-bold text-center sm:text-left">🛍️ Finalizar Pedido</h1>

      {/* Produtos */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Escolha os produtos:</h2>

        {produtos.map((produto) => {
          const quantidade = cart[produto.id] || 0;
          return (
            <div
              key={produto.id}
              className="flex flex-col sm:flex-row items-center justify-between border rounded p-4"
            >
              <div className="mb-2 sm:mb-0 text-center sm:text-left">
                <p className="font-semibold">{produto.nome}</p>
                <p className="text-sm text-gray-500">R$ {produto.preco.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(produto.id)}
                >
                  -
                </Button>
                <span className="w-6 text-center">{quantidade}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdd(produto.id)}
                >
                  +
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Pagamento */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Forma de pagamento:</h2>
        <div className="w-full max-w-xs">
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <SelectItem value="AVISTA">À Vista</SelectItem>
            <SelectItem value="PARCELADO">50% Entrada + 50% depois</SelectItem>
            <SelectItem value="CARTAO">Cartão de Crédito</SelectItem>
          </Select>
        </div>
      </section>

      {/* Endereço */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Endereço de entrega:</h2>
        <textarea
          className="w-full border rounded p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={3}
          placeholder="Rua, número, bairro, cidade, complemento..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </section>

      {/* Total */}
      <div className="text-right">
        <p className="text-xl font-semibold">Total: R$ {total.toFixed(2)}</p>
      </div>

      {/* Finalizar */}
      <Button onClick={handleSubmit} className="w-full" size="lg">
        Finalizar Pedido e Pagar
      </Button>

      {/* Histórico de pedidos */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">📜 Meus Pedidos</h2>

        {loadingOrders ? (
          <p>Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p>Você ainda não fez nenhum pedido.</p>
        ) : (
          orders.map((order) => {
            const totalOrder = order.items.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            );

            const parcelaFinal = order.payments?.find(p => p.type === 'PARCELA_FINAL');
            const podePagarParcela = order.paymentType === 'PARCELADO' && parcelaFinal?.status === 'PENDENTE';

            return (
              <Card key={order.id} className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="break-words">
                    <p className="font-semibold">Pedido #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Total: R$ {totalOrder.toFixed(2)}</p>
                    <p className="text-sm capitalize">Status: {order.status}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm break-words">
                      {item.variation.product.name} - {item.variation.size} x {item.quantity} (R$ {item.price.toFixed(2)} cada)
                    </p>
                  ))}
                </div>

                {order.trackingCode && (
                  <p className="text-sm break-words">
                    Código de rastreio: <b>{order.trackingCode}</b>
                  </p>
                )}

                {order.payments && order.payments.length > 0 && (
                  <div className="mt-3 space-y-1 text-sm">
                    <p className="font-semibold">💳 Pagamentos:</p>
                    {order.payments.map((payment, i) => (
                      <p key={i}>
                        {payment.type === 'PARCELA_ENTRADA' && 'Entrada:'}
                        {payment.type === 'PARCELA_FINAL' && 'Parcela Final:'}
                        {payment.type === 'AVISTA' && 'À Vista:'}
                        {' '}
                        <span className={payment.status === 'PAGO' ? 'text-green-600' : 'text-red-600'}>
                          {payment.status === 'PAGO' ? '✅ Pago' : '❌ Pendente'}
                        </span>{' '}
                        - R$ {payment.amount.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}

                {podePagarParcela && (
                  <Button
                    className="mt-2"
                    variant="default"
                    onClick={() => handlePagarParcelaFinal(order.id)}
                  >
                    Pagar parcela final
                  </Button>
                )}
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
