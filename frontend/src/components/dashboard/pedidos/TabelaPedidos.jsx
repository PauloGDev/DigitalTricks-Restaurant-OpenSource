import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import {
  Truck,
  Package,
  User,
  Phone,
  Edit2,
  Check,
  Clock,
  MapPin,
  XCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Receipt,
  BadgePercent,
  CreditCard,
  Wallet,
  Hash,
  Store,
  TimerReset,
} from "lucide-react";
import EnderecoInfo from "./EnderecoInfo";

/* ============================
   Theme
   ============================ */

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

/* ============================
   Labels / helpers
   ============================ */

const STATUS_LABELS = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saindo p/ entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  PAGO: "Pago",
  PAGAMENTO_APROVADO: "Pagamento aprovado",
};

const statusPill = (status, isDark) => {
  switch (status) {
    case "AGUARDANDO_PAGAMENTO":
      return isDark
        ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
        : "bg-yellow-50 text-yellow-800 border-yellow-200";
    case "RECEBIDO":
      return isDark
        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
        : "bg-amber-50 text-amber-800 border-amber-200";
    case "EM_PREPARO":
      return isDark
        ? "bg-orange-500/10 text-orange-300 border-orange-500/20"
        : "bg-orange-50 text-orange-800 border-orange-200";
    case "PRONTO":
      return isDark
        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "SAINDO_ENTREGA":
      return isDark
        ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
        : "bg-blue-50 text-blue-800 border-blue-200";
    case "ENTREGUE":
      return isDark
        ? "bg-white/5 text-white/75 border-white/10"
        : "bg-zinc-100 text-zinc-800 border-zinc-200";
    case "PAGO":
    case "PAGAMENTO_APROVADO":
      return isDark
        ? "bg-green-500/10 text-green-300 border-green-500/20"
        : "bg-green-50 text-green-800 border-green-200";
    case "CANCELADO":
      return isDark
        ? "bg-red-500/10 text-red-300 border-red-500/20"
        : "bg-red-50 text-red-800 border-red-200";
    default:
      return isDark
        ? "bg-white/5 text-white/75 border-white/10"
        : "bg-zinc-100 text-zinc-800 border-zinc-200";
  }
};

