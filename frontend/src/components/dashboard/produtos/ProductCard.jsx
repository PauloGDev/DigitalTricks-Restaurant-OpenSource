// src/components/dashboard/produtos/ProductCard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  PackageX,
  EyeOff,
  RefreshCcw,
  X,
  Tag,
  Layers3,
  Check,
  Pencil,
  Percent,
  Package2,
  Boxes,
  Clock3,
  BadgeDollarSign,
} from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";
import DeleteConfirmModal from "./DeleteConfirmModal";
import EditProductModal from "./EditProductModal";

/* ---------------------------
   Theme helpers
--------------------------- */
const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const normalizeEmpresaId = (raw) => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "number" || typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.id !== undefined && parsed?.id !== null) {
      return parsed.id;
    }

    return raw;
  } catch {
    return raw;
  }
};

/* ---------------------------
   Helpers
--------------------------- */
const brl = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));

const getPrecoBaseVariacao = (variacao) => Number(variacao?.preco || 0);

const getPrecoFinalVariacao = (variacao) =>
  Number(variacao?.precoPromocional ?? variacao?.preco ?? 0);

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "—";
  }
};

function Badge({ tone = "neutral", children, isDark }) {
  const cls =
    tone === "danger"
      ? isDark
        ? "bg-red-500/10 text-red-300 border-red-500/20"
        : "bg-red-50 text-red-700 border-red-200"
      : tone === "ok"
      ? isDark
        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? isDark
        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
        : "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "info"
      ? isDark
        ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
        : "bg-sky-50 text-sky-700 border-sky-200"
      : isDark
      ? "bg-white/5 text-white/75 border-white/10"
      : "bg-zinc-50 text-zinc-700 border-zinc-200";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-extrabold ${cls}`}
    >
      {children}
    </span>
  );
}

function InfoBlock({ label, value, isDark }) {
  return (
    <div
      className={[
        "rounded-2xl border p-3",
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-zinc-200 bg-zinc-50",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-extrabold uppercase tracking-wide",
          isDark ? "text-white/40" : "text-zinc-500",
        ].join(" ")}
      >
        {label}
      </p>
      <p
        className={[
          "mt-1 text-sm font-extrabold",
          isDark ? "text-white" : "text-zinc-900",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------------------------
   Modal de detalhes (admin)
--------------------------- */
function ProdutoDetalhesModal({ produto, open, onClose, isDark }) {
  const [showVariacoes, setShowVariacoes] = useState(true);

  if (!open) return null;

  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  const categorias = Array.isArray(produto?.categorias) ? produto.categorias : [];

  const temVariacoes = variacoes.length > 0;
  const ofertaVigente = !!produto?.ofertaVigente;

  const precoBaseExibido = temVariacoes
    ? Math.min(...variacoes.map((v) => getPrecoBaseVariacao(v)))
    : Number(produto?.precoBase || 0);

  const precoFinalExibido = temVariacoes
    ? Math.min(...variacoes.map((v) => getPrecoFinalVariacao(v)))
    : Number(
        produto?.ofertaVigente
          ? produto?.precoPromocional
          : produto?.precoMinimo ?? produto?.precoBase ?? 0
      );

  const estoqueTotal = temVariacoes
    ? variacoes.reduce((acc, v) => acc + (Number(v?.estoque) || 0), 0)
    : Number(produto?.estoque || 0);

  const temDescontoVisivel =
    ofertaVigente && Number(precoFinalExibido) < Number(precoBaseExibido);

  return (
    <div className="fixed inset-0 z-[999]">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={[
            "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:max-h-[88vh] sm:max-w-3xl sm:rounded-3xl",
            isDark ? "bg-[#121212] text-white" : "bg-white text-zinc-900",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={[
              "sticky top-0 z-10 border-b backdrop-blur",
              isDark
                ? "border-white/10 bg-[#121212]/95"
                : "border-zinc-100 bg-white/95",
            ].join(" ")}
          >
            <div className="flex items-start gap-4 px-5 py-4 sm:px-6">
              <div
                className={[
                  "h-16 w-16 shrink-0 overflow-hidden rounded-2xl border sm:h-20 sm:w-20",
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-zinc-200 bg-zinc-50",
                ].join(" ")}
              >
                {produto?.imagemUrl ? (
                  <img
                    src={produto.imagemUrl}
                    alt={produto.nome}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={[
                      "grid h-full w-full place-items-center",
                      isDark ? "text-white/35" : "text-zinc-400",
                    ].join(" ")}
                  >
                    <PackageX className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-extrabold leading-tight sm:text-lg">
                      {produto?.nome || "Produto"}
                    </h2>

                    {produto?.descricao ? (
                      <p
                        className={[
                          "mt-1 line-clamp-2 text-sm",
                          isDark ? "text-white/50" : "text-zinc-600",
                        ].join(" ")}
                      >
                        {produto.descricao}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {produto?.ativo ? (
                        <Badge tone="ok" isDark={isDark}>
                          <Check className="h-4 w-4" /> Ativo
                        </Badge>
                      ) : (
                        <Badge tone="danger" isDark={isDark}>
                          <EyeOff className="h-4 w-4" /> Inativo
                        </Badge>
                      )}

                      {temVariacoes ? (
                        <Badge tone="info" isDark={isDark}>
                          <Layers3 className="h-4 w-4" />
                          {variacoes.length} variações
                        </Badge>
                      ) : (
                        <Badge isDark={isDark}>Produto simples</Badge>
                      )}

                      {ofertaVigente ? (
                        <Badge tone="danger" isDark={isDark}>
                          <Percent className="h-4 w-4" />
                          Oferta ativa
                        </Badge>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className={[
                      "grid h-10 w-10 place-items-center rounded-2xl border transition",
                      isDark
                        ? "border-white/10 bg-white/5 hover:bg-white/10"
                        : "border-zinc-200 bg-white hover:bg-zinc-50",
                    ].join(" ")}
                    aria-label="Fechar"
                  >
                    <X
                      className={[
                        "h-5 w-5",
                        isDark ? "text-white/70" : "text-zinc-700",
                      ].join(" ")}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-auto px-5 py-5 sm:px-6">
            <div
              className={[
                "rounded-3xl border p-4",
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-zinc-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <Tag
                  className={[
                    "h-4 w-4",
                    isDark ? "text-red-300" : "text-red-600",
                  ].join(" ")}
                />
                <p className="text-sm font-extrabold">Categorias</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {categorias.length ? (
                  categorias.map((cat, i) => (
                    <span
                      key={i}
                      className={[
                        "rounded-full border px-3 py-1 text-xs font-extrabold",
                        isDark
                          ? "border-red-500/20 bg-red-500/10 text-red-300"
                          : "border-red-200 bg-red-50 text-red-700",
                      ].join(" ")}
                    >
                      {typeof cat === "string" ? cat : cat?.nome}
                    </span>
                  ))
                ) : (
                  <p
                    className={[
                      "text-sm",
                      isDark ? "text-white/50" : "text-zinc-500",
                    ].join(" ")}
                  >
                    Sem categorias.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <InfoBlock
                label="Preço base"
                value={
                  temVariacoes
                    ? `A partir de ${brl(precoBaseExibido)}`
                    : brl(precoBaseExibido)
                }
                isDark={isDark}
              />

              <div
                className={[
                  "rounded-2xl border p-3",
                  isDark
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-zinc-200 bg-zinc-50",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-extrabold uppercase tracking-wide",
                    isDark ? "text-white/40" : "text-zinc-500",
                  ].join(" ")}
                >
                  Preço final
                </p>

                {temDescontoVisivel ? (
                  <div className="mt-1">
                    <p className="text-lg font-extrabold text-red-500">
                      {temVariacoes
                        ? `A partir de ${brl(precoFinalExibido)}`
                        : brl(precoFinalExibido)}
                    </p>
                    <p
                      className={[
                        "text-xs line-through",
                        isDark ? "text-white/30" : "text-zinc-400",
                      ].join(" ")}
                    >
                      {brl(precoBaseExibido)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-lg font-extrabold text-red-500">
                    {temVariacoes
                      ? `A partir de ${brl(precoFinalExibido)}`
                      : brl(precoFinalExibido)}
                  </p>
                )}
              </div>

              <InfoBlock label="Estoque" value={estoqueTotal} isDark={isDark} />
              <InfoBlock
                label="ID"
                value={`#${produto?.id ?? "—"}`}
                isDark={isDark}
              />
            </div>

            {produto?.emOferta || produto?.ofertaVigente ? (
              <div
                className={[
                  "mt-4 rounded-3xl border p-4",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-zinc-200 bg-white",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <Percent
                    className={[
                      "h-4 w-4",
                      isDark ? "text-red-300" : "text-red-600",
                    ].join(" ")}
                  />
                  <p className="text-sm font-extrabold">Oferta / promoção</p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoBlock
                    label="Em oferta"
                    value={produto?.emOferta ? "Sim" : "Não"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Oferta vigente"
                    value={produto?.ofertaVigente ? "Sim" : "Não"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Tipo"
                    value={produto?.tipoDesconto || "—"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Desconto"
                    value={
                      produto?.tipoDesconto === "PERCENTUAL"
                        ? `${Number(produto?.valorDesconto || 0)}%`
                        : produto?.valorDesconto != null
                        ? brl(produto?.valorDesconto)
                        : "—"
                    }
                    isDark={isDark}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoBlock
                    label="Título da oferta"
                    value={produto?.tituloOferta || "—"}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Início"
                    value={formatDateTime(produto?.inicioOferta)}
                    isDark={isDark}
                  />
                  <InfoBlock
                    label="Fim"
                    value={formatDateTime(produto?.fimOferta)}
                    isDark={isDark}
                  />
                </div>
              </div>
            ) : null}

            <div
              className={[
                "mt-4 rounded-3xl border p-4",
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-zinc-200 bg-white",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() => setShowVariacoes((v) => !v)}
                className="flex w-full items-center justify-between"
              >
                <p className="text-sm font-extrabold">Variações</p>
                {showVariacoes ? (
                  <ChevronUp
                    className={[
                      "h-5 w-5",
                      isDark ? "text-white/40" : "text-zinc-500",
                    ].join(" ")}
                  />
                ) : (
                  <ChevronDown
                    className={[
                      "h-5 w-5",
                      isDark ? "text-white/40" : "text-zinc-500",
                    ].join(" ")}
                  />
                )}
              </button>

              {showVariacoes ? (
                <div className="mt-3 space-y-2">
                  {temVariacoes ? (
                    variacoes.map((v, index) => {
                      const estoque = Number(v?.estoque || 0);
                      const tone =
                        estoque > 5 ? "ok" : estoque > 0 ? "warn" : "danger";

                      const precoBase = getPrecoBaseVariacao(v);
                      const precoFinal = getPrecoFinalVariacao(v);
                      const variacaoTemOferta =
                        ofertaVigente && precoFinal < precoBase;

                      return (
                        <div
                          key={v?.id ?? index}
                          className={[
                            "flex items-center justify-between gap-3 rounded-2xl border p-3",
                            isDark
                              ? "border-white/10 bg-white/[0.03]"
                              : "border-zinc-200 bg-white",
                          ].join(" ")}
                        >
                          <div className="min-w-0">
                            <p
                              className={[
                                "truncate text-sm font-extrabold",
                                isDark ? "text-white" : "text-zinc-900",
                              ].join(" ")}
                            >
                              {v?.nome || "Variação"}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge tone={tone} isDark={isDark}>
                                {estoque > 0 ? `Estoque: ${estoque}` : "Esgotado"}
                              </Badge>

                              {variacaoTemOferta ? (
                                <Badge tone="danger" isDark={isDark}>
                                  <Percent className="h-4 w-4" />
                                  Oferta
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="text-right">
                            {variacaoTemOferta ? (
                              <>
                                <p className="text-sm font-extrabold text-red-500">
                                  {brl(precoFinal)}
                                </p>
                                <p
                                  className={[
                                    "text-xs line-through",
                                    isDark ? "text-white/30" : "text-zinc-400",
                                  ].join(" ")}
                                >
                                  {brl(precoBase)}
                                </p>
                              </>
                            ) : (
                              <p
                                className={[
                                  "text-sm font-extrabold",
                                  isDark ? "text-white" : "text-zinc-900",
                                ].join(" ")}
                              >
                                {brl(precoBase)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p
                      className={[
                        "text-sm",
                        isDark ? "text-white/50" : "text-zinc-500",
                      ].join(" ")}
                    >
                      Produto sem variações.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={[
              "sticky bottom-0 z-10 border-t backdrop-blur",
              isDark
                ? "border-white/10 bg-[#121212]/95"
                : "border-zinc-100 bg-white/95",
            ].join(" ")}
          >
            <div className="flex items-center justify-end gap-3 px-5 py-4 sm:px-6">
              <button
                onClick={onClose}
                className={[
                  "h-11 rounded-2xl border px-5 font-extrabold transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                ].join(" ")}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Card principal
--------------------------- */
const ProductCard = ({ produto, onChange, onProdutoAtualizado }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { showNotification } = useNotification();

  const [theme, setTheme] = useState(getThemeState());
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);

  const empresaId = useMemo(
    () => normalizeEmpresaId(localStorage.getItem("empresaId")),
    []
  );

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const {
    estoqueTotal,
    precoBaseExibido,
    precoFinalExibido,
    esgotadas,
    temVariacoes,
    ofertaVigente,
  } = useMemo(() => {
    const vars = Array.isArray(produto?.variacoes) ? produto.variacoes : [];

    if (vars.length > 0) {
      const estoque = vars.reduce((acc, v) => acc + (Number(v?.estoque) || 0), 0);

      const menorPrecoBase = Math.min(
        ...vars.map((v) => getPrecoBaseVariacao(v))
      );

      const menorPrecoFinal = Math.min(
        ...vars.map((v) => getPrecoFinalVariacao(v))
      );

      const esgotadasCount = vars.filter(
        (v) => (Number(v?.estoque) || 0) <= 0
      ).length;

      return {
        estoqueTotal: estoque,
        precoBaseExibido: menorPrecoBase,
        precoFinalExibido: produto?.ofertaVigente
          ? menorPrecoFinal
          : Number(produto?.precoMinimo ?? menorPrecoBase),
        esgotadas: esgotadasCount,
        temVariacoes: true,
        ofertaVigente: !!produto?.ofertaVigente,
      };
    }

    const precoBase = Number(produto?.precoBase || 0);
    const precoFinal = Number(
      produto?.ofertaVigente
        ? produto?.precoPromocional
        : produto?.precoMinimo ?? precoBase
    );

    return {
      estoqueTotal: Number(produto?.estoque || 0),
      precoBaseExibido: precoBase,
      precoFinalExibido: precoFinal,
      esgotadas: 0,
      temVariacoes: false,
      ofertaVigente: !!produto?.ofertaVigente,
    };
  }, [produto]);

  const handleToggleAtivo = async (id, novoStatus) => {
    try {
      if (!empresaId) {
        throw new Error("Empresa não identificada.");
      }

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/empresas/${empresaId}/produtos/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ativo: novoStatus }),
        }
      );

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Erro ao atualizar status do produto");
      }

      const produtoAtualizado = await res.json().catch(() => null);

      if (produtoAtualizado && typeof onProdutoAtualizado === "function") {
        onProdutoAtualizado(produtoAtualizado);
      } else {
        onChange?.();
      }

      showNotification(
        novoStatus ? "✅ Produto reativado!" : "🛑 Produto desativado!",
        "success"
      );
    } catch (err) {
      console.error(err);
      showNotification(
        err?.message || "❌ Não foi possível atualizar o status",
        "error"
      );
    } finally {
      setConfirmToggle(false);
    }
  };

  const categorias = Array.isArray(produto?.categorias) ? produto.categorias : [];
  const nomeCats =
    categorias
      .slice(0, 3)
      .map((c) => (typeof c === "string" ? c : c?.nome))
      .filter(Boolean) || [];

  const estoqueTone =
    estoqueTotal > 5 ? "ok" : estoqueTotal > 0 ? "warn" : "danger";

  const temDescontoVisivel =
    ofertaVigente && Number(precoFinalExibido) < Number(precoBaseExibido);

  return (
    <>
      <div
        onClick={() => setOpenDetalhes(true)}
        className={[
          "group relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300",
          isDark
            ? "border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.24)] hover:bg-white/[0.05] hover:shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
            : "border-zinc-200 bg-white shadow-sm hover:shadow-md",
        ].join(" ")}
      >
        {!produto?.ativo ? (
          <div className="absolute left-3 top-3 z-10">
            <Badge tone="danger" isDark={isDark}>
              <EyeOff className="h-4 w-4" /> Inativo
            </Badge>
          </div>
        ) : null}

        <div
          className={[
            "relative h-44 w-full overflow-hidden border-b",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-zinc-100 bg-zinc-50",
          ].join(" ")}
        >
          {produto?.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div
              className={[
                "grid h-full w-full place-items-center",
                isDark ? "text-white/30" : "text-zinc-400",
              ].join(" ")}
            >
              <PackageX className="h-10 w-10" />
            </div>
          )}

          <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
            {temVariacoes ? (
              <Badge tone="info" isDark={isDark}>
                <Layers3 className="h-4 w-4" />
                {produto?.variacoes?.length || 0}
              </Badge>
            ) : (
              <Badge isDark={isDark}>Simples</Badge>
            )}

            <Badge tone={estoqueTone} isDark={isDark}>
              {estoqueTotal > 0 ? `Estoque: ${estoqueTotal}` : "Esgotado"}
            </Badge>

            {ofertaVigente ? (
              <Badge tone="danger" isDark={isDark}>
                <Percent className="h-4 w-4" />
                Oferta
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={[
                  "truncate text-base font-extrabold",
                  isDark ? "text-white" : "text-zinc-900",
                ].join(" ")}
              >
                {produto?.nome}
              </h3>
              <p
                className={[
                  "mt-1 line-clamp-2 text-sm",
                  isDark ? "text-white/50" : "text-zinc-600",
                ].join(" ")}
              >
                {produto?.descricao || "Sem descrição"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={[
                  "text-xs font-extrabold uppercase tracking-wide",
                  isDark ? "text-white/35" : "text-zinc-500",
                ].join(" ")}
              >
                {temVariacoes ? "A partir de" : "Preço"}
              </p>

              {temDescontoVisivel ? (
                <>
                  <p className="text-lg font-extrabold text-red-500">
                    {brl(precoFinalExibido)}
                  </p>
                  <p
                    className={[
                      "text-xs line-through",
                      isDark ? "text-white/30" : "text-zinc-400",
                    ].join(" ")}
                  >
                    {brl(precoBaseExibido)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-extrabold text-red-500">
                  {brl(precoFinalExibido)}
                </p>
              )}
            </div>
          </div>

          {nomeCats.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {nomeCats.map((cat, i) => (
                <span
                  key={i}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-extrabold",
                    isDark
                      ? "border-red-500/20 bg-red-500/10 text-red-300"
                      : "border-red-200 bg-red-50 text-red-700",
                  ].join(" ")}
                >
                  {cat}
                </span>
              ))}

              {categorias.length > 3 ? (
                <span
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-extrabold",
                    isDark
                      ? "border-white/10 bg-white/5 text-white/75"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700",
                  ].join(" ")}
                >
                  +{categorias.length - 3}
                </span>
              ) : null}
            </div>
          ) : null}

          {temVariacoes && esgotadas > 0 ? (
            <p
              className={[
                "mt-3 text-xs",
                isDark ? "text-white/55" : "text-zinc-600",
              ].join(" ")}
            >
              <span className="font-extrabold text-red-500">{esgotadas}</span>{" "}
              variação(ões) esgotada(s).
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenEditar(true);
              }}
              className={[
                "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border text-sm font-extrabold transition",
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
              ].join(" ")}
              title="Editar produto"
            >
              <Pencil
                className={[
                  "h-4 w-4",
                  isDark ? "text-red-300" : "text-red-600",
                ].join(" ")}
              />
              Editar
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmToggle(true);
              }}
              className={[
                "inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-extrabold text-white transition",
                produto?.ativo
                  ? "bg-red-600 shadow-[0_12px_26px_rgba(220,38,38,0.18)] hover:bg-red-500"
                  : "bg-emerald-600 shadow-[0_12px_26px_rgba(16,185,129,0.18)] hover:bg-emerald-500",
              ].join(" ")}
              title={produto?.ativo ? "Desativar produto" : "Reativar produto"}
            >
              {produto?.ativo ? (
                <>
                  <Trash2 className="h-4 w-4" /> Desativar
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" /> Reativar
                </>
              )}
            </button>
          </div>

          <p
            className={[
              "mt-3 text-xs",
              isDark ? "text-white/40" : "text-zinc-500",
            ].join(" ")}
          >
            Clique no card para ver detalhes completos.
          </p>
        </div>
      </div>

      <ProdutoDetalhesModal
        produto={produto}
        open={openDetalhes}
        onClose={() => setOpenDetalhes(false)}
        isDark={isDark}
      />

      {openEditar && (
        <EditProductModal
          produto={produto}
          onClose={() => setOpenEditar(false)}
          onSaved={(produtoAtualizado) => {
            if (produtoAtualizado && typeof onProdutoAtualizado === "function") {
              onProdutoAtualizado(produtoAtualizado);
            } else {
              onChange?.();
            }

            showNotification("✅ Produto atualizado com sucesso!", "success");
            setOpenEditar(false);
          }}
        />
      )}

      <DeleteConfirmModal
        isOpen={confirmToggle}
        onClose={() => setConfirmToggle(false)}
        onConfirm={() => handleToggleAtivo(produto.id, !produto.ativo)}
        title={produto.ativo ? "Desativar produto?" : "Reativar produto?"}
        message={
          produto.ativo
            ? "O produto ficará inativo e não aparecerá na loja."
            : "O produto voltará a aparecer na loja."
        }
        isReativando={!produto.ativo}
      />
    </>
  );
};

export default ProductCard;