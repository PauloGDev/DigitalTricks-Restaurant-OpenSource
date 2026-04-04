import { memo, useEffect, useMemo, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Clock3,
  Package,
  Truck,
  User,
  Wallet,
  Edit2,
  Receipt,
  Hash,
  StickyNote,
  CircleDollarSign,
  Phone,
  Check,
  ChefHat,
  Bike,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CookingPot,
  Layers3,
  XCircle,
} from "lucide-react";

const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STATUS_LABELS = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu p/ entrega",
  ENTREGUE: "Entregue",
  AGUARDANDO_RETIRADA: "Aguardando retirada",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

const STATUS_PAGAMENTO_LABELS = {
  PENDENTE: "Pagamento pendente",
  PROCESSANDO: "Pagamento em processamento",
  APROVADO: "Pagamento aprovado",
  RECUSADO: "Pagamento recusado",
  CANCELADO: "Pagamento cancelado",
  ESTORNADO: "Pagamento estornado",
  REEMBOLSADO: "Pagamento reembolsado",
};

function formatDate(date) {
  try {
    return new Date(date).toLocaleString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatPhone(phone) {
  if (!phone) return "—";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
}

function contarItens(itens = []) {
  return itens.reduce((acc, item) => acc + Number(item?.quantidade ?? 0), 0);
}

function getThemeState() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
}

function statusPill(status, isDark) {
  switch (status) {
    case "AGUARDANDO_PAGAMENTO":
      return isDark
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
        : "border-yellow-200 bg-yellow-50 text-yellow-800";

    case "RECEBIDO":
      return isDark
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-800";

    case "EM_PREPARO":
      return isDark
        ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
        : "border-orange-200 bg-orange-50 text-orange-800";

    case "PRONTO":
      return isDark
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";

    case "SAIU_PARA_ENTREGA":
      return isDark
        ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-800";

    case "AGUARDANDO_RETIRADA":
      return isDark
        ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
        : "border-violet-200 bg-violet-50 text-violet-800";

    case "RETIRADO":
    case "ENTREGUE":
      return isDark
        ? "border-white/10 bg-white/5 text-white/75"
        : "border-zinc-200 bg-zinc-100 text-zinc-800";

    case "CANCELADO":
      return isDark
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-red-200 bg-red-50 text-red-800";

    default:
      return isDark
        ? "border-white/10 bg-white/5 text-white/75"
        : "border-zinc-200 bg-zinc-100 text-zinc-800";
  }
}

function paymentPill(statusPagamento, isDark) {
  switch (statusPagamento) {
    case "APROVADO":
      return isDark
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "PROCESSANDO":
      return isDark
        ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-800";
    case "RECUSADO":
    case "CANCELADO":
      return isDark
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-red-200 bg-red-50 text-red-800";
    case "ESTORNADO":
    case "REEMBOLSADO":
      return isDark
        ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
        : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800";
    default:
      return isDark
        ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
        : "border-yellow-200 bg-yellow-50 text-yellow-800";
  }
}

function resolveTipoEntrega(pedido) {
  if (pedido?.tipoEntrega) return pedido.tipoEntrega;
  if (pedido?.mesa) return "LOCAL";
  if (pedido?.enderecoEntrega) return "DELIVERY";
  return "RETIRADA";
}

function getEntregaLabel(pedido) {
  const entregaType = resolveTipoEntrega(pedido);

  if (entregaType === "DELIVERY") return "Delivery";
  if (entregaType === "RETIRADA") return "Retirada";
  if (entregaType === "LOCAL") return "Mesa";
  return "Retirada";
}

function getPagamentoLabel(pedido) {
  const payType =
    pedido?.tipoPagamento || (pedido?.pagamentoNaEntrega ? "PAY_ON_DELIVERY" : null);

  if (payType === "PAY_ON_DELIVERY") {
    const metodo = pedido?.pagamentoNaEntrega?.metodo;

    if (metodo === "CASH") return "Dinheiro na entrega";
    if (metodo === "DEBIT_CARD") return "Débito na entrega";
    if (metodo === "CREDIT_CARD") return "Crédito na entrega";

    return "Pagamento na entrega";
  }

  if (payType === "PIX") return "PIX";
  if (payType === "CREDIT_CARD") return "Cartão de crédito";
  if (payType === "DEBIT_CARD") return "Cartão de débito";

  return "—";
}

function getPagamentoDetalhe(pedido) {
  const pagamentoEntrega = pedido?.pagamentoNaEntrega;
  const statusPagamento = String(pedido?.statusPagamento || "").trim().toUpperCase();

  if (pedido?.tipoPagamento === "PAY_ON_DELIVERY" && pagamentoEntrega) {
    if (pagamentoEntrega.metodo === "CASH") {
      if (pagamentoEntrega.precisaTroco && pagamentoEntrega.trocoPara != null) {
        return `Troco para ${formatMoney.format(Number(pagamentoEntrega.trocoPara))}`;
      }
      return "Dinheiro sem troco";
    }

    if (pagamentoEntrega.metodo === "DEBIT_CARD") {
      return "Pagamento no débito na entrega";
    }

    if (pagamentoEntrega.metodo === "CREDIT_CARD") {
      return "Pagamento no crédito na entrega";
    }

    return "Pagamento realizado na entrega";
  }

  if (statusPagamento) {
    return STATUS_PAGAMENTO_LABELS[statusPagamento] || statusPagamento;
  }

  return null;
}

function getTempoEmMinutos(data) {
  if (!data) return 0;
  const agora = new Date();
  const criadoEm = new Date(data);
  const diffMs = agora - criadoEm;
  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

function formatTempoDecorrido(data) {
  const minutos = getTempoEmMinutos(data);
  const horas = Math.floor(minutos / 60);

  if (horas > 0) return `${horas}h ${minutos % 60}min`;
  return `${minutos} min`;
}

function getUrgenciaInfo(data, status, isDark) {
  if (!data || ["ENTREGUE", "RETIRADO", "CANCELADO"].includes(status)) {
    return {
      cardClass: isDark
        ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
        : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]",
      badgeClass: null,
      badgeText: null,
      timeClass: isDark
        ? "bg-white/10 text-white/80"
        : "bg-zinc-100 text-zinc-700",
    };
  }

  const diffMin = getTempoEmMinutos(data);

  if (diffMin >= 50) {
    return {
      cardClass: isDark
        ? "border-red-500/30 bg-gradient-to-br from-red-500/10 via-[#181818] to-[#121212] ring-2 ring-red-500/20 shadow-[0_20px_60px_rgba(239,68,68,0.20)]"
        : "border-red-300 bg-gradient-to-br from-red-50 via-white to-white ring-2 ring-red-100 shadow-[0_20px_60px_rgba(239,68,68,0.16)]",
      badgeClass: isDark
        ? "bg-red-500 text-white shadow-sm"
        : "bg-red-600 text-white shadow-sm",
      badgeText: "Muito atrasado",
      timeClass: isDark
        ? "bg-red-500/15 text-red-300"
        : "bg-red-100 text-red-700",
    };
  }

  if (diffMin >= 35) {
    return {
      cardClass: isDark
        ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#181818] to-[#121212] ring-2 ring-amber-500/15 shadow-[0_16px_45px_rgba(245,158,11,0.15)]"
        : "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white ring-2 ring-amber-100 shadow-[0_16px_45px_rgba(245,158,11,0.12)]",
      badgeClass: isDark
        ? "bg-amber-400 text-black shadow-sm"
        : "bg-amber-500 text-black shadow-sm",
      badgeText: "Atenção",
      timeClass: isDark
        ? "bg-amber-500/15 text-amber-300"
        : "bg-amber-100 text-amber-800",
    };
  }

  return {
    cardClass: isDark
      ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03] shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
      : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50/70 shadow-[0_12px_35px_rgba(15,23,42,0.06)]",
    badgeClass: null,
    badgeText: null,
    timeClass: isDark
      ? "bg-white/10 text-white/80"
      : "bg-zinc-100 text-zinc-700",
  };
}

