import { memo, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  EyeOff,
  Flame,
  ChevronRight,
  Percent,
} from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import ProdutoModal from "./ProdutoModal";

const cx = (...c) => c.filter(Boolean).join(" ");

const formatBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace(".", ",")}`;

const getPrecoBaseVariacao = (variacao) => Number(variacao?.preco || 0);

const getPrecoFinalVariacao = (variacao) =>
  Number(variacao?.precoPromocional ?? variacao?.preco ?? 0);

const getProdutoPricing = (produto) => {
  const vars = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  const temVariacoes = vars.length > 0;
  const ofertaVigente = !!produto?.ofertaVigente;

  if (temVariacoes) {
    const precosBase = vars
      .map(getPrecoBaseVariacao)
      .filter((n) => Number.isFinite(n) && n >= 0);

    const precosFinais = vars
      .map(getPrecoFinalVariacao)
      .filter((n) => Number.isFinite(n) && n >= 0);

    const menorPrecoBase = precosBase.length ? Math.min(...precosBase) : 0;
    const menorPrecoFinal = precosFinais.length ? Math.min(...precosFinais) : 0;

    return {
      temVariacoes: true,
      ofertaVigente,
      precoBaseExibido: menorPrecoBase,
      precoFinalExibido: ofertaVigente
        ? menorPrecoFinal
        : Number(produto?.precoMinimo ?? menorPrecoBase),
    };
  }

  const precoBase = Number(produto?.precoBase || 0);
  const precoFinal = Number(
    ofertaVigente
      ? produto?.precoPromocional
      : produto?.precoMinimo ?? precoBase
  );

  return {
    temVariacoes: false,
    ofertaVigente,
    precoBaseExibido: Number.isFinite(precoBase) ? precoBase : 0,
    precoFinalExibido: Number.isFinite(precoFinal) ? precoFinal : 0,
  };
};

const pickTotalStock = (produto) => {
  const vars = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  if (vars.length) {
    let total = 0;
    for (const v of vars) total += Number(v?.estoque) || 0;
    return total;
  }
  return Number(produto?.estoque) || 0;
};

const Badge = ({ kind, children }) => {
  const cls =
    kind === "hot"
      ? "bg-red-600 text-white"
      : kind === "off"
      ? "bg-zinc-900/90 text-white"
      : kind === "promo"
      ? "bg-red-50 text-red-700 border border-red-100"
      : kind === "ok"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
      : "bg-red-50 text-red-700 border border-red-100";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        cls
      )}
    >
      {children}
    </span>
  );
};

const ProdutoCard = ({ produto, variants, onAdicionar }) => {
  const [open, setOpen] = useState(false);

  const {
    temVariacoes,
    ofertaVigente,
    precoBaseExibido,
    precoFinalExibido,
  } = useMemo(() => getProdutoPricing(produto), [produto]);

  const estoqueTotal = useMemo(() => pickTotalStock(produto), [produto]);
  const indisponivel = !produto?.ativo || estoqueTotal <= 0;

  const temDescontoVisivel =
    ofertaVigente && Number(precoFinalExibido) < Number(precoBaseExibido);

  const showHot = produto?.maisVendido || (produto?.pedidos ?? 0) >= 200;

  const handleOpenModal = useCallback(() => {
    if (indisponivel || precoFinalExibido <= 0) return;
    setOpen(true);
  }, [indisponivel, precoFinalExibido]);

  const handleAdicionarClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (indisponivel || precoFinalExibido <= 0) return;

      if (!temVariacoes) onAdicionar(produto);
      else setOpen(true);
    },
    [temVariacoes, indisponivel, onAdicionar, precoFinalExibido, produto]
  );

  return (
    <>
      <motion.div
        variants={variants}
        whileHover={{ scale: indisponivel ? 1 : 1.01 }}
        className="w-full"
      >
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={indisponivel || precoFinalExibido <= 0}
          className={cx(
            "w-full text-left",
            "rounded-3xl border bg-white",
            "shadow-sm hover:shadow-md transition",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            indisponivel ? "border-zinc-200" : "border-zinc-200 hover:border-zinc-300"
          )}
          aria-label={`Abrir item ${produto?.nome || "produto"}`}
        >
          <div className="p-3 sm:p-4">
            <div className="flex items-stretch gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    {showHot && (
                      <Badge kind="hot">
                        <Flame className="w-3.5 h-3.5" />
                        Mais pedido
                      </Badge>
                    )}

                    {!produto?.ativo ? (
                      <Badge kind="off">
                        <EyeOff className="w-3.5 h-3.5" />
                        Indisponível
                      </Badge>
                    ) : estoqueTotal <= 0 ? (
                      <Badge kind="bad">Indisponível</Badge>
                    ) : (
                      <Badge kind="ok">Disponível</Badge>
                    )}

                    {ofertaVigente ? (
                      <Badge kind="promo">
                        <Percent className="w-3.5 h-3.5" />
                        Oferta
                      </Badge>
                    ) : null}
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>

                <h3 className="mt-2 text-sm sm:text-base font-extrabold text-zinc-900 leading-tight line-clamp-1">
                  {produto?.nome}
                </h3>

                {produto?.descricao && (
                  <p className="mt-1 text-xs sm:text-sm text-zinc-600 line-clamp-2">
                    {produto.descricao}
                  </p>
                )}

                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    {precoFinalExibido > 0 ? (
                      <div>
                          {temDescontoVisivel ? (
                            <p className="text-xs font-semibold text-zinc-400 line-through mt-0.5">
                              de {formatBRL(precoBaseExibido)} por
                            </p>
                          ) : null}
                        <p className="text-sm sm:text-base font-extrabold text-zinc-900">
                          {temVariacoes && (
                            <span className="text-zinc-500 font-semibold text-[11px] sm:text-xs mr-1">
                              a partir de
                            </span>
                          )}
                          <span className={temDescontoVisivel ? "text-red-600" : ""}>
                            {formatBRL(precoFinalExibido)}
                          </span>
                        </p>

                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-zinc-500">
                        Preço indisponível
                      </p>
                    )}
                  </div>

                </div>
              </div>

              <div className="shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200">
                  <img
                    src={produto?.imagemUrl || "/placeholder.png"}
                    alt={produto?.nome || "Produto"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {open && produto?.ativo && (
        <ProdutoModal
          produto={produto}
          onClose={() => setOpen(false)}
          onAdicionar={onAdicionar}
        />
      )}
    </>
  );
};

ProdutoCard.propTypes = {
  produto: PropTypes.object.isRequired,
  variants: PropTypes.object,
  onAdicionar: PropTypes.func.isRequired,
};

export default memo(ProdutoCard);