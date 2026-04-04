import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  MapPin,
  User,
  ClipboardList,
  Wallet,
  Truck,
  Phone,
  Mail,
  CreditCard,
  Hash,
  Receipt,
  ShoppingBag,
  Package,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import EnderecoInfo from "./EnderecoInfo";

/* ============================
   Config
   ============================ */

const STATUS_OPTIONS = [
  "RECEBIDO",
  "EM_PREPARO",
  "PRONTO",
  "SAINDO_ENTREGA",
  "ENTREGUE",
  "CANCELADO",
];

const STATUS_FLOW = {
  RECEBIDO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["PRONTO", "CANCELADO"],
  PRONTO: ["SAINDO_ENTREGA", "ENTREGUE"],
  SAINDO_ENTREGA: ["ENTREGUE"],
  ENTREGUE: [],
  CANCELADO: [],
};

const moneyBR = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const toNumber = (v) => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const clampInt = (v, min = 1) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.max(min, n) : min;
};

function getThemeState() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
}

function getEntregaLabel(form) {
  const tipo = form?.tipoEntrega || (form?.enderecoEntrega ? "DELIVERY" : "RETIRADA");
  return tipo === "DELIVERY" ? "Delivery" : "Retirada";
}

function getPagamentoLabel(form) {
  const payType = form?.tipoPagamento || (form?.pagamentoNaEntrega ? "PAY_ON_DELIVERY" : null);

  if (payType === "PAY_ON_DELIVERY") {
    const metodo = form?.pagamentoNaEntrega?.metodo;
    if (metodo === "DEBIT") return "Débito na entrega";
    if (metodo === "CREDIT") return "Crédito na entrega";
    if (metodo === "CASH") return "Dinheiro na entrega";
    if (metodo === "CARD") return "Cartão na entrega";
    return "Pagamento na entrega";
  }

  if (payType === "CREDIT_CARD") return "Cartão";
  if (payType === "PIX") return "PIX";
  return "—";
}

