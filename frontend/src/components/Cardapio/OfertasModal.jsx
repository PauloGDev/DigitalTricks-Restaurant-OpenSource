import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, ArrowRight } from "lucide-react";
import ProdutoCard from "../../pages/Produtos/ProdutoCard";
import { useNavigate } from "react-router-dom";

const parseMoney = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const raw = String(value).trim().replace(/[^\d,.-]/g, "");
  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");
  let normalized = raw.replace(".", "");
  if (hasComma && !hasDot) normalized = raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getPreco = (produto) => {
  const preco = parseMoney(
    produto?.preco ?? produto?.precoBase ?? produto?.precoMinimo ?? 0
  );
  if (preco > 0) return preco;
  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  const precos = variacoes.map((v) => parseMoney(v?.preco ?? 0)).filter((v) => v > 0);
  return precos.length ? Math.min(...precos) : 0;
};

const getPrecoPromocional = (produto) => {
  const prom = parseMoney(
    produto?.precoPromocional ?? produto?.valorPromocional ?? 0
  );
  if (prom > 0) return prom;
  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  const promocionais = variacoes
    .map((v) => parseMoney(v?.precoPromocional ?? v?.precoOferta ?? 0))
    .filter((v) => v > 0);
  return promocionais.length ? Math.min(...promocionais) : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));

export default function OfertasModal({ produtos = [], slug, onClose, onAdicionar }) {
  const navigate = useNavigate();
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const ofertas = produtos.filter((p) => {
    const preco = getPreco(p);
    const prom = getPrecoPromocional(p);
    return p?.ofertaVigente || p?.emOferta || (preco > 0 && prom > 0 && prom < preco);
  });

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] overflow-hidden rounded-t-[2rem] bg-zinc-50 md:max-w-lg md:mx-auto md:rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900">Ofertas</h2>
                    <p className="text-xs text-zinc-500">{ofertas.length} produto{ofertas.length !== 1 ? "s" : ""} em oferta</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products list */}
            <div className="overflow-y-auto px-4 pt-4 pb-24 max-h-[calc(90vh-80px)]">
              {ofertas.length === 0 ? (
                <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500 shadow-sm">
                  <Tag className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
                  <p className="font-bold">Nenhuma oferta no momento</p>
                  <p className="mt-1 text-sm">Volte mais tarde para conferir novas promocoes!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ofertas.map((produto) => {
                    const preco = getPreco(produto);
                    const prom = getPrecoPromocional(produto);
                    const desconto = preco > 0 && prom > 0 ? Math.round(((preco - prom) / preco) * 100) : 0;

                    return (
                      <button
                        key={produto.id}
                        onClick={() => setProdutoSelecionado(produto)}
                        className="group w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm text-left transition hover:border-red-200 hover:shadow-md"
                      >
                        <div className="flex gap-3">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                            <img
                              src={produto?.imagem || produto?.imagemUrl || "/placeholder-food.jpg"}
                              alt={produto?.nome}
                              className="h-full w-full object-cover"
                              onError={(e) => (e.target.src = "/placeholder-food.jpg")}
                            />
                            {desconto > 0 && (
                              <div className="absolute top-1 left-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                                -{desconto}%
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pl-1">
                            <h3 className="line-clamp-1 text-sm font-black text-zinc-900">{produto?.nome}</h3>
                            {produto?.descricao && (
                              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{produto.descricao}</p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              {prom > 0 && prom < preco ? (
                                <>
                                  <span className="text-xs text-zinc-400 line-through">{formatMoney(preco)}</span>
                                  <span className="text-sm font-black text-emerald-600">{formatMoney(prom)}</span>
                                </>
                              ) : (
                                <span className="text-sm font-black text-zinc-900">{formatMoney(preco)}</span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-zinc-600">
                              Ver detalhes
                              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {produtoSelecionado && (
        <ProdutoModal
          produto={produtoSelecionado}
          slug={slug}
          onClose={() => setProdutoSelecionado(null)}
          onAdicionar={(payload) => {
            onAdicionar(payload);
          }}
        />
      )}
    </>
  );
}
