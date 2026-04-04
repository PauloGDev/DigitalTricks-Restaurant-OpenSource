import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CreditCard,
  Wallet,
  Store,
  Truck,
  Banknote,
  BadgeDollarSign,
  X,
  CheckCircle2,
} from "lucide-react";

/* ---------- Modal base (reutilizável) ---------- */
function Modal({ open, title, subtitle, icon: Icon, children, onClose, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          ref={panelRef}
          className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-zinc-100 bg-white/95 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {Icon ? (
                    <span className="h-9 w-9 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                      <Icon className="w-5 h-5" />
                    </span>
                  ) : null}
                  <h3 className="text-lg font-extrabold text-zinc-900">{title}</h3>
                </div>
                {subtitle ? (
                  <p className="text-sm text-zinc-600 mt-2">{subtitle}</p>
                ) : null}
              </div>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-zinc-800" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-6 py-5">{children}</div>

          {/* Footer */}
          {footer ? (
            <div className="px-5 sm:px-6 py-4 border-t border-zinc-100 bg-white/95 backdrop-blur">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ---------- UI helpers ---------- */
function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-zinc-500 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-base font-extrabold text-zinc-900 mt-1">{subtitle}</p>
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const cls =
    tone === "warn"
      ? "bg-amber-50 text-amber-900 border-amber-200"
      : tone === "ok"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
      : tone === "danger"
      ? "bg-red-50 text-red-900 border-red-200"
      : "bg-zinc-50 text-zinc-800 border-zinc-200";

  return (
    <span className={["inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold", cls].join(" ")}>
      {children}
    </span>
  );
}

function OptionButton({ active, onClick, icon: Icon, label, tone = "neutral" }) {
  const toneClasses =
    tone === "red"
      ? active
        ? "bg-red-600 text-white border-red-700 ring-2 ring-red-500/20 shadow-[0_16px_34px_rgba(220,38,38,0.20)]"
        : "bg-white text-red-700 border-red-200 hover:bg-red-50"
      : tone === "emerald"
      ? active
        ? "bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/20"
        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
      : tone === "blue"
      ? active
        ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20"
        : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
      : tone === "amber"
      ? active
        ? "bg-amber-500 text-black border-amber-600 ring-2 ring-amber-500/20"
        : "bg-white text-amber-900 border-amber-200 hover:bg-amber-50"
      : active
      ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/10"
      : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border px-4 py-3 font-extrabold text-sm transition",
        "inline-flex items-center justify-center gap-2",
        "active:scale-[0.99]",
        toneClasses,
      ].join(" ")}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}

/* ---------- Componente principal ---------- */
export default function PaymentAndDeliverySelector({
  tipoEntrega,
  setTipoEntrega,
  tipoPagamento,
  setTipoPagamento,
  payOnMethod,
  setPayOnMethod,
  precisaTroco,
  setPrecisaTroco,
  trocoPara,
  setTrocoPara,
  enderecoId,
}) {
  const [payOnModalOpen, setPayOnModalOpen] = useState(false);
  const [selectedPayOnTemp, setSelectedPayOnTemp] = useState(null); // DEBIT/CREDIT/CASH (temporário no modal)

  const [trocoModalOpen, setTrocoModalOpen] = useState(false);
  const [trocoTemp, setTrocoTemp] = useState("");

  const deliveryHint = useMemo(() => {
    if (tipoEntrega === "RETIRADA") return "Você vai buscar no estabelecimento. Sem frete.";
    if (!enderecoId) return "Selecione um endereço para calcular/confirmar a entrega.";
    return "Entrega no endereço selecionado.";
  }, [tipoEntrega, enderecoId]);

  const payTitle = useMemo(() => {
    if (tipoPagamento === "PIX") return "PIX";
    if (tipoPagamento === "CREDIT_CARD") return "Cartão";
    if (tipoPagamento === "PAY_ON_DELIVERY") return "Na entrega";
    return "Nenhuma";
  }, [tipoPagamento]);

  const entregaPillTone =
    tipoEntrega === "RETIRADA" ? "warn" : enderecoId ? "ok" : "danger";

  const openPayOnModal = () => {
    setTipoPagamento("PAY_ON_DELIVERY");
    setSelectedPayOnTemp(payOnMethod); // mantém se já tiver
    setPayOnModalOpen(true);
  };

  const confirmPayOn = () => {
    if (!selectedPayOnTemp) return;

    setPayOnMethod(selectedPayOnTemp);

    if (selectedPayOnTemp !== "CASH") {
      setPrecisaTroco(false);
      setTrocoPara("");
    }

    setPayOnModalOpen(false);

    // Se for dinheiro, já abre modal de troco (opcional, mas UX top)
    if (selectedPayOnTemp === "CASH") {
      setTrocoTemp(trocoPara || "");
      setTrocoModalOpen(true);
    }
  };

  const confirmTroco = () => {
    // Normaliza
    const raw = String(trocoTemp || "").trim();
    if (!raw) {
      setPrecisaTroco(false);
      setTrocoPara("");
      setTrocoModalOpen(false);
      return;
    }

    setPrecisaTroco(true);
    setTrocoPara(raw);
    setTrocoModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* ENTREGA */}
      <Card
        title="Entrega"
        subtitle="Como você quer receber?"
        right={
          <Pill tone={entregaPillTone}>
            {tipoEntrega === "RETIRADA" ? "Retirada" : "Entrega"}
          </Pill>
        }
      >
        <p className="text-sm text-zinc-600 mb-4">{deliveryHint}</p>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            active={tipoEntrega === "DELIVERY"}
            onClick={() => setTipoEntrega("DELIVERY")}
            icon={Truck}
            label="Entrega"
            tone="red"
          />
          <OptionButton
            active={tipoEntrega === "RETIRADA"}
            onClick={() => setTipoEntrega("RETIRADA")}
            icon={Store}
            label="Retirar"
            tone="neutral"
          />
        </div>
      </Card>

      {/* PAGAMENTO */}
      <Card
        title="Pagamento"
        subtitle="Escolha como pagar"
        right={<Pill tone={tipoPagamento ? "ok" : "warn"}>{payTitle}</Pill>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <OptionButton
            active={tipoPagamento === "PIX"}
            onClick={() => {
              setTipoPagamento("PIX");
              setPayOnMethod(null);
              setPrecisaTroco(false);
              setTrocoPara("");
            }}
            icon={Wallet}
            label="PIX"
            tone="emerald"
          />

          <OptionButton
            active={tipoPagamento === "CREDIT_CARD"}
            onClick={() => {
              setTipoPagamento("CREDIT_CARD");
              setPayOnMethod(null);
              setPrecisaTroco(false);
              setTrocoPara("");
            }}
            icon={CreditCard}
            label="Cartão"
            tone="blue"
          />

          {/* Na entrega abre MODAL */}
          <OptionButton
            active={tipoPagamento === "PAY_ON_DELIVERY"}
            onClick={openPayOnModal}
            icon={BadgeDollarSign}
            label="Na entrega"
            tone="amber"
          />
        </div>

        {/* Preview bonito da escolha */}
        {tipoPagamento === "PAY_ON_DELIVERY" ? (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-extrabold text-amber-900">
              Pagamento na entrega
            </p>

            <div className="mt-2 text-sm text-amber-900">
              <span className="font-semibold">Método:</span>{" "}
              <strong>
                {payOnMethod === "DEBIT"
                  ? "Débito"
                  : payOnMethod === "CREDIT"
                  ? "Crédito"
                  : payOnMethod === "CASH"
                  ? "Dinheiro"
                  : "Não selecionado"}
              </strong>
              {payOnMethod === "CASH" ? (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-semibold">Troco:</span>{" "}
                  <strong>
                    {precisaTroco ? `para ${trocoPara || "—"}` : "não precisa"}
                  </strong>
                </>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={openPayOnModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-amber-200 bg-white hover:bg-zinc-50 transition font-extrabold text-amber-900 text-sm"
              >
                Alterar método
              </button>

              {payOnMethod === "CASH" ? (
                <button
                  type="button"
                  onClick={() => {
                    setTrocoTemp(trocoPara || "");
                    setTrocoModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition font-extrabold text-white text-sm"
                >
                  Ajustar troco
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>

      {/* MODAL: selecionar débito/crédito/dinheiro */}
      <Modal
        open={payOnModalOpen}
        onClose={() => setPayOnModalOpen(false)}
        title="Pagar na entrega"
        subtitle="Escolha como você vai pagar no recebimento."
        icon={BadgeDollarSign}
        footer={
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => setPayOnModalOpen(false)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-extrabold text-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!selectedPayOnTemp}
              onClick={confirmPayOn}
              className={[
                "w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold transition",
                !selectedPayOnTemp
                  ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500 text-white",
              ].join(" ")}
            >
              Confirmar
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedPayOnTemp("DEBIT")}
            className={[
              "rounded-2xl border px-4 py-3 font-extrabold text-sm transition",
              selectedPayOnTemp === "DEBIT"
                ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/10"
                : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
            ].join(" ")}
          >
            Débito
          </button>

          <button
            type="button"
            onClick={() => setSelectedPayOnTemp("CREDIT")}
            className={[
              "rounded-2xl border px-4 py-3 font-extrabold text-sm transition",
              selectedPayOnTemp === "CREDIT"
                ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/10"
                : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
            ].join(" ")}
          >
            Crédito
          </button>

          <button
            type="button"
            onClick={() => setSelectedPayOnTemp("CASH")}
            className={[
              "rounded-2xl border px-4 py-3 font-extrabold text-sm transition inline-flex items-center justify-center gap-2",
              selectedPayOnTemp === "CASH"
                ? "bg-zinc-900 text-white border-zinc-900 ring-2 ring-zinc-900/10"
                : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50",
            ].join(" ")}
          >
            <Banknote className="w-4 h-4" />
            Dinheiro
          </button>
        </div>

        {selectedPayOnTemp === "CASH" ? (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-extrabold text-amber-900">
              Dinheiro
            </p>
            <p className="text-sm text-amber-900/90 mt-1">
              Depois você pode informar o troco (se precisar).
            </p>
          </div>
        ) : null}
      </Modal>

      {/* MODAL: Troco */}
      <Modal
        open={trocoModalOpen}
        onClose={() => setTrocoModalOpen(false)}
        title="Troco"
        subtitle="Se precisar, informe o valor para o troco (ex: 50,00)."
        icon={Banknote}
        footer={
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                // marcar que não precisa
                setPrecisaTroco(false);
                setTrocoPara("");
                setTrocoTemp("");
                setTrocoModalOpen(false);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-extrabold text-zinc-800"
            >
              Não preciso
            </button>

            <button
              type="button"
              onClick={confirmTroco}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold transition inline-flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirmar
            </button>
          </div>
        }
      >
        <div className="space-y-2">
          <label className="text-sm font-extrabold text-zinc-900">
            Troco para quanto?
          </label>
          <input
            value={trocoTemp}
            onChange={(e) => setTrocoTemp(e.target.value)}
            inputMode="decimal"
            placeholder="50,00"
            className={[
              "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none",
              "focus:ring-2 focus:ring-amber-500/25 focus:border-amber-300",
            ].join(" ")}
          />
          <p className="text-xs text-zinc-500">
            Se você vai pagar com <strong>R$ 50</strong>, informe <strong>50,00</strong>.
          </p>

          {/* Toggle rápido */}
          <button
            type="button"
            onClick={() => {
              // Atalho: abre/fecha "precisa troco"
              if (!trocoTemp) setTrocoTemp("50,00");
            }}
            className="mt-2 inline-flex items-center gap-2 text-sm font-extrabold text-amber-900 hover:underline"
          >
          </button>
        </div>
      </Modal>

      {/* Ação: ao clicar no checkbox (se você ainda quiser manter checkbox em algum lugar) */}
      {/* Nesse design, o troco é ajustado pelo botão "Ajustar troco" no preview. */}
    </div>
  );
}