function statusPill(status, isDark) {
  switch (status) {
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
    case "SAINDO_ENTREGA":
      return isDark
        ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-800";
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

/* ============================
   UI atoms
   ============================ */

function SectionCard({ icon: Icon, title, subtitle, children, isDark }) {
  return (
    <div
      className={[
        "rounded-3xl border overflow-hidden",
        isDark
          ? "border-white/10 bg-[#171717]"
          : "border-zinc-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div
        className={[
          "px-5 py-4 border-b",
          isDark ? "border-white/10" : "border-zinc-100",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          {Icon ? (
            <div
              className={[
                "h-10 w-10 rounded-2xl border grid place-items-center",
                isDark
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-red-50 border-red-100",
              ].join(" ")}
            >
              <Icon className={["w-5 h-5", isDark ? "text-red-300" : "text-red-700"].join(" ")} />
            </div>
          ) : null}

          <div className="min-w-0">
            <div className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              {title}
            </div>
            {subtitle ? (
              <div className={["text-xs mt-0.5", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Label({ children, isDark }) {
  return (
    <label
      className={[
        "block text-xs font-extrabold uppercase tracking-wide mb-2",
        isDark ? "text-white/55" : "text-zinc-600",
      ].join(" ")}
    >
      {children}
    </label>
  );
}

function Input({ className = "", isDark, ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        isDark
          ? "border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          : "border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-300",
        className,
      ].join(" ")}
    />
  );
}

function Select({ className = "", isDark, children, ...props }) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        isDark
          ? "border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
          : "border-zinc-200 bg-white text-zinc-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-300",
        className,
      ].join(" ")}
    >
      {children}
    </select>
  );
}

function Button({ tone = "red", className = "", ...props }) {
  const cls =
    tone === "red"
      ? "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:opacity-90 text-white"
      : tone === "white"
      ? "bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200"
      : tone === "dark"
      ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
      : tone === "danger"
      ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900";

  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold text-sm transition active:scale-[0.99]",
        cls,
        className,
      ].join(" ")}
    />
  );
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={[
        "inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-extrabold",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MiniInfo({ icon: Icon, label, value, isDark, highlight = false }) {
  return (
    <div
      className={[
        "rounded-2xl border px-3 py-3",
        highlight
          ? isDark
            ? "border-red-500/20 bg-red-500/10"
            : "border-red-100 bg-red-50"
          : isDark
          ? "border-white/10 bg-white/[0.04]"
          : "border-zinc-200 bg-zinc-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={[
            "grid h-8 w-8 place-items-center rounded-xl",
            isDark ? "bg-white/5" : "bg-white",
          ].join(" ")}
        >
          <Icon
            className={[
              "w-4 h-4",
              highlight
                ? isDark
                  ? "text-red-300"
                  : "text-red-600"
                : isDark
                ? "text-white/65"
                : "text-zinc-500",
            ].join(" ")}
          />
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
              "mt-1 text-sm font-black break-words",
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

function ReadOnlyField({ label, value, icon: Icon, isDark }) {
  return (
    <div>
      <Label isDark={isDark}>{label}</Label>
      <div
        className={[
          "w-full rounded-2xl border px-4 py-3 text-sm",
          "flex items-center gap-3",
          isDark
            ? "border-white/10 bg-white/[0.04] text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900",
        ].join(" ")}
      >
        {Icon ? (
          <Icon className={["w-4 h-4 shrink-0", isDark ? "text-white/40" : "text-zinc-400"].join(" ")} />
        ) : null}
        <span className="break-words">{value || "—"}</span>
      </div>
    </div>
  );
}

/* ============================
   Modal
   ============================ */

const EditarPedidoModal = ({
  pedidoEdit,
  setPedidoEdit,
  form,
  setForm,
  atualizarPedido,
}) => {
  const panelRef = useRef(null);
  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());
    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  useEffect(() => {
    if (!pedidoEdit) return;
    const onKey = (e) => e.key === "Escape" && setPedidoEdit(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pedidoEdit, setPedidoEdit]);

  useEffect(() => {
    if (!pedidoEdit) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [pedidoEdit]);

  const totalCalc = useMemo(() => {
    const itens = form?.itens ?? [];
    return itens.reduce((acc, it) => {
      const qtd = clampInt(it?.quantidade ?? 1, 1);
      const preco = toNumber(it?.precoUnitario);
      return acc + qtd * preco;
    }, 0);
  }, [form?.itens]);

  const frete = Number(form?.valorFrete ?? 0);
  const totalFinal = totalCalc + frete;

  if (!pedidoEdit) return null;

  const atualizarItem = (index, field, value) => {
    const novosItens = [...(form.itens ?? [])];
    novosItens[index] = { ...novosItens[index], [field]: value };
    setForm({ ...form, itens: novosItens });
  };

  const removerItem = (index) => {
    const novosItens = (form.itens ?? []).filter((_, i) => i !== index);
    setForm({ ...form, itens: novosItens });
  };

  const adicionarItem = () => {
    setForm({
      ...form,
      itens: [...(form.itens ?? []), { nomeProduto: "", quantidade: 1, precoUnitario: 0 }],
    });
  };

  const onClose = () => setPedidoEdit(null);

  const entregaLabel = getEntregaLabel(form);
  const pagamentoLabel = getPagamentoLabel(form);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className={[
            "absolute inset-0 backdrop-blur-[3px]",
            isDark ? "bg-black/70" : "bg-black/55",
          ].join(" ")}
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            ref={panelRef}
            key="panel"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={[
              "w-full sm:max-w-4xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col border",
              isDark
                ? "bg-[#121212] border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
                : "bg-white border-zinc-100 shadow-2xl",
            ].join(" ")}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className={[
                "px-5 sm:px-6 py-4 border-b sticky top-0 z-10 backdrop-blur",
                isDark
                  ? "border-white/10 bg-[#121212]/95"
                  : "border-zinc-100 bg-white/95",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white grid place-items-center shadow-[0_12px_28px_rgba(229,37,42,0.22)]">
                      <ClipboardList className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={[
                          "text-lg sm:text-xl font-extrabold truncate",
                          isDark ? "text-white" : "text-zinc-900",
                        ].join(" ")}
                      >
                        Editar Pedido <span className="text-[#E5252A]">#{pedidoEdit.id}</span>
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Pill className={statusPill(form.status, isDark)}>
                          {form.status ?? "—"}
                        </Pill>

                        <Pill
                          className={
                            isDark
                              ? "bg-red-500/10 text-red-300 border-red-500/20"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          Total {moneyBR.format(totalFinal)}
                        </Pill>

                        <Pill
                          className={
                            isDark
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {entregaLabel}
                        </Pill>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={[
                    "h-10 w-10 rounded-2xl transition grid place-items-center border",
                    isDark
                      ? "border-white/10 bg-white/5 hover:bg-white/10"
                      : "border-zinc-200 bg-white hover:bg-zinc-50",
                  ].join(" ")}
                  aria-label="Fechar"
                  title="Fechar"
                >
                  <X className={["w-5 h-5", isDark ? "text-white" : "text-zinc-800"].join(" ")} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-6 py-5 overflow-y-auto space-y-4">
              {/* Resumo rápido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <MiniInfo
                  icon={Truck}
                  label="Entrega"
                  value={entregaLabel}
                  isDark={isDark}
                />
                <MiniInfo
                  icon={CreditCard}
                  label="Pagamento"
                  value={pagamentoLabel}
                  isDark={isDark}
                />
                <MiniInfo
                  icon={Receipt}
                  label="Subtotal"
                  value={moneyBR.format(totalCalc)}
                  isDark={isDark}
                />
                <MiniInfo
                  icon={Wallet}
                  label="Total"
                  value={moneyBR.format(totalFinal)}
                  highlight
                  isDark={isDark}
                />
              </div>

              {/* Cliente - apenas visualização */}
              <SectionCard
                icon={User}
                title="Cliente"
                subtitle="Dados do cliente salvos no pedido"
                isDark={isDark}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ReadOnlyField
                    label="Nome do cliente"
                    value={form.nomeCompleto}
                    icon={User}
                    isDark={isDark}
                  />

                  <ReadOnlyField
                    label="Telefone"
                    value={form.telefone}
                    icon={Phone}
                    isDark={isDark}
                  />

                  <ReadOnlyField
                    label="CPF"
                    value={form.cpf}
                    icon={Hash}
                    isDark={isDark}
                  />

                  <ReadOnlyField
                    label="Email"
                    value={form.email}
                    icon={Mail}
                    isDark={isDark}
                  />
                </div>
              </SectionCard>

              {/* Entrega + Status */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SectionCard
                  icon={MapPin}
                  title="Entrega"
                  subtitle="Endereço vinculado ao pedido"
                  isDark={isDark}
                >
                  <div
                    className={[
                      "rounded-2xl border p-4",
                      isDark
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-zinc-200 bg-zinc-50",
                    ].join(" ")}
                  >
                    {form.enderecoEntrega ? (
                      <EnderecoInfo endereco={form.enderecoEntrega} />
                    ) : (
                      <div
                        className={[
                          "flex items-center gap-2 text-sm font-semibold",
                          isDark ? "text-white/65" : "text-zinc-600",
                        ].join(" ")}
                      >
                        {entregaLabel === "Retirada" ? (
                          <>
                            <Package className="w-4 h-4" />
                            Pedido para retirada no local
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            Endereço não informado
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  icon={ClipboardList}
                  title="Status do pedido"
                  subtitle="Controle o fluxo operacional"
                  isDark={isDark}
                >
                  <div>
                    <Label isDark={isDark}>Status</Label>
                    <Select
                      isDark={isDark}
                      value={form.status || ""}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className={isDark ? "bg-[#171717]" : "bg-white"}
                        >
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill className={statusPill(form.status, isDark)}>
                      {form.status || "STATUS"}
                    </Pill>
                  </div>
                </SectionCard>
              </div>

              {/* Itens */}
              <SectionCard
                icon={ShoppingBag}
                title="Itens do pedido"
                subtitle="Ajuste produto, quantidade e preço unitário"
                isDark={isDark}
              >
                <div className="space-y-3">
                  {(form.itens ?? []).map((item, idx) => {
                    const qtd = clampInt(item?.quantidade ?? 1, 1);
                    const preco = toNumber(item?.precoUnitario);
                    const subtotal = qtd * preco;

                    return (
                      <div
                        key={idx}
                        className={[
                          "rounded-2xl border p-3",
                          isDark
                            ? "border-white/10 bg-white/[0.04]"
                            : "border-zinc-200 bg-white",
                        ].join(" ")}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-6">
                            <Label isDark={isDark}>Produto</Label>
                            <Input
                              isDark={isDark}
                              type="text"
                              value={item.nomeProduto || ""}
                              onChange={(e) => atualizarItem(idx, "nomeProduto", e.target.value)}
                              placeholder="Ex: X-Burger, Pizza M..."
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label isDark={isDark}>Qtd</Label>
                            <Input
                              isDark={isDark}
                              type="number"
                              min={1}
                              value={qtd}
                              onChange={(e) =>
                                atualizarItem(idx, "quantidade", clampInt(e.target.value, 1))
                              }
                            />
                          </div>

                          <div className="md:col-span-3">
                            <Label isDark={isDark}>Preço</Label>
                            <Input
                              isDark={isDark}
                              type="number"
                              min={0}
                              step="0.01"
                              value={preco}
                              onChange={(e) =>
                                atualizarItem(
                                  idx,
                                  "precoUnitario",
                                  Math.max(0, toNumber(e.target.value))
                                )
                              }
                            />
                          </div>

                          <div className="md:col-span-1 flex md:justify-end">
                            <Button
                              tone={isDark ? "dark" : "danger"}
                              className="w-full md:w-auto"
                              onClick={() => removerItem(idx)}
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div
                          className={[
                            "mt-3 flex items-center justify-between text-sm rounded-xl px-3 py-2",
                            isDark ? "bg-white/[0.03]" : "bg-zinc-50",
                          ].join(" ")}
                        >
                          <span className={isDark ? "text-white/55" : "text-zinc-500"}>
                            Subtotal do item
                          </span>
                          <span className={["font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                            {moneyBR.format(subtotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <Button tone={isDark ? "dark" : "white"} onClick={adicionarItem}>
                    <Plus className="w-4 h-4" /> Adicionar item
                  </Button>

                  <div
                    className={[
                      "rounded-2xl px-4 py-3 border",
                      isDark
                        ? "border-red-500/20 bg-red-500/10"
                        : "border-red-100 bg-red-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-xs font-extrabold uppercase tracking-wide",
                        isDark ? "text-red-300" : "text-red-700",
                      ].join(" ")}
                    >
                      Total dos itens
                    </div>
                    <div
                      className={[
                        "text-lg font-extrabold",
                        isDark ? "text-red-300" : "text-red-700",
                      ].join(" ")}
                    >
                      {moneyBR.format(totalCalc)}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Resumo financeiro */}
              <SectionCard
                icon={Receipt}
                title="Resumo financeiro"
                subtitle="Fechamento visual do pedido"
                isDark={isDark}
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <MiniInfo
                    icon={Receipt}
                    label="Subtotal"
                    value={moneyBR.format(totalCalc)}
                    isDark={isDark}
                  />
                  <MiniInfo
                    icon={Truck}
                    label="Frete"
                    value={moneyBR.format(frete)}
                    isDark={isDark}
                  />
                  <MiniInfo
                    icon={CreditCard}
                    label="Pagamento"
                    value={pagamentoLabel}
                    isDark={isDark}
                  />
                  <MiniInfo
                    icon={Wallet}
                    label="Total final"
                    value={moneyBR.format(totalFinal)}
                    isDark={isDark}
                    highlight
                  />
                </div>
              </SectionCard>
            </div>

            {/* Footer */}
            <div
              className={[
                "px-5 sm:px-6 py-4 border-t sticky bottom-0 backdrop-blur",
                isDark
                  ? "border-white/10 bg-[#121212]/95"
                  : "border-zinc-100 bg-white/95",
              ].join(" ")}
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <Button tone={isDark ? "dark" : "white"} onClick={onClose}>
                  Cancelar
                </Button>

                <Button
                  tone="red"
                  onClick={() => {
                    atualizarPedido({
                      ...form,
                    });
                  }}
                >
                  Salvar alterações
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditarPedidoModal;