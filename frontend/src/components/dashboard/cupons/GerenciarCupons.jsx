import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  TicketPercent,
  Power,
  PowerOff,
  X,
  Save,
} from "lucide-react";

const TIPOS_DESCONTO = ["PERCENTUAL", "VALOR_FIXO"];
const TIPOS_ENTREGA = ["DELIVERY", "RETIRADA", "LOCAL"];
const TIPOS_PAGAMENTO = ["DINHEIRO", "CARTAO", "PIX", "ONLINE"];

const emptyForm = {
  codigo: "",
  nome: "",
  descricao: "",
  ativo: true,
  tipoDesconto: "PERCENTUAL",
  valorDesconto: "",
  valorMaximoDesconto: "",
  valorMinimoPedido: "",
  limiteUsoTotal: "",
  limiteUsoPorUsuario: "",
  dataInicio: "",
  dataFim: "",
  tipoEntregaPermitida: "",
  tipoPagamentoPermitido: "",
  cumulativo: false,
  apenasPrimeiraCompra: false,
  apenasNovoUsuario: false,
  freteGratis: false,
  aplicaEmItensPromocionais: true,
  quantidadeMinimaItens: "",
  quantidadeMaximaItens: "",
  valorMinimoFrete: "",
  horarioInicio: "",
  horarioFim: "",
  diasSemanaPermitidos: "",
  bairrosPermitidos: "",
  cepsPermitidos: "",
  categoriasPermitidasIds: "",
  produtosPermitidosIds: "",
};

const brl = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const toInputDateTime = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
};

const parseNullableNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseNullableBoolean = (value) => Boolean(value);

const cx = (...classes) => classes.filter(Boolean).join(" ");

function Campo({ label, children, isDark = true, className = "" }) {
  return (
    <label className={cx("flex flex-col gap-2", className)}>
      <span
        className={cx(
          "text-xs font-bold",
          isDark ? "text-white/70" : "text-zinc-700"
        )}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({ isDark = true, className = "", ...props }) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        isDark
          ? "border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[#E5252A]/40"
          : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-red-400 focus:ring-4 focus:ring-red-100",
        className
      )}
    />
  );
}

function Select({ isDark = true, className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        isDark
          ? "border-white/10 bg-white/5 text-white focus:border-[#E5252A]/40"
          : "border-zinc-200 bg-white text-zinc-900 focus:border-red-400 focus:ring-4 focus:ring-red-100",
        className
      )}
    >
      {children}
    </select>
  );
}

function Textarea({ isDark = true, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        isDark
          ? "border-white/10 bg-white/5 text-white placeholder:text-white/25 focus:border-[#E5252A]/40"
          : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-red-400 focus:ring-4 focus:ring-red-100",
        className
      )}
    />
  );
}

function Checkbox({ label, checked, onChange, isDark = true }) {
  return (
    <label
      className={cx(
        "flex items-center gap-3 rounded-2xl border px-4 py-3",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-zinc-200 bg-white"
      )}
    >
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-500"
      />
      <span
        className={cx(
          "text-sm font-medium",
          isDark ? "text-white/80" : "text-zinc-700"
        )}
      >
        {label}
      </span>
    </label>
  );
}