const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatDate = (date) => {
  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatPhone = (phone) => {
  if (!phone) return "—";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
};

const resumoItens = (itens = []) =>
  itens
    .slice(0, 2)
    .map((it) => `${it.quantidade}x ${it.nomeProduto ?? it.nome ?? "Item"}`)
    .join(" • ") + (itens.length > 2 ? ` • +${itens.length - 2}` : "");

const getEntregaLabel = (pedido) => {
  const entregaType = pedido.tipoEntrega || (pedido.enderecoEntrega ? "DELIVERY" : "RETIRADA");
  return entregaType === "DELIVERY" ? "Delivery" : "Retirada";
};

const getPagamentoLabel = (pedido) => {
  const payType =
    pedido.tipoPagamento ||
    (pedido.pagamentoNaEntrega ? "PAY_ON_DELIVERY" : null);

  if (payType === "PAY_ON_DELIVERY") {
    const metodo = pedido.pagamentoNaEntrega?.metodo;
    if (metodo === "DEBIT") return "Débito na entrega";
    if (metodo === "CREDIT") return "Crédito na entrega";
    if (metodo === "CASH") return "Dinheiro na entrega";
    return "Pagamento na entrega";
  }

  if (payType === "CREDIT_CARD") return "Cartão";
  if (payType === "PIX") return "PIX";
  return "—";
};

const getPagamentoIcon = (pedido) => {
  const payType =
    pedido.tipoPagamento ||
    (pedido.pagamentoNaEntrega ? "PAY_ON_DELIVERY" : null);

  if (payType === "PIX") return Wallet;
  return CreditCard;
};

const renderOpcionais = (item, isDark) => {
  if (!item?.opcionais?.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {item.opcionais.map((grupo, idx) => (
        <div
          key={idx}
          className={[
            "rounded-2xl border p-2.5",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-zinc-200 bg-zinc-50",
          ].join(" ")}
        >
          <div
            className={[
              "text-[11px] font-extrabold uppercase tracking-wide",
              isDark ? "text-white/45" : "text-zinc-500",
            ].join(" ")}
          >
            {grupo.grupoNome || "Grupo"}
          </div>

          <div className="mt-1 flex flex-wrap gap-2">
            {(grupo.itens || []).map((op, j) => (
              <span
                key={j}
                className={[
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-100 bg-red-50 text-red-700",
                ].join(" ")}
              >
                {op.quantidade > 1 ? `${op.quantidade}x ` : ""}
                {op.nome}
                {Number(op.precoExtra || 0) > 0 ? ` • +${formatMoney.format(op.precoExtra)}` : ""}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================
   Mini info row
   ============================ */

const InfoLine = ({ icon: Icon, label, value, valueClassName = "", isDark }) => (
  <div className="flex items-start gap-2">
    <Icon
      className={[
        "mt-0.5 h-4 w-4 shrink-0",
        isDark ? "text-red-300" : "text-red-600",
      ].join(" ")}
    />
    <div className="min-w-0">
      <div
        className={[
          "text-[11px] uppercase tracking-wide font-bold",
          isDark ? "text-white/45" : "text-zinc-500",
        ].join(" ")}
      >
        {label}
      </div>
      <div
        className={[
          "break-words text-sm",
          isDark ? "text-white/85" : "text-zinc-800",
          valueClassName,
        ].join(" ")}
      >
        {value || "—"}
      </div>
    </div>
  </div>
);

InfoLine.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  valueClassName: PropTypes.string,
  isDark: PropTypes.bool.isRequired,
};

/* ============================
   Reusable card
   ============================ */

const DetailCard = ({ title, children, isDark }) => (
  <div
    className={[
      "rounded-3xl border p-4 shadow-sm",
      isDark
        ? "border-white/10 bg-white/[0.04] shadow-[0_15px_40px_rgba(0,0,0,0.24)]"
        : "border-zinc-200 bg-white",
    ].join(" ")}
  >
    <h4
      className={[
        "mb-4 text-base font-black",
        isDark ? "text-white" : "text-zinc-900",
      ].join(" ")}
    >
      {title}
    </h4>
    {children}
  </div>
);

DetailCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isDark: PropTypes.bool.isRequired,
};

/* ============================
   Row
   ============================ */

const PedidoRowComponent = ({
  pedido,
  i,
  isExpanded,
  onExpand,
  setPedidoEdit,
  setForm,
  onAction,
  isDark,
}) => {
  const entregaType = pedido.tipoEntrega || (pedido.enderecoEntrega ? "DELIVERY" : "RETIRADA");
  const payLabel = getPagamentoLabel(pedido);
  const PayIcon = getPagamentoIcon(pedido);

  const descontoCupom = Number(pedido.descontoCupom ?? 0);
  const frete = Number(pedido.valorFrete ?? 0);
  const total = Number(pedido.total ?? 0);
  const subtotal = total - descontoCupom - frete;

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.02 }}
        className={[
          "cursor-pointer border-b transition",
          isDark
            ? "border-white/10 hover:bg-red-500/5"
            : "border-zinc-100 hover:bg-red-50/40",
        ].join(" ")}
        role="button"
        onClick={() => onExpand(pedido.id)}
        aria-expanded={isExpanded}
      >
        <td className="p-3 align-top">
          <div className="flex flex-col gap-1">
            <div className={["text-base font-black", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              #{pedido.id}
            </div>
            <div className={["text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
              {formatDate(pedido.data)}
            </div>
          </div>
        </td>

        <td className="p-3 align-top">
          <div className="flex flex-col gap-2">
            <div
              className={[
                "inline-flex items-center gap-2 text-sm font-bold",
                isDark ? "text-white/85" : "text-zinc-800",
              ].join(" ")}
            >
              {entregaType === "DELIVERY" ? (
                <>
                  <Truck className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
                  Delivery
                </>
              ) : (
                <>
                  <Package className={["h-4 w-4", isDark ? "text-white/65" : "text-zinc-700"].join(" ")} />
                  Retirada
                </>
              )}
            </div>

            {pedido.mesa ? (
              <span
                className={[
                  "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/75"
                    : "border-zinc-200 bg-white text-zinc-700",
                ].join(" ")}
              >
                Mesa {pedido.mesa}
              </span>
            ) : null}
          </div>
        </td>

        <td className="p-3 align-top">
          <div className="max-w-[220px]">
            <div className={["truncate font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              {pedido.nomeCompleto ?? pedido.usuario?.username ?? "—"}
            </div>
            <div className={["mt-1 truncate text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
              {formatPhone(pedido.telefone)}
            </div>
          </div>
        </td>

        <td className="p-3 align-top">
          <div className="max-w-[280px]">
            <div
              className={[
                "truncate text-sm font-medium",
                isDark ? "text-white/85" : "text-zinc-800",
              ].join(" ")}
            >
              {resumoItens(pedido.itens)}
            </div>
            <div className={["mt-1 text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
              {pedido.itens?.length ?? 0} item(ns)
            </div>
          </div>
        </td>

        <td className="p-3 align-top">
          <div className="flex flex-col">
            <span className="text-base font-black text-red-500">
              {formatMoney.format(total)}
            </span>

            {descontoCupom > 0 ? (
              <span className={["text-xs font-semibold", isDark ? "text-emerald-300" : "text-emerald-700"].join(" ")}>
                desconto {formatMoney.format(descontoCupom)}
              </span>
            ) : null}
          </div>
        </td>

        <td className="hidden align-top p-3 md:table-cell">
          <div className="flex max-w-[180px] flex-col gap-1">
            <div
              className={[
                "inline-flex items-center gap-2 text-sm font-bold",
                isDark ? "text-white/85" : "text-zinc-800",
              ].join(" ")}
            >
              <PayIcon className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
              {payLabel}
            </div>

            {pedido.pagamentoNaEntrega?.metodo === "CASH" &&
            pedido.pagamentoNaEntrega?.precisaTroco ? (
              <div className={["text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                Troco para {formatMoney.format(Number(pedido.pagamentoNaEntrega?.trocoPara ?? 0))}
              </div>
            ) : null}

            {pedido.mpStatus ? (
              <div className={["truncate text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                MP: {pedido.mpStatus}
              </div>
            ) : null}
          </div>
        </td>

        <td className="hidden align-top p-3 lg:table-cell">
          <div className="flex flex-col gap-2">
            <span
              className={[
                "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                statusPill(pedido.status, isDark),
              ].join(" ")}
            >
              {STATUS_LABELS[pedido.status] ?? pedido.status ?? "—"}
            </span>

            <span className={["text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
              {getEntregaLabel(pedido)}
            </span>
          </div>
        </td>

        <td className="p-3 align-top">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPedidoEdit(pedido);
                setForm(pedido);
                onAction?.("edit", pedido);
              }}
              className="rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-3 py-2 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
              title="Editar pedido"
            >
              <Edit2 className="mr-1 inline-block h-4 w-4" />
              Editar
            </button>

            {pedido.linkRastreio ? (
              <a
                href={pedido.linkRastreio}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={[
                  "hidden rounded-2xl border px-3 py-2 text-sm font-extrabold transition xl:inline-flex",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                ].join(" ")}
                title="Ver rastreio"
              >
                <MapPin className={["mr-1 h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
                Rastreio
              </a>
            ) : null}

            <span className={isDark ? "text-white/35" : "text-zinc-400"}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </span>
          </div>
        </td>
      </motion.tr>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.tr
            key={`expanded-${pedido.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={isDark ? "bg-white/[0.02]" : "bg-zinc-50"}
          >
            <td colSpan={8} className="p-4">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                <div className="xl:col-span-5">
                  <DetailCard title="Itens do pedido" isDark={isDark}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className={["text-xs font-bold", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                        {pedido.itens?.length ?? 0} item(ns)
                      </span>
                    </div>

                    <ul className="space-y-4">
                      {(pedido.itens ?? []).map((item, idx) => {
                        const qtd = Number(item.quantidade ?? 0);
                        const precoBase = Number(item.precoUnitario ?? 0);
                        const totalLinha = qtd * precoBase;

                        return (
                          <li
                            key={idx}
                            className={[
                              "rounded-3xl border p-3",
                              isDark
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-white",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border",
                                  isDark
                                    ? "border-white/10 bg-white/5"
                                    : "border-zinc-200 bg-zinc-100",
                                ].join(" ")}
                              >
                                {item.imagemUrl ? (
                                  <img
                                    src={item.imagemUrl}
                                    alt={item.nomeProduto}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className={["text-[11px]", isDark ? "text-white/35" : "text-zinc-500"].join(" ")}>
                                    sem imagem
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className={["text-sm font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                                      {item.nomeProduto ?? item.nome ?? "Item"}
                                    </div>

                                    {item.observacao ? (
                                      <div className={["mt-1 text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                                        Obs.: {item.observacao}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <div className={["text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                                      {qtd}x
                                    </div>
                                    <div className="font-black text-red-500">
                                      {formatMoney.format(precoBase)}
                                    </div>
                                    <div className={["text-[11px]", isDark ? "text-white/35" : "text-zinc-500"].join(" ")}>
                                      base: {formatMoney.format(totalLinha)}
                                    </div>
                                  </div>
                                </div>

                                {renderOpcionais(item, isDark)}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </DetailCard>
                </div>

                <div className="space-y-4 xl:col-span-4">
                  <DetailCard title="Cliente" isDark={isDark}>
                    <div className="space-y-3">
                      <InfoLine
                        icon={User}
                        label="Nome"
                        value={pedido.nomeCompleto ?? pedido.usuario?.username ?? "—"}
                        isDark={isDark}
                      />
                      <InfoLine
                        icon={Phone}
                        label="Telefone"
                        value={formatPhone(pedido.telefone)}
                        isDark={isDark}
                      />
                      <InfoLine
                        icon={Hash}
                        label="CPF"
                        value={pedido.cpf ?? "—"}
                        isDark={isDark}
                      />
                    </div>
                  </DetailCard>

                  <DetailCard title="Entrega" isDark={isDark}>
                    <div className="space-y-3">
                      <InfoLine
                        icon={entregaType === "DELIVERY" ? Truck : Store}
                        label="Tipo"
                        value={getEntregaLabel(pedido)}
                        isDark={isDark}
                      />

                      {pedido.enderecoEntrega ? (
                        <div
                          className={[
                            "rounded-2xl border p-3 text-sm",
                            isDark
                              ? "border-white/10 bg-white/[0.03] text-white/60"
                              : "border-zinc-200 bg-zinc-50 text-zinc-500",
                          ].join(" ")}
                        >
                          <EnderecoInfo endereco={pedido.enderecoEntrega} />
                        </div>
                      ) : (
                        <div className={["text-sm", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                          Sem endereço informado.
                        </div>
                      )}

                      {(pedido.servicoFrete || pedido.valorFrete || pedido.prazoFrete) && (
                        <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-3">
                          <div
                            className={[
                              "rounded-2xl border p-3",
                              isDark
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-zinc-50",
                            ].join(" ")}
                          >
                            <div className={["text-[11px] font-bold uppercase tracking-wide", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                              Serviço
                            </div>
                            <div className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
                              {pedido.servicoFrete || "—"}
                            </div>
                          </div>

                          <div
                            className={[
                              "rounded-2xl border p-3",
                              isDark
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-zinc-50",
                            ].join(" ")}
                          >
                            <div className={["text-[11px] font-bold uppercase tracking-wide", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                              Frete
                            </div>
                            <div className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
                              {pedido.valorFrete != null
                                ? formatMoney.format(Number(pedido.valorFrete))
                                : "—"}
                            </div>
                          </div>

                          <div
                            className={[
                              "rounded-2xl border p-3",
                              isDark
                                ? "border-white/10 bg-white/[0.03]"
                                : "border-zinc-200 bg-zinc-50",
                            ].join(" ")}
                          >
                            <div className={["text-[11px] font-bold uppercase tracking-wide", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                              Prazo
                            </div>
                            <div className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
                              {pedido.prazoFrete || "—"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </DetailCard>

                  <DetailCard title="Pagamento" isDark={isDark}>
                    <div className="space-y-3">
                      <InfoLine
                        icon={getPagamentoIcon(pedido)}
                        label="Método"
                        value={getPagamentoLabel(pedido)}
                        isDark={isDark}
                      />

                      {pedido.pagamentoNaEntrega?.metodo === "CASH" && (
                        <InfoLine
                          icon={DollarSign}
                          label="Troco"
                          value={
                            pedido.pagamentoNaEntrega?.precisaTroco
                              ? `Troco para ${formatMoney.format(
                                  Number(pedido.pagamentoNaEntrega?.trocoPara ?? 0)
                                )}`
                              : "Não precisa troco"
                          }
                          isDark={isDark}
                        />
                      )}

                      <InfoLine
                        icon={Receipt}
                        label="Gateway"
                        value={pedido.paymentProvider || "—"}
                        isDark={isDark}
                      />

                      <InfoLine
                        icon={Wallet}
                        label="Status pagamento"
                        value={pedido.mpStatus || "—"}
                        isDark={isDark}
                      />

                      {pedido.invoiceUrl ? (
                        <a
                          href={pedido.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={[
                            "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition",
                            isDark
                              ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15"
                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                          ].join(" ")}
                        >
                          <Receipt className="h-4 w-4" />
                          Ver cobrança
                        </a>
                      ) : null}
                    </div>
                  </DetailCard>
                </div>

                <div className="space-y-4 xl:col-span-3">
                  <DetailCard title="Resumo financeiro" isDark={isDark}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className={isDark ? "text-white/50" : "text-zinc-500"}>Subtotal</span>
                        <span className={["font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                          {formatMoney.format(subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className={isDark ? "text-white/50" : "text-zinc-500"}>Frete</span>
                        <span className={["font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                          {formatMoney.format(Number(frete))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className={isDark ? "text-white/50" : "text-zinc-500"}>Desconto</span>
                        <span className={["font-bold", isDark ? "text-emerald-300" : "text-emerald-700"].join(" ")}>
                          {formatMoney.format(Number(descontoCupom))}
                        </span>
                      </div>

                      {pedido.cupomCodigo ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className={["inline-flex items-center gap-2", isDark ? "text-white/50" : "text-zinc-500"].join(" ")}>
                            <BadgePercent className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
                            Cupom
                          </span>
                          <span className="font-black text-red-500">{pedido.cupomCodigo}</span>
                        </div>
                      ) : null}

                      <div
                        className={[
                          "flex items-center justify-between border-t pt-3",
                          isDark ? "border-white/10" : "border-zinc-100",
                        ].join(" ")}
                      >
                        <span className={["text-sm font-bold", isDark ? "text-white/75" : "text-zinc-700"].join(" ")}>
                          Total
                        </span>
                        <span className="text-xl font-black text-red-500">
                          {formatMoney.format(Number(total))}
                        </span>
                      </div>
                    </div>
                  </DetailCard>

                  <DetailCard title="Status" isDark={isDark}>
                    <div className="space-y-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                          statusPill(pedido.status, isDark),
                        ].join(" ")}
                      >
                        {STATUS_LABELS[pedido.status] ?? pedido.status ?? "—"}
                      </span>

                      <InfoLine
                        icon={TimerReset}
                        label="Criado em"
                        value={formatDate(pedido.data)}
                        isDark={isDark}
                      />

                      {pedido.linkRastreio ? (
                        <a
                          href={pedido.linkRastreio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={[
                            "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold transition",
                            isDark
                              ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
                              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                          ].join(" ")}
                        >
                          <MapPin className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
                          Abrir rastreio
                        </a>
                      ) : null}
                    </div>
                  </DetailCard>

                  <DetailCard title="Ações rápidas" isDark={isDark}>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.("mark_preparing", pedido);
                        }}
                        className="w-full rounded-2xl bg-orange-500 px-4 py-2.5 font-extrabold text-black transition hover:bg-orange-600"
                      >
                        <Clock className="mr-2 inline h-4 w-4" />
                        Marcar em preparo
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.("mark_ready", pedido);
                        }}
                        className="w-full rounded-2xl bg-emerald-600 px-4 py-2.5 font-extrabold text-white transition hover:bg-emerald-700"
                      >
                        <Check className="mr-2 inline h-4 w-4" />
                        Marcar pronto
                      </button>

                      {pedido.tipoEntrega === "DELIVERY" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction?.("assign_delivery", pedido);
                          }}
                          className="w-full rounded-2xl bg-blue-600 px-4 py-2.5 font-extrabold text-white transition hover:bg-blue-700"
                        >
                          <MapPin className="mr-2 inline h-4 w-4" />
                          Sair para entrega
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction?.("cancel", pedido);
                        }}
                        className="w-full rounded-2xl bg-red-600 px-4 py-2.5 font-extrabold text-white transition hover:bg-red-700"
                      >
                        <XCircle className="mr-2 inline h-4 w-4" />
                        Cancelar pedido
                      </button>
                    </div>
                  </DetailCard>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

PedidoRowComponent.propTypes = {
  pedido: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
  setPedidoEdit: PropTypes.func.isRequired,
  setForm: PropTypes.func.isRequired,
  onAction: PropTypes.func,
  isDark: PropTypes.bool.isRequired,
};

const PedidoRow = memo(PedidoRowComponent);

/* ============================
   Skeleton
   ============================ */

const SkeletonRow = ({ columns = 8, index = 0, isDark }) => {
  const widths = ["10%", "12%", "18%", "20%", "10%", "14%", "12%", "14%"];

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.03 }}
      className={isDark ? "border-b border-white/10" : "border-b border-zinc-100"}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <motion.div
            className={[
              "h-4 rounded",
              isDark ? "bg-white/10" : "bg-zinc-200",
            ].join(" ")}
            style={{ width: widths[i] ?? "100%" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatType: "loop", delay: i * 0.04 }}
          />
        </td>
      ))}
    </motion.tr>
  );
};

SkeletonRow.propTypes = {
  columns: PropTypes.number,
  index: PropTypes.number,
  isDark: PropTypes.bool.isRequired,
};

/* ============================
   Tabela
   ============================ */

const TabelaPedidos = ({ pedidos = [], setPedidoEdit, setForm, loading = false, onAction }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const handleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div
      className={[
        "overflow-x-auto rounded-[28px] border shadow-sm",
        isDark
          ? "border-white/10 bg-[#121212] shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
          : "border-zinc-200 bg-white",
      ].join(" ")}
    >
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={["min-w-full", isDark ? "bg-[#121212]" : "bg-white"].join(" ")}
      >
        <thead
          className={[
            "sticky top-0 z-10 text-sm text-white",
            isDark
              ? "bg-[#1A1A1A] border-b border-white/10"
              : "bg-red-600",
          ].join(" ")}
        >
          <tr>
            <th className="p-3 text-left font-black">Pedido</th>
            <th className="p-3 text-left font-black">Tipo</th>
            <th className="p-3 text-left font-black">Cliente</th>
            <th className="p-3 text-left font-black">Itens</th>
            <th className="p-3 text-left font-black">Total</th>
            <th className="hidden p-3 text-left font-black md:table-cell">Pagamento</th>
            <th className="hidden p-3 text-left font-black lg:table-cell">Status</th>
            <th className="p-3 text-right font-black">Ações</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonRow key={idx} index={idx} isDark={isDark} />
            ))
          ) : pedidos.length > 0 ? (
            pedidos.map((pedido, i) => (
              <PedidoRow
                key={pedido.id}
                pedido={pedido}
                i={i}
                isExpanded={expandedId === pedido.id}
                onExpand={handleExpand}
                setPedidoEdit={setPedidoEdit}
                setForm={setForm}
                onAction={onAction}
                isDark={isDark}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className={[
                  "p-12 text-center",
                  isDark ? "text-white/55" : "text-zinc-600",
                ].join(" ")}
              >
                Nenhum pedido encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </motion.table>
    </div>
  );
};

TabelaPedidos.propTypes = {
  pedidos: PropTypes.array.isRequired,
  setPedidoEdit: PropTypes.func.isRequired,
  setForm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onAction: PropTypes.func,
};

export default TabelaPedidos;