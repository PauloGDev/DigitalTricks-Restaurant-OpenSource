import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { X, CreditCard } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function CartaoBrickModal({ onClose, pedidoId, tokenJwt, empresaId, tipoEntrega = "DELIVERY", enderecoEntrega = null, total: totalProp }) {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const mpKeyRef = useRef(null);
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const brickReady = useRef(false);

  // 1. Fetch MP public key and init SDK
  useEffect(() => {
    let active = true;

    const loadKey = async () => {
      try {
        if (empresaId) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/empresas/${empresaId}/mp/public-key`,
            { headers: { Authorization: `Bearer ${tokenJwt}` } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.publicKey) {
              initMercadoPago(data.publicKey, { locale: "pt-BR" });
              mpKeyRef.current = data.publicKey;
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Erro ao buscar MP public key:", e.message);
      }
      // Fallback to env var
      const envKey = import.meta.env.VITE_MP_PUBLIC_KEY;
      if (envKey) initMercadoPago(envKey, { locale: "pt-BR" });
      mpKeyRef.current = envKey;
    };

    loadKey().then(() => {
      if (active) brickReady.current = true;
    });

    return () => { active = false; };
  }, [empresaId, tokenJwt]);

  // 2. Fetch order total
  useEffect(() => {
    let active = true;

    const loadPedido = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/pedidos/${pedidoId}`,
          { headers: { Authorization: `Bearer ${tokenJwt}` } }
        );

        if (!res.ok) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `Erro ao buscar pedido (${res.status})`);
        }

        const data = await res.json();
        const parsed = Number(String(data?.total ?? "").replace(",", "."));

        if (!active) return;
        if (!parsed || parsed <= 0) {
          showNotification("Total do pedido inválido para pagamento.", "error");
          setAmount(0);
        } else {
          setAmount(parsed);
        }
      } catch (e) {
        if (!active) return;
        setAmount(0);
        showNotification(e.message || "Erro ao carregar valor do pedido.", "error");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (pedidoId && tokenJwt) loadPedido();
    return () => { active = false; };
  }, [pedidoId, tokenJwt, showNotification]);

  const initialization = useMemo(() => ({
    amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
  }), [amount]);

  const customization = useMemo(() => ({
    paymentMethods: {
      maxInstallments: 12,
      minInstallments: 1,
    },
    visual: { style: { theme: "default" } },
    maxInstallmentsByMerchant: 12,
  }), []);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        token: formData.token,
        installments: formData.installments || 1,
        paymentMethodId: formData.payment_method_id,
        paymentTypeId: formData.payment_type_id || null, // "credit_card" ou "debit_card"
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

      navigate("/aguardando-pagamento", {
        state: {
          pedidoId,
          total: totalProp || Number(amount),
          tipoPagamento: "CREDIT_CARD",
          tipoEntrega,
          enderecoEntrega,
          status: "AGUARDANDO_PAGAMENTO",
        },
      });
    } catch (e) {
      showNotification(e.message || "Erro no cartão", "error");
    }
  };

  const onError = (error) => {
    console.error(error);
    showNotification("Erro ao carregar pagamento no cartão.", "error");
  };

  const showBrick = !loading && amount && amount > 0 && brickReady.current;

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
              <X className="w-5 h-5 text-zinc-700" />
            </button>
          </div>

          <div className="px-5 py-4">
            {loading ? (
              <div className="text-sm text-zinc-600">Carregando valor do pedido...</div>
            ) : showBrick ? (
              <CardPayment
                key={`card-${pedidoId}-${amount}`}
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