function StatCard({ label, value, isDark = true }) {
  return (
    <div
      className={cx(
        "rounded-2xl border p-4",
        isDark
          ? "border-white/10 bg-white/5"
          : "border-zinc-200 bg-zinc-50"
      )}
    >
      <p
        className={cx(
          "text-[11px] font-extrabold uppercase tracking-[0.08em]",
          isDark ? "text-white/45" : "text-zinc-500"
        )}
      >
        {label}
      </p>
      <p
        className={cx(
          "mt-2 text-lg font-extrabold",
          isDark ? "text-white" : "text-zinc-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CupomModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  saving,
  editing,
  isDark = true,
}) {
  if (!open) return null;

  const setValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className={cx(
            "absolute inset-0 backdrop-blur-sm",
            isDark ? "bg-black/70" : "bg-black/40"
          )}
          onClick={onClose}
        />

        <div className="absolute inset-0 overflow-y-auto p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.18 }}
            className={cx(
              "mx-auto max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-t-[28px] sm:rounded-[28px] border shadow-2xl",
              isDark
                ? "border-white/10 bg-[#121212]/95 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900"
            )}
          >
            <div
              className={cx(
                "sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4 backdrop-blur",
                isDark
                  ? "border-white/10 bg-[#121212]/95"
                  : "border-zinc-200 bg-white/95"
              )}
            >
              <div>
                <h2
                  className={cx(
                    "text-lg font-extrabold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}
                >
                  {editing ? "Editar cupom" : "Novo cupom"}
                </h2>
                <p
                  className={cx(
                    "mt-1 text-sm",
                    isDark ? "text-white/50" : "text-zinc-500"
                  )}
                >
                  Configure regras, limites e condições do cupom.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={cx(
                  "rounded-2xl border p-2.5 transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                )}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={onSubmit}
              className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2 xl:grid-cols-3"
            >
              <Campo label="Código" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.codigo}
                  onChange={(e) =>
                    setValue("codigo", e.target.value.toUpperCase())
                  }
                  placeholder="EX: BEMVINDO10"
                  required
                />
              </Campo>

              <Campo label="Nome" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.nome}
                  onChange={(e) => setValue("nome", e.target.value)}
                  placeholder="Nome interno do cupom"
                  required
                />
              </Campo>

              <Campo label="Tipo de desconto" isDark={isDark}>
                <Select
                  isDark={isDark}
                  value={form.tipoDesconto}
                  onChange={(e) => setValue("tipoDesconto", e.target.value)}
                >
                  {TIPOS_DESCONTO.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
                    >
                      {item}
                    </option>
                  ))}
                </Select>
              </Campo>

              <Campo label="Valor do desconto" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorDesconto}
                  onChange={(e) => setValue("valorDesconto", e.target.value)}
                  placeholder="0,00"
                  required
                />
              </Campo>

              <Campo label="Valor máximo de desconto" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorMaximoDesconto}
                  onChange={(e) =>
                    setValue("valorMaximoDesconto", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Valor mínimo do pedido" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorMinimoPedido}
                  onChange={(e) =>
                    setValue("valorMinimoPedido", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Limite de uso total" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  min="0"
                  value={form.limiteUsoTotal}
                  onChange={(e) => setValue("limiteUsoTotal", e.target.value)}
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Limite de uso por usuário" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  min="0"
                  value={form.limiteUsoPorUsuario}
                  onChange={(e) =>
                    setValue("limiteUsoPorUsuario", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Valor mínimo do frete" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.valorMinimoFrete}
                  onChange={(e) =>
                    setValue("valorMinimoFrete", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Data início" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="datetime-local"
                  value={form.dataInicio}
                  onChange={(e) => setValue("dataInicio", e.target.value)}
                />
              </Campo>

              <Campo label="Data fim" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="datetime-local"
                  value={form.dataFim}
                  onChange={(e) => setValue("dataFim", e.target.value)}
                />
              </Campo>

              <Campo
                label="Descrição"
                isDark={isDark}
                className="md:col-span-2 xl:col-span-3"
              >
                <Textarea
                  isDark={isDark}
                  rows={4}
                  value={form.descricao}
                  onChange={(e) => setValue("descricao", e.target.value)}
                  placeholder="Descrição interna ou pública do cupom"
                />
              </Campo>

              <Campo label="Tipo de entrega permitida" isDark={isDark}>
                <Select
                  isDark={isDark}
                  value={form.tipoEntregaPermitida}
                  onChange={(e) =>
                    setValue("tipoEntregaPermitida", e.target.value)
                  }
                >
                  <option
                    value=""
                    className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
                  >
                    Todas
                  </option>
                  {TIPOS_ENTREGA.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
                    >
                      {item}
                    </option>
                  ))}
                </Select>
              </Campo>

              <Campo label="Tipo de pagamento permitido" isDark={isDark}>
                <Select
                  isDark={isDark}
                  value={form.tipoPagamentoPermitido}
                  onChange={(e) =>
                    setValue("tipoPagamentoPermitido", e.target.value)
                  }
                >
                  <option
                    value=""
                    className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
                  >
                    Todos
                  </option>
                  {TIPOS_PAGAMENTO.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
                    >
                      {item}
                    </option>
                  ))}
                </Select>
              </Campo>

              <Campo label="Dias da semana permitidos" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.diasSemanaPermitidos}
                  onChange={(e) =>
                    setValue("diasSemanaPermitidos", e.target.value)
                  }
                  placeholder="MONDAY,TUESDAY,FRIDAY"
                />
              </Campo>

              <Campo label="Bairros permitidos" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.bairrosPermitidos}
                  onChange={(e) =>
                    setValue("bairrosPermitidos", e.target.value)
                  }
                  placeholder="CENTRO,ALDEOTA"
                />
              </Campo>

              <Campo label="CEPs permitidos" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.cepsPermitidos}
                  onChange={(e) => setValue("cepsPermitidos", e.target.value)}
                  placeholder="60000-000,60111-222"
                />
              </Campo>

              <Campo label="Categorias permitidas IDs" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.categoriasPermitidasIds}
                  onChange={(e) =>
                    setValue("categoriasPermitidasIds", e.target.value)
                  }
                  placeholder="1,2,3"
                />
              </Campo>

              <Campo label="Produtos permitidos IDs" isDark={isDark}>
                <Input
                  isDark={isDark}
                  value={form.produtosPermitidosIds}
                  onChange={(e) =>
                    setValue("produtosPermitidosIds", e.target.value)
                  }
                  placeholder="10,11,12"
                />
              </Campo>

              <Campo label="Horário início" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="time"
                  value={form.horarioInicio}
                  onChange={(e) => setValue("horarioInicio", e.target.value)}
                />
              </Campo>

              <Campo label="Horário fim" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="time"
                  value={form.horarioFim}
                  onChange={(e) => setValue("horarioFim", e.target.value)}
                />
              </Campo>

              <Campo label="Quantidade mínima de itens" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  min="0"
                  value={form.quantidadeMinimaItens}
                  onChange={(e) =>
                    setValue("quantidadeMinimaItens", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <Campo label="Quantidade máxima de itens" isDark={isDark}>
                <Input
                  isDark={isDark}
                  type="number"
                  min="0"
                  value={form.quantidadeMaximaItens}
                  onChange={(e) =>
                    setValue("quantidadeMaximaItens", e.target.value)
                  }
                  placeholder="Opcional"
                />
              </Campo>

              <div className="grid grid-cols-1 gap-3 md:col-span-2 xl:col-span-3 xl:grid-cols-3">
                <Checkbox
                  label="Cupom ativo"
                  checked={form.ativo}
                  onChange={(v) => setValue("ativo", v)}
                  isDark={isDark}
                />
                <Checkbox
                  label="Cumulativo"
                  checked={form.cumulativo}
                  onChange={(v) => setValue("cumulativo", v)}
                  isDark={isDark}
                />
                <Checkbox
                  label="Frete grátis"
                  checked={form.freteGratis}
                  onChange={(v) => setValue("freteGratis", v)}
                  isDark={isDark}
                />
                <Checkbox
                  label="Apenas primeira compra"
                  checked={form.apenasPrimeiraCompra}
                  onChange={(v) => setValue("apenasPrimeiraCompra", v)}
                  isDark={isDark}
                />
                <Checkbox
                  label="Apenas novo usuário"
                  checked={form.apenasNovoUsuario}
                  onChange={(v) => setValue("apenasNovoUsuario", v)}
                  isDark={isDark}
                />
                <Checkbox
                  label="Aplica em itens promocionais"
                  checked={form.aplicaEmItensPromocionais}
                  onChange={(v) =>
                    setValue("aplicaEmItensPromocionais", v)
                  }
                  isDark={isDark}
                />
              </div>

              <div className="flex items-center justify-end gap-3 md:col-span-2 xl:col-span-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={cx(
                    "rounded-2xl border px-5 py-3 text-sm font-bold transition",
                    isDark
                      ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving
                    ? "Salvando..."
                    : editing
                    ? "Salvar alterações"
                    : "Criar cupom"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

const isDateValid = (value) => {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
};

const getCupomSituacao = (cupom, isDark = true) => {
  const agora = new Date();
  const inicio = isDateValid(cupom?.dataInicio)
    ? new Date(cupom.dataInicio)
    : null;
  const fim = isDateValid(cupom?.dataFim) ? new Date(cupom.dataFim) : null;

  if (!cupom?.ativo) {
    return {
      key: "INATIVO",
      label: "Inativo",
      tone: isDark
        ? "bg-white/5 text-white/60 border-white/10"
        : "bg-zinc-100 text-zinc-700 border-zinc-200",
    };
  }

  if (inicio && agora < inicio) {
    return {
      key: "AGENDADO",
      label: "Agendado",
      tone: isDark
        ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
        : "bg-blue-100 text-blue-700 border-blue-200",
    };
  }

  if (fim && agora > fim) {
    return {
      key: "EXPIRADO",
      label: "Expirado",
      tone: isDark
        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
        : "bg-amber-100 text-amber-800 border-amber-200",
    };
  }

  return {
    key: "ATIVO",
    label: "Ativo",
    tone: isDark
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
};

const getResumoDesconto = (cupom) => {
  if (!cupom) return "—";

  if (cupom.tipoDesconto === "PERCENTUAL") {
    const perc = Number(cupom.valorDesconto || 0);
    if (cupom.valorMaximoDesconto) {
      return `${perc}% OFF • máx. ${brl(cupom.valorMaximoDesconto)}`;
    }
    return `${perc}% OFF`;
  }

  return `${brl(cupom.valorDesconto)} OFF`;
};

const getResumoVigencia = (cupom) => {
  const inicio = cupom?.dataInicio ? formatDateTime(cupom.dataInicio) : null;
  const fim = cupom?.dataFim ? formatDateTime(cupom.dataFim) : null;

  if (inicio && fim) return `${inicio} até ${fim}`;
  if (inicio && !fim) return `A partir de ${inicio}`;
  if (!inicio && fim) return `Até ${fim}`;
  return "Sem período definido";
};

const getBadgesCupom = (cupom) => {
  const badges = [];

  if (cupom?.valorMinimoPedido) {
    badges.push(`Pedido mín. ${brl(cupom.valorMinimoPedido)}`);
  }

  if (cupom?.tipoEntregaPermitida) {
    badges.push(`Entrega: ${cupom.tipoEntregaPermitida}`);
  }

  if (cupom?.tipoPagamentoPermitido) {
    badges.push(`Pagamento: ${cupom.tipoPagamentoPermitido}`);
  }

  if (cupom?.freteGratis) {
    badges.push("Frete grátis");
  }

  if (cupom?.apenasPrimeiraCompra) {
    badges.push("1ª compra");
  }

  if (cupom?.apenasNovoUsuario) {
    badges.push("Novo usuário");
  }

  if (cupom?.cumulativo) {
    badges.push("Cumulativo");
  }

  if (cupom?.quantidadeMinimaItens) {
    badges.push(`Mín. ${cupom.quantidadeMinimaItens} itens`);
  }

  if (cupom?.quantidadeMaximaItens) {
    badges.push(`Máx. ${cupom.quantidadeMaximaItens} itens`);
  }

  return badges;
};

function CupomCard({
  cupom,
  onToggleAtivo,
  onEdit,
  onDelete,
  isDark = true,
}) {
  const situacao = getCupomSituacao(cupom, isDark);
  const badges = getBadgesCupom(cupom);

  return (
    <div
      className={cx(
        "rounded-[26px] border p-5 transition-all",
        isDark
          ? "border-white/10 bg-white/5 hover:bg-white/[0.07]"
          : "border-zinc-200 bg-white hover:shadow-md"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-red-700">
              {cupom.codigo}
            </span>

            <span
              className={cx(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold",
                situacao.tone
              )}
            >
              {situacao.label}
            </span>
          </div>

          <div className="mt-3">
            <h3
              className={cx(
                "text-lg font-extrabold",
                isDark ? "text-white" : "text-zinc-900"
              )}
            >
              {cupom.nome || "Cupom sem nome"}
            </h3>
            <p
              className={cx(
                "mt-1 text-sm font-semibold",
                isDark ? "text-white/80" : "text-zinc-700"
              )}
            >
              {getResumoDesconto(cupom)}
            </p>
            <p
              className={cx(
                "mt-2 text-sm",
                isDark ? "text-white/50" : "text-zinc-500"
              )}
            >
              {cupom.descricao || "Sem descrição informada."}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div
              className={cx(
                "rounded-2xl border px-4 py-3",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-white/80"
              )}
            >
              <p
                className={cx(
                  "text-[11px] font-extrabold uppercase tracking-wide",
                  isDark ? "text-white/45" : "text-zinc-500"
                )}
              >
                Vigência
              </p>
              <p
                className={cx(
                  "mt-1 text-sm font-semibold",
                  isDark ? "text-white/85" : "text-zinc-800"
                )}
              >
                {getResumoVigencia(cupom)}
              </p>
            </div>

            <div
              className={cx(
                "rounded-2xl border px-4 py-3",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-white/80"
              )}
            >
              <p
                className={cx(
                  "text-[11px] font-extrabold uppercase tracking-wide",
                  isDark ? "text-white/45" : "text-zinc-500"
                )}
              >
                Uso total
              </p>
              <p
                className={cx(
                  "mt-1 text-sm font-semibold",
                  isDark ? "text-white/85" : "text-zinc-800"
                )}
              >
                {cupom.totalUsado ?? 0}
                {cupom.limiteUsoTotal ? ` / ${cupom.limiteUsoTotal}` : ""}
              </p>
            </div>

            <div
              className={cx(
                "rounded-2xl border px-4 py-3",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-white/80"
              )}
            >
              <p
                className={cx(
                  "text-[11px] font-extrabold uppercase tracking-wide",
                  isDark ? "text-white/45" : "text-zinc-500"
                )}
              >
                Limite por usuário
              </p>
              <p
                className={cx(
                  "mt-1 text-sm font-semibold",
                  isDark ? "text-white/85" : "text-zinc-800"
                )}
              >
                {cupom.limiteUsoPorUsuario ?? "Sem limite"}
              </p>
            </div>

            <div
              className={cx(
                "rounded-2xl border px-4 py-3",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-white/80"
              )}
            >
              <p
                className={cx(
                  "text-[11px] font-extrabold uppercase tracking-wide",
                  isDark ? "text-white/45" : "text-zinc-500"
                )}
              >
                Pedido mínimo
              </p>
              <p
                className={cx(
                  "mt-1 text-sm font-semibold",
                  isDark ? "text-white/85" : "text-zinc-800"
                )}
              >
                {cupom.valorMinimoPedido
                  ? brl(cupom.valorMinimoPedido)
                  : "Não exige"}
              </p>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge, index) => (
                <span
                  key={`${badge}-${index}`}
                  className={cx(
                    "inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                    isDark
                      ? "border-white/10 bg-white/5 text-white/70"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700"
                  )}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:flex-col">
          <button
            type="button"
            onClick={() => onToggleAtivo(cupom)}
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
              cupom.ativo
                ? isDark
                  ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                : isDark
                ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            )}
            title={cupom.ativo ? "Desativar" : "Ativar"}
          >
            {cupom.ativo ? <PowerOff size={17} /> : <Power size={17} />}
            <span className="hidden sm:inline">
              {cupom.ativo ? "Desativar" : "Ativar"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(cupom)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-90"
          >
            <Pencil size={17} />
            <span className="hidden sm:inline">Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(cupom)}
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
              isDark
                ? "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            )}
          >
            <Trash2 size={17} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const GerenciarCupons = ({ isDark = true, user }) => {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [somenteAtivos, setSomenteAtivos] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [openModal, setOpenModal] = useState(false);
  const [cupomEdit, setCupomEdit] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const API_URL = import.meta.env.VITE_API_URL;
  const empresaId = user?.empresaId;
  const empresaIdValido =
    empresaId && empresaId !== "null" && empresaId !== "undefined";

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const carregarCupons = async () => {
    try {
      if (!empresaIdValido) {
        console.error("empresaId não encontrado no localStorage");
        setCupons([]);
        return;
      }

      setLoading(true);

      const res = await fetch(`${API_URL}/empresas/${empresaId}/cupons`, {
        headers: authHeaders(),
      });

      if (!res.ok) {
        const erroTexto = await res.text();
        throw new Error(erroTexto || "Erro ao buscar cupons");
      }

      const data = await res.json();
      setCupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar cupons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCupons();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setCupomEdit(null);
  };

  const abrirNovo = () => {
    resetForm();
    setOpenModal(true);
  };

  const abrirEdicao = (cupom) => {
    setCupomEdit(cupom);
    setForm({
      codigo: cupom.codigo || "",
      nome: cupom.nome || "",
      descricao: cupom.descricao || "",
      ativo: !!cupom.ativo,
      tipoDesconto: cupom.tipoDesconto || "PERCENTUAL",
      valorDesconto: cupom.valorDesconto ?? "",
      valorMaximoDesconto: cupom.valorMaximoDesconto ?? "",
      valorMinimoPedido: cupom.valorMinimoPedido ?? "",
      limiteUsoTotal: cupom.limiteUsoTotal ?? "",
      limiteUsoPorUsuario: cupom.limiteUsoPorUsuario ?? "",
      dataInicio: toInputDateTime(cupom.dataInicio),
      dataFim: toInputDateTime(cupom.dataFim),
      tipoEntregaPermitida: cupom.tipoEntregaPermitida || "",
      tipoPagamentoPermitido: cupom.tipoPagamentoPermitido || "",
      cumulativo: !!cupom.cumulativo,
      apenasPrimeiraCompra: !!cupom.apenasPrimeiraCompra,
      apenasNovoUsuario: !!cupom.apenasNovoUsuario,
      freteGratis: !!cupom.freteGratis,
      aplicaEmItensPromocionais:
        cupom.aplicaEmItensPromocionais === null ||
        cupom.aplicaEmItensPromocionais === undefined
          ? true
          : !!cupom.aplicaEmItensPromocionais,
      quantidadeMinimaItens: cupom.quantidadeMinimaItens ?? "",
      quantidadeMaximaItens: cupom.quantidadeMaximaItens ?? "",
      valorMinimoFrete: cupom.valorMinimoFrete ?? "",
      horarioInicio: cupom.horarioInicio || "",
      horarioFim: cupom.horarioFim || "",
      diasSemanaPermitidos: cupom.diasSemanaPermitidos || "",
      bairrosPermitidos: cupom.bairrosPermitidos || "",
      cepsPermitidos: cupom.cepsPermitidos || "",
      categoriasPermitidasIds: cupom.categoriasPermitidasIds || "",
      produtosPermitidosIds: cupom.produtosPermitidosIds || "",
    });
    setOpenModal(true);
  };

  const montarPayload = () => ({
    codigo: form.codigo?.trim()?.toUpperCase(),
    nome: form.nome?.trim(),
    descricao: form.descricao?.trim() || null,
    ativo: parseNullableBoolean(form.ativo),
    tipoDesconto: form.tipoDesconto,
    valorDesconto: parseNullableNumber(form.valorDesconto),
    valorMaximoDesconto: parseNullableNumber(form.valorMaximoDesconto),
    valorMinimoPedido: parseNullableNumber(form.valorMinimoPedido),
    limiteUsoTotal: parseNullableNumber(form.limiteUsoTotal),
    limiteUsoPorUsuario: parseNullableNumber(form.limiteUsoPorUsuario),
    dataInicio: form.dataInicio || null,
    dataFim: form.dataFim || null,
    tipoEntregaPermitida: form.tipoEntregaPermitida || null,
    tipoPagamentoPermitido: form.tipoPagamentoPermitido || null,
    cumulativo: parseNullableBoolean(form.cumulativo),
    apenasPrimeiraCompra: parseNullableBoolean(form.apenasPrimeiraCompra),
    apenasNovoUsuario: parseNullableBoolean(form.apenasNovoUsuario),
    freteGratis: parseNullableBoolean(form.freteGratis),
    aplicaEmItensPromocionais: parseNullableBoolean(
      form.aplicaEmItensPromocionais
    ),
    quantidadeMinimaItens: parseNullableNumber(form.quantidadeMinimaItens),
    quantidadeMaximaItens: parseNullableNumber(form.quantidadeMaximaItens),
    valorMinimoFrete: parseNullableNumber(form.valorMinimoFrete),
    horarioInicio: form.horarioInicio || null,
    horarioFim: form.horarioFim || null,
    diasSemanaPermitidos: form.diasSemanaPermitidos?.trim() || null,
    bairrosPermitidos: form.bairrosPermitidos?.trim() || null,
    cepsPermitidos: form.cepsPermitidos?.trim() || null,
    categoriasPermitidasIds: form.categoriasPermitidasIds?.trim() || null,
    produtosPermitidosIds: form.produtosPermitidosIds?.trim() || null,
  });

  const salvarCupom = async (e) => {
    e.preventDefault();

    try {
      if (!empresaIdValido) {
        alert("Empresa não identificada. Faça login novamente.");
        return;
      }

      setSaving(true);

      const payload = montarPayload();

      const url = cupomEdit
        ? `${API_URL}/empresas/${empresaId}/cupons/${cupomEdit.id}`
        : `${API_URL}/empresas/${empresaId}/cupons`;

      const method = cupomEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Erro ao salvar cupom";
        try {
          const err = await res.text();
          if (err) msg = err;
        } catch {}
        throw new Error(msg);
      }

      setOpenModal(false);
      resetForm();
      await carregarCupons();
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao salvar cupom");
    } finally {
      setSaving(false);
    }
  };

  const excluirCupom = async (cupom) => {
    const ok = window.confirm(
      `Deseja realmente excluir o cupom ${cupom.codigo}?`
    );
    if (!ok) return;

    try {
      if (!empresaIdValido) {
        alert("Empresa não identificada. Faça login novamente.");
        return;
      }

      const res = await fetch(
        `${API_URL}/empresas/${empresaId}/cupons/${cupom.id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (!res.ok) throw new Error("Erro ao excluir cupom");

      await carregarCupons();
    } catch (error) {
      console.error(error);
      alert("Não foi possível excluir o cupom.");
    }
  };

  const alternarAtivo = async (cupom) => {
    try {
      if (!empresaIdValido) {
        alert("Empresa não identificada. Faça login novamente.");
        return;
      }

      const payload = {
        ...cupom,
        ativo: !cupom.ativo,
      };

      const res = await fetch(
        `${API_URL}/empresas/${empresaId}/cupons/${cupom.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Erro ao atualizar status do cupom");

      await carregarCupons();
    } catch (error) {
      console.error(error);
      alert("Não foi possível alterar o status do cupom.");
    }
  };

  const cuponsFiltrados = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return cupons.filter((cupom) => {
      const matchBusca =
        !termo ||
        `${cupom.codigo || ""} ${cupom.nome || ""} ${cupom.descricao || ""}`
          .toLowerCase()
          .includes(termo);

      const matchAtivo = !somenteAtivos || !!cupom.ativo;

      return matchBusca && matchAtivo;
    });
  }, [cupons, search, somenteAtivos]);

  const totalPages = Math.max(1, Math.ceil(cuponsFiltrados.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const cuponsPaginados = useMemo(() => {
    const start = (page - 1) * pageSize;
    return cuponsFiltrados.slice(start, start + pageSize);
  }, [cuponsFiltrados, page]);

  const resumo = useMemo(() => {
    const total = cupons.length;
    const ativos = cupons.filter((cupom) => cupom.ativo).length;
    const inativos = total - ativos;
    const comUso = cupons.filter((cupom) => Number(cupom.totalUsado || 0) > 0)
      .length;

    return { total, ativos, inativos, comUso };
  }, [cupons]);

  if (!empresaIdValido) {
    return (
      <div className="p-6">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          Empresa não identificada. Faça login novamente para gerenciar os
          cupons.
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "p-6",
        isDark ? "text-white" : "text-zinc-900"
      )}
    >
      <div
        className={cx(
          "mb-5 rounded-3xl border p-5 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white"
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-lg">
              <TicketPercent className="h-5 w-5" />
            </span>

            <div>
              <h2
                className={cx(
                  "text-xl font-extrabold",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Cupons e promoções
              </h2>
              <p
                className={cx(
                  "text-sm",
                  isDark ? "text-white/50" : "text-zinc-600"
                )}
              >
                Crie e gerencie campanhas de desconto.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNovo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 text-sm font-extrabold text-white transition hover:opacity-90 shadow-[0_12px_30px_rgba(229,37,42,0.25)]"
          >
            <Plus size={18} />
            Novo cupom
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total de cupons" value={resumo.total} isDark={isDark} />
          <StatCard label="Ativos" value={resumo.ativos} isDark={isDark} />
          <StatCard label="Inativos" value={resumo.inativos} isDark={isDark} />
          <StatCard label="Com uso" value={resumo.comUso} isDark={isDark} />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div
            className={cx(
              "flex flex-1 items-center gap-2 rounded-xl border px-3 py-2",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-zinc-200 bg-white"
            )}
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por código, nome ou descrição..."
              className={cx(
                "flex-1 bg-transparent text-sm outline-none",
                isDark ? "text-white placeholder:text-white/25" : "text-zinc-900 placeholder:text-zinc-400"
              )}
            />
          </div>

          <label
            className={cx(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold",
              isDark
                ? "border-white/10 bg-white/5 text-white"
                : "border-zinc-200 bg-white text-zinc-700"
            )}
          >
            <input
              type="checkbox"
              checked={somenteAtivos}
              onChange={(e) => {
                setSomenteAtivos(e.target.checked);
                setPage(1);
              }}
            />
            Ativos
          </label>
        </div>
      </div>

      <div
        className={cx(
          "rounded-3xl border p-4 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white"
        )}
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cx(
                  "h-44 animate-pulse rounded-[26px] border",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-zinc-200 bg-zinc-100"
                )}
              />
            ))}
          </div>
        ) : cuponsPaginados.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div
                className={cx(
                  "mb-4 rounded-full p-4",
                  isDark
                    ? "bg-red-500/10 text-red-300"
                    : "bg-red-50 text-red-600"
                )}
              >
                <TicketPercent size={28} />
              </div>
              <h3
                className={cx(
                  "text-lg font-extrabold",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Nenhum cupom encontrado
              </h3>
              <p
                className={cx(
                  "mt-2 text-sm",
                  isDark ? "text-white/50" : "text-zinc-500"
                )}
              >
                Crie um novo cupom ou ajuste os filtros para visualizar
                resultados.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cuponsPaginados.map((cupom) => (
              <CupomCard
                key={cupom.id}
                cupom={cupom}
                onToggleAtivo={alternarAtivo}
                onEdit={abrirEdicao}
                onDelete={excluirCupom}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        <div
          className={cx(
            "mt-5 flex flex-col gap-3 border-t px-1 pt-4 sm:flex-row sm:items-center sm:justify-between",
            isDark ? "border-white/10" : "border-zinc-100"
          )}
        >
          <p
            className={cx(
              "text-sm",
              isDark ? "text-white/50" : "text-zinc-500"
            )}
          >
            {cuponsFiltrados.length} cupom(ns) encontrado(s)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cx(
                "rounded-2xl border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                isDark
                  ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              Anterior
            </button>

            <span
              className={cx(
                "px-3 text-sm font-bold",
                isDark ? "text-white/80" : "text-zinc-700"
              )}
            >
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={cx(
                "rounded-2xl border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
                isDark
                  ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      <CupomModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }}
        form={form}
        setForm={setForm}
        onSubmit={salvarCupom}
        saving={saving}
        editing={!!cupomEdit}
        isDark={isDark}
      />
    </div>
  );
};

export default GerenciarCupons;