function precisaTroco(pedido) {
  return Boolean(
    pedido?.pagamentoNaEntrega?.metodo === "CASH" &&
      pedido?.pagamentoNaEntrega?.precisaTroco
  );
}

function getPedidoResumoFinanceiro(pedido) {
  const subtotalCalculado = (pedido.itens || []).reduce(
    (acc, item) => acc + Number(item?.totalItem ?? 0),
    0
  );

  const subtotal = Number(pedido.subtotal ?? subtotalCalculado ?? 0);
  const frete = Number(pedido.valorFrete ?? 0);
  const total = Number(pedido.total ?? subtotal + frete);

  return { subtotal, frete, total };
}

function getObservacoesItens(itens = []) {
  return itens
    .filter((item) => item?.observacao)
    .map((item) => ({
      nomeProduto: item.nomeProduto,
      observacao: item.observacao,
    }));
}

function MiniInfo({ icon: Icon, label, value, tone = "default", isDark }) {
  const toneClass =
    tone === "highlight"
      ? isDark
        ? "border-red-500/15 bg-gradient-to-br from-red-500/10 to-transparent"
        : "border-red-100 bg-gradient-to-br from-red-50 to-white"
      : isDark
      ? "border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.02]"
      : "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white";

  const iconClass =
    tone === "highlight"
      ? isDark
        ? "text-red-300"
        : "text-red-600"
      : isDark
      ? "text-white/65"
      : "text-zinc-500";

  return (
    <div className={`rounded-2xl border px-3 py-3 shadow-sm ${toneClass}`}>
      <div className="flex items-start gap-2.5">
        <span
          className={[
            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl shadow-sm",
            isDark ? "bg-white/5" : "bg-white",
          ].join(" ")}
        >
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </span>

        <div className="min-w-0">
          <div
            className={[
              "text-[10px] font-extrabold uppercase tracking-[0.12em]",
              isDark ? "text-white/40" : "text-zinc-500",
            ].join(" ")}
          >
            {label}
          </div>
          <div
            className={[
              "mt-1 break-words text-sm font-bold",
              isDark ? "text-white" : "text-zinc-900",
            ].join(" ")}
          >
            {value || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, children, className = "", onClick }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3",
        "text-sm font-extrabold transition-all duration-300",
        "hover:-translate-y-[1px] active:scale-[0.98]",
        className,
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function EntregaBadge({ pedido, isDark }) {
  const entregaLabel = getEntregaLabel(pedido);
  const isDelivery = entregaLabel === "Delivery";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm",
        isDelivery
          ? isDark
            ? "bg-blue-500/15 text-blue-300"
            : "bg-blue-100 text-blue-800"
          : isDark
          ? "bg-violet-500/15 text-violet-300"
          : "bg-violet-100 text-violet-800",
      ].join(" ")}
    >
      {isDelivery ? <Truck className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
      {entregaLabel === "Delivery" ? "DELIVERY" : entregaLabel === "Mesa" ? "MESA" : "RETIRADA"}
    </span>
  );
}

