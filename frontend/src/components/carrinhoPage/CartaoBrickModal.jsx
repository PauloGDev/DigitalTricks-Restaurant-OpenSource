import React, { useEffect, useMemo, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { X, CreditCard } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function CartaoBrickModal({ onClose, pedidoId, tokenJwt }) {
  const { showNotification } = useNotification();

  const [amount, setAmount] = useState(null); // null = carregando
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: "pt-BR" });
  }, []);

  useEffect(() => {
    let active = true;

    const loadPedido = async () => {
      try {
        setLoading(true);
        setAmount(null);

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/pedidos/public/${pedidoId}`,
          {
            headers: {
              Authorization: `Bearer ${tokenJwt}`,
            },
          }
        );

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Erro ao buscar pedido (${res.status})`);
        }

        const data = await res.json();

        // BigDecimal pode vir string -> Number()
        const parsed = Number(String(data?.total ?? "").replace(",", "."));

        if (!active) return;

        if (!parsed || parsed <= 0) {
          setAmount(0);
          showNotification("Total do pedido inválido para pagamento.", "error");
          return;
        }

        setAmount(parsed);
      } catch (e) {
        if (!active) return;
        setAmount(0);
        showNotification(e.message || "Erro ao carregar valor do pedido.", "error");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (pedidoId && tokenJwt) loadPedido();

    return () => {
      active = false;
    };
  }, [pedidoId, tokenJwt, showNotification]);

  const initialization = useMemo(() => {
    return { amount: Number(amount || 0) };
  }, [amount]);

  const customization = {
    paymentMethods: {
      maxInstallments: 12,
    },
    visual: {
      style: { theme: "default" },
    },
  };

  const onSubmit = async (formData) => {
    try {
      // formData já vem com token, payment_method_id, installments...
      const payload = {
        token: formData.token,
        installments: formData.installments || 1,
        paymentMethodId: formData.payment_method_id,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/pagamentos/${pedidoId}/cartao`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenJwt}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Erro ao processar cartão");
      }

      const data = await res.json();
      showNotification(`Pagamento enviado! Status: ${data.status}`, "success");
      onClose();
    } catch (e) {
      showNotification(e.message || "Erro no cartão", "error");
    }
  };

  const onError = (error) => {
    console.error(error);
    showNotification("Erro ao carregar pagamento no cartão.", "error");
  };

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Pagamento no cartão
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                Os dados do cartão ficam no Mercado Pago (tokenização).
              </p>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
              aria-label="Fechar"
            >
              <X className="h-5 h-5 text-zinc-700" />
            </button>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="text-sm text-zinc-600">Carregando valor do pedido...</div>
            ) : amount && amount > 0 ? (
              <CardPayment
                initialization={initialization}
                customization={customization}
                onSubmit={onSubmit}
                onError={onError}
              />
            ) : (
              <div className="text-sm text-red-600">
                Não foi possível carregar o valor do pedido para pagamento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}