function ItemOpcionalLine({ opcional, isDark }) {
  return (
    <div
      className={[
        "flex items-start justify-between gap-3 rounded-xl px-2.5 py-1.5",
        isDark ? "bg-white/[0.03]" : "bg-white",
      ].join(" ")}
    >
      <div
        className={[
          "min-w-0 text-xs font-medium",
          isDark ? "text-white/75" : "text-zinc-700",
        ].join(" ")}
      >
        + {opcional.quantidade}x {opcional.nome}
      </div>

      {Number(opcional.precoExtra || 0) > 0 ? (
        <div
          className={[
            "shrink-0 text-[11px] font-bold",
            isDark ? "text-white/45" : "text-zinc-500",
          ].join(" ")}
        >
          {formatMoney.format(Number(opcional.precoExtra || 0))}
        </div>
      ) : null}
    </div>
  );
}

function PedidoItemCard({ item, isDark }) {
  const totalOpcionais = Number(item?.totalOpcionais ?? 0);
  const totalItem = Number(item?.totalItem ?? 0);

  return (
    <div
      className={[
        "rounded-2xl border p-3 shadow-sm",
        isDark
          ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03]"
          : "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={[
              "text-base font-black leading-5",
              isDark ? "text-white" : "text-zinc-900",
            ].join(" ")}
          >
            {item.quantidade}x {item.nomeProduto}
          </div>

          <div
            className={[
              "mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold",
              isDark ? "text-white/45" : "text-zinc-500",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              Unitário: {formatMoney.format(Number(item.precoUnitario || 0))}
            </span>

            {totalOpcionais > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Layers3 className="h-3.5 w-3.5" />
                Opcionais: {formatMoney.format(totalOpcionais)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={[
              "text-[10px] font-extrabold uppercase tracking-[0.14em]",
              isDark ? "text-white/35" : "text-zinc-400",
            ].join(" ")}
          >
            Item
          </div>
          <div className="text-sm font-black text-[#E5252A]">
            {formatMoney.format(totalItem)}
          </div>
        </div>
      </div>

      {item.opcionais?.length ? (
        <div className="mt-3 space-y-2">
          {item.opcionais.map((grupo, idx) => (
            <div
              key={`${grupo.grupoId ?? idx}-${idx}`}
              className={[
                "rounded-xl border p-2.5",
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-zinc-200 bg-zinc-50",
              ].join(" ")}
            >
              <div
                className={[
                  "mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em]",
                  isDark ? "text-red-300" : "text-red-600",
                ].join(" ")}
              >
                {grupo.grupoNome}
              </div>

              <div className="space-y-1.5">
                {(grupo.itens || []).map((opcional, oIdx) => (
                  <ItemOpcionalLine
                    key={`${opcional.itemId ?? oIdx}-${oIdx}`}
                    opcional={opcional}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {item.observacao ? (
        <div
          className={[
            "mt-3 rounded-xl border px-3 py-2.5",
            isDark
              ? "border-amber-500/20 bg-amber-500/10"
              : "border-amber-200 bg-amber-50",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            <StickyNote
              className={[
                "mt-0.5 h-4 w-4 shrink-0",
                isDark ? "text-amber-300" : "text-amber-700",
              ].join(" ")}
            />
            <div
              className={[
                "text-xs font-semibold break-words",
                isDark ? "text-amber-100" : "text-amber-900",
              ].join(" ")}
            >
              {item.observacao}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KanbanPedidoCardComponent({
  pedido,
  onEdit,
  onQuickStatusChange,
  isNew = false,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(pedido.id),
    data: {
      type: "pedido",
      pedido,
    },
  });

  const [pulseNew, setPulseNew] = useState(isNew);
  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    if (!isNew) {
      setPulseNew(false);
      return;
    }

    setPulseNew(true);
    const timer = setTimeout(() => setPulseNew(false), 8000);
    return () => clearTimeout(timer);
  }, [isNew]);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const entregaLabel = getEntregaLabel(pedido);
  const paymentLabel = getPagamentoLabel(pedido);
  const paymentDetail = getPagamentoDetalhe(pedido);

  const totalItens = useMemo(() => contarItens(pedido.itens || []), [pedido.itens]);
  const urgenciaInfo = useMemo(
    () => getUrgenciaInfo(pedido.data, pedido.status, isDark),
    [pedido.data, pedido.status, isDark]
  );

  const financeiro = useMemo(() => getPedidoResumoFinanceiro(pedido), [pedido]);
  const observacoesItens = useMemo(() => getObservacoesItens(pedido.itens || []), [pedido.itens]);

  const localEntrega =
    pedido.mesa
      ? `Mesa ${pedido.mesa}`
      : resolveTipoEntrega(pedido) === "RETIRADA"
      ? "Retirada no local"
      : pedido.enderecoEntrega?.bairro
      ? pedido.enderecoEntrega.bairro
      : resolveTipoEntrega(pedido) === "DELIVERY"
      ? "Delivery"
      : "Local não informado";

  const enderecoCompleto = pedido.enderecoEntrega
    ? [
        pedido.enderecoEntrega.logradouro,
        pedido.enderecoEntrega.numero,
        pedido.enderecoEntrega.bairro,
      ]
        .filter(Boolean)
        .join(", ")
    : resolveTipoEntrega(pedido) === "RETIRADA"
    ? "Cliente irá retirar no local"
    : resolveTipoEntrega(pedido) === "DELIVERY"
    ? "Endereço não informado"
    : pedido.mesa
    ? `Atendimento na mesa ${pedido.mesa}`
    : "Local não informado";

  const badgeTroco = precisaTroco(pedido);
  const statusPagamento = String(pedido?.statusPagamento || "").trim().toUpperCase();

  const podeAceitar = ["AGUARDANDO_PAGAMENTO", "RECEBIDO"].includes(pedido.status);
  const podeMarcarPreparo = ["RECEBIDO"].includes(pedido.status);
  const podeMarcarPronto = ["EM_PREPARO"].includes(pedido.status);
  const podeSair = pedido.status === "PRONTO" && entregaLabel === "Delivery";
  const podeFinalizar =
    pedido.status === "SAIU_PARA_ENTREGA" ||
    pedido.status === "AGUARDANDO_RETIRADA" ||
    (pedido.status === "PRONTO" && entregaLabel === "Retirada");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        "cursor-grab select-none rounded-[28px] border p-4",
        "transition-all duration-300 hover:-translate-y-[2px]",
        isDark
          ? "hover:shadow-[0_22px_55px_rgba(0,0,0,0.38)]"
          : "hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]",
        "active:cursor-grabbing active:scale-[0.995]",
        urgenciaInfo.cardClass,
        pulseNew
          ? isDark
            ? "ring-2 ring-emerald-500/20 shadow-[0_18px_55px_rgba(16,185,129,0.20)]"
            : "ring-2 ring-emerald-200 shadow-[0_18px_55px_rgba(16,185,129,0.18)]"
          : "",
        isDragging
          ? isDark
            ? "opacity-65 ring-2 ring-red-500/20 shadow-2xl"
            : "opacity-65 ring-2 ring-red-200 shadow-2xl"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 min-w-[42px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] px-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(229,37,42,0.28)]">
              #{pedido.id}
            </span>

            <span
              className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                statusPill(pedido.status, isDark),
              ].join(" ")}
            >
              {STATUS_LABELS[pedido.status] ?? pedido.status ?? "—"}
            </span>

            <EntregaBadge pedido={pedido} isDark={isDark} />

            {statusPagamento ? (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                  paymentPill(statusPagamento, isDark),
                ].join(" ")}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {STATUS_PAGAMENTO_LABELS[statusPagamento] ?? statusPagamento}
              </span>
            ) : null}

            {pulseNew ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Novo
              </span>
            ) : null}

            {urgenciaInfo.badgeText ? (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold",
                  urgenciaInfo.badgeClass,
                ].join(" ")}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {urgenciaInfo.badgeText}
              </span>
            ) : null}

            {badgeTroco ? (
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm",
                  isDark
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-amber-100 text-amber-900",
                ].join(" ")}
              >
                <CircleDollarSign className="h-3.5 w-3.5" />
                Precisa troco
              </span>
            ) : null}
          </div>

          <div
            className={[
              "mt-2 flex flex-wrap items-center gap-2 text-xs",
              isDark ? "text-white/45" : "text-zinc-500",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold shadow-sm",
                urgenciaInfo.timeClass,
              ].join(" ")}
            >
              <Clock3 className="h-3.5 w-3.5" />
              há {formatTempoDecorrido(pedido.data)}
            </span>

            <span className="inline-flex items-center gap-1">
              <Receipt className="h-3.5 w-3.5" />
              {formatDate(pedido.data)}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div
            className={[
              "text-[10px] font-extrabold uppercase tracking-[0.14em]",
              isDark ? "text-white/35" : "text-zinc-400",
            ].join(" ")}
          >
            Total
          </div>
          <div className="text-xl font-black text-[#E5252A]">
            {formatMoney.format(financeiro.total)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <div
          className={[
            "rounded-2xl border px-3 py-3 shadow-sm",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03]"
              : "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-2.5">
            <span
              className={[
                "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-sm",
                isDark ? "bg-white/5" : "bg-white",
              ].join(" ")}
            >
              <User className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
            </span>

            <div className="min-w-0">
              <div
                className={[
                  "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                  isDark ? "text-white/40" : "text-zinc-500",
                ].join(" ")}
              >
                Cliente
              </div>
              <div
                className={[
                  "truncate text-sm font-black",
                  isDark ? "text-white" : "text-zinc-900",
                ].join(" ")}
              >
                {pedido.nomeCompleto ?? pedido.usuario?.username ?? "Cliente"}
              </div>
              <div
                className={[
                  "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                  isDark ? "text-white/60" : "text-zinc-600",
                ].join(" ")}
              >
                <Phone className="h-3.5 w-3.5" />
                {formatPhone(pedido.telefone)}
              </div>
            </div>
          </div>
        </div>

        <div
          className={[
            "rounded-2xl border px-3 py-3 shadow-sm",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03]"
              : "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-2.5">
            <div className="min-w-0">
              <div
                className={[
                  "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                  isDark ? "text-white/40" : "text-zinc-500",
                ].join(" ")}
              >
                Local / entrega
              </div>
              <div
                className={[
                  "text-xs font-black",
                  isDark ? "text-white" : "text-zinc-900",
                ].join(" ")}
              >
                {localEntrega}
              </div>
              <div
                className={[
                  "mt-1 text-xs font-medium break-words",
                  isDark ? "text-white/55" : "text-zinc-600",
                ].join(" ")}
              >
                {enderecoCompleto}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniInfo icon={Wallet} label="Pagamento" value={paymentLabel} isDark={isDark} />
        <MiniInfo
          icon={ShoppingBag}
          label="Itens"
          value={`${totalItens} un. / ${(pedido.itens || []).length} produto(s)`}
          tone="highlight"
          isDark={isDark}
        />
        <MiniInfo
          icon={Receipt}
          label="Subtotal"
          value={formatMoney.format(financeiro.subtotal)}
          isDark={isDark}
        />
        <MiniInfo
          icon={Truck}
          label="Frete"
          value={financeiro.frete > 0 ? formatMoney.format(financeiro.frete) : "Sem frete"}
          isDark={isDark}
        />
      </div>

      {paymentDetail ? (
        <div
          className={[
            "mt-3 rounded-2xl border px-3 py-3 shadow-sm",
            isDark
              ? "border-emerald-500/15 bg-gradient-to-br from-emerald-500/10 to-transparent"
              : "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white",
          ].join(" ")}
        >
          <div className="flex items-start gap-2.5">
            <span
              className={[
                "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-sm",
                isDark ? "bg-white/5" : "bg-white",
              ].join(" ")}
            >
              <CreditCard
                className={["h-4 w-4", isDark ? "text-emerald-300" : "text-emerald-700"].join(" ")}
              />
            </span>

            <div className="min-w-0">
              <div
                className={[
                  "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                  isDark ? "text-emerald-300" : "text-emerald-700",
                ].join(" ")}
              >
                Detalhe do pagamento
              </div>
              <div
                className={[
                  "text-sm font-bold",
                  isDark ? "text-emerald-100" : "text-emerald-900",
                ].join(" ")}
              >
                {paymentDetail}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pedido.status === "CANCELADO" ? (
        <div
          className={[
            "mt-3 rounded-2xl border px-3 py-3 shadow-sm",
            isDark
              ? "border-red-500/20 bg-red-500/10"
              : "border-red-200 bg-red-50",
          ].join(" ")}
        >
          <div className="flex items-start gap-2.5">
            <XCircle className={["mt-0.5 h-5 w-5 shrink-0", isDark ? "text-red-300" : "text-red-700"].join(" ")} />
            <div className="min-w-0">
              <div
                className={[
                  "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                  isDark ? "text-red-300" : "text-red-700",
                ].join(" ")}
              >
                Cancelamento
              </div>
              <div
                className={[
                  "text-sm font-bold",
                  isDark ? "text-red-100" : "text-red-900",
                ].join(" ")}
              >
                {pedido.motivoCancelamentoLabel || "Motivo não informado"}
              </div>
              <div
                className={[
                  "mt-1 text-xs font-medium",
                  isDark ? "text-red-200/85" : "text-red-700",
                ].join(" ")}
              >
                Origem: {pedido.origemCancelamentoLabel || "Não informada"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={[
          "mt-3 rounded-2xl border p-3 shadow-sm",
          isDark
            ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03]"
            : "border-zinc-200 bg-gradient-to-br from-white to-zinc-50",
        ].join(" ")}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className={[
              "grid h-9 w-9 place-items-center rounded-2xl shadow-sm",
              isDark ? "bg-white/5" : "bg-white",
            ].join(" ")}
          >
            <CookingPot className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
          </span>

          <div>
            <div
              className={[
                "text-[10px] font-extrabold uppercase tracking-[0.12em]",
                isDark ? "text-white/40" : "text-zinc-500",
              ].join(" ")}
            >
              Produção
            </div>
            <div
              className={[
                "text-sm font-black",
                isDark ? "text-white" : "text-zinc-900",
              ].join(" ")}
            >
              Itens do pedido
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {(pedido.itens || []).map((item, idx) => (
            <PedidoItemCard
              key={`${item.id ?? idx}-${idx}`}
              item={item}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      {observacoesItens.length > 0 ? (
        <div
          className={[
            "mt-3 rounded-2xl border px-3 py-3 shadow-sm",
            isDark
              ? "border-yellow-500/20 bg-yellow-500/10"
              : "border-yellow-200 bg-yellow-50",
          ].join(" ")}
        >
          <div
            className={[
              "mb-2 text-[10px] font-extrabold uppercase tracking-[0.12em]",
              isDark ? "text-yellow-300" : "text-yellow-800",
            ].join(" ")}
          >
            Observações dos itens
          </div>

          <div className="space-y-2">
            {observacoesItens.map((obs, idx) => (
              <div key={`${obs.nomeProduto}-${idx}`} className="flex items-start gap-2">
                <StickyNote
                  className={[
                    "mt-0.5 h-4 w-4 shrink-0",
                    isDark ? "text-yellow-300" : "text-yellow-700",
                  ].join(" ")}
                />
                <div className="min-w-0">
                  <div
                    className={[
                      "text-xs font-black",
                      isDark ? "text-yellow-100" : "text-yellow-900",
                    ].join(" ")}
                  >
                    {obs.nomeProduto}
                  </div>
                  <div
                    className={[
                      "text-xs font-medium break-words",
                      isDark ? "text-yellow-200/85" : "text-yellow-800",
                    ].join(" ")}
                  >
                    {obs.observacao}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-2">
        {podeAceitar || podeMarcarPreparo || podeMarcarPronto || podeSair || podeFinalizar ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            {podeAceitar ? (
              <QuickActionButton
                icon={Check}
                className="bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md hover:from-amber-500 hover:to-amber-600"
                onClick={() => onQuickStatusChange?.(pedido, "RECEBIDO")}
              >
                Aceitar
              </QuickActionButton>
            ) : (
              <div />
            )}

            {podeMarcarPreparo ? (
              <QuickActionButton
                icon={CookingPot}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-orange-700"
                onClick={() => onQuickStatusChange?.(pedido, "EM_PREPARO")}
              >
                Em preparo
              </QuickActionButton>
            ) : (
              <div />
            )}

            {podeMarcarPronto ? (
              <QuickActionButton
                icon={ChefHat}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:from-emerald-600 hover:to-emerald-700"
                onClick={() => onQuickStatusChange?.(pedido, "PRONTO")}
              >
                Pronto
              </QuickActionButton>
            ) : (
              <div />
            )}

            {podeSair ? (
              <QuickActionButton
                icon={Bike}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:from-blue-600 hover:to-blue-700"
                onClick={() => onQuickStatusChange?.(pedido, "SAIU_PARA_ENTREGA")}
              >
                Saiu
              </QuickActionButton>
            ) : podeFinalizar ? (
              <QuickActionButton
                icon={Check}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:from-green-600 hover:to-green-700"
                onClick={() =>
                  onQuickStatusChange?.(
                    pedido,
                    entregaLabel === "Retirada" ? "RETIRADO" : "ENTREGUE"
                  )
                }
              >
                Finalizar
              </QuickActionButton>
            ) : (
              <div />
            )}
          </div>
        ) : null}

        <div className="flex gap-2">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(pedido);
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(229,37,42,0.25)] transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_16px_35px_rgba(229,37,42,0.35)] active:scale-[0.98]"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

const KanbanPedidoCard = memo(KanbanPedidoCardComponent);
export default KanbanPedidoCard;