import { useMemo, useState } from "react";
import { useLocation, Link, useNavigate, matchPath } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCarrinho } from "./CarrinhoContext";
import {
  ShoppingCart,
  Trash2,
  X,
  PackageSearch,
  ChevronRight,
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

const formatBRL = (v = 0) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const overlay = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawer = {
  hidden: { x: "100%" },
  show: { x: 0, transition: { type: "tween", duration: 0.28 } },
  exit: { x: "100%", transition: { type: "tween", duration: 0.22 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const CarrinhoPopup = () => {
  const { carrinho, removerDoCarrinho, restauranteSlug } = useCarrinho();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [aberto, setAberto] = useState(false);

  const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];
  const qtd = itens.reduce(
    (acc, item) => acc + (Number(item?.quantidade) || 0),
    0
  );

  const total = useMemo(() => {
    return itens.reduce((sum, item) => {
      const subtotal =
        Number(item?.subtotal) ||
        (Number(item?.precoUnitario) || 0) * (Number(item?.quantidade) || 0);

      return sum + subtotal;
    }, 0);
  }, [itens]);

  const rotaCarrinho = restauranteSlug
    ? `/restaurante/${restauranteSlug}/carrinho`
    : "/";

  const rotaCardapio = restauranteSlug
    ? `/restaurante/${restauranteSlug}/cardapio`
    : "/";

  const estaNaTelaCarrinho =
  Boolean(matchPath("/restaurante/:slug/carrinho", location.pathname)) ||
  Boolean(matchPath("/restaurantes/:slug/carrinho", location.pathname));

const hidden =
  location.pathname === "/checkout" ||
  location.pathname === "/carrinho" ||
  estaNaTelaCarrinho;

  const handleRemover = async (item) => {
    try {
      const itemId = item?.id ?? item?.itemId ?? item?.carrinhoItemId;

      if (!itemId) {
        showNotification("Não foi possível identificar o item do carrinho.", "error");
        return;
      }

      await removerDoCarrinho(itemId, restauranteSlug);
      showNotification("Item removido do carrinho.", "error");
    } catch (e) {
      showNotification("Erro ao remover item do carrinho.", "error");
    }
  };

  const irParaCarrinho = () => {
    setAberto(false);
    if (restauranteSlug) {
      navigate(`/restaurante/${restauranteSlug}/carrinho`);
    }
  };

  if (hidden) return null;

  return (
    <>
      {/* MOBILE: barra de finalizar pedido */}
      {qtd > 0 && restauranteSlug && (
        <div className="md:hidden fixed inset-x-0 bottom-16 z-40 px-3 pb-3">
          <button
            onClick={irParaCarrinho}
            className="w-full rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-[0_14px_30px_rgba(220,38,38,0.20)] transition px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-semibold text-white/80">
                  {qtd} {qtd === 1 ? "item" : "itens"} no carrinho
                </p>
                <p className="text-sm font-extrabold truncate">
                  Finalizar pedido
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-extrabold">{formatBRL(total)}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* DESKTOP: botão flutuante */}
      <motion.button
        onClick={() => setAberto(true)}
        whileTap={{ scale: 0.92 }}
        className={[
          "hidden md:grid fixed bottom-6 right-6 z-50",
          "h-14 w-14 rounded-full",
          "bg-red-600 hover:bg-red-500 text-white",
          "shadow-[0_18px_40px_rgba(220,38,38,0.28)]",
          "place-items-center transition",
        ].join(" ")}
        aria-label="Abrir carrinho"
      >
        <ShoppingCart size={22} />
        {qtd > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-xs font-extrabold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
            {qtd}
          </span>
        )}
      </motion.button>

      {/* Drawer desktop */}
      <AnimatePresence>
        {aberto && (
          <>
            <motion.div
              variants={overlay}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-0 bg-black/55 backdrop-blur-[2px] z-40 hidden md:block"
              onClick={() => setAberto(false)}
            />

            <motion.aside
              variants={drawer}
              initial="hidden"
              animate="show"
              exit="exit"
              className={[
                "hidden md:flex fixed top-0 right-0 z-50 h-full w-[92vw] max-w-sm",
                "bg-white border-l border-zinc-200 shadow-2xl",
                "flex-col overflow-hidden",
              ].join(" ")}
              onClick={(e) => e.stopPropagation()}
              aria-label="Painel do carrinho"
            >
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-zinc-500 uppercase tracking-wide">
                      Seu pedido
                    </p>
                    <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                      <span className="h-9 w-9 rounded-2xl bg-red-600 text-white grid place-items-center shadow-[0_12px_28px_rgba(220,38,38,0.18)]">
                        <ShoppingCart className="w-5 h-5" />
                      </span>
                      Carrinho
                    </h2>
                  </div>

                  <button
                    onClick={() => setAberto(false)}
                    className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
                    aria-label="Fechar carrinho"
                  >
                    <X className="w-5 h-5 text-zinc-800" />
                  </button>
                </div>

                {qtd > 0 && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-600">
                      {qtd} item(ns)
                    </span>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                      Total: {formatBRL(total)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {itens.length > 0 ? (
                  itens.map((item, index) => (
                    <motion.div
                      key={item?.id ?? `${item?.produtoId}-${index}`}
                      variants={itemAnim}
                      initial="hidden"
                      animate="show"
                      className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imagemUrl}
                          alt={item.nomeProduto}
                          className="w-14 h-14 object-cover rounded-2xl border border-zinc-200 bg-zinc-50"
                          draggable={false}
                          loading="lazy"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-zinc-900 leading-snug line-clamp-2">
                            {item.nomeProduto}
                            {item.variacaoNome ? ` • ${item.variacaoNome}` : ""}
                          </p>

                          <p className="text-xs text-zinc-500 mt-1">
                            {item.quantidade}x • {formatBRL(item.precoUnitario)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-extrabold text-zinc-900">
                          {formatBRL(
                            Number(item?.subtotal) ||
                              (Number(item?.precoUnitario) || 0) *
                                (Number(item?.quantidade) || 0)
                          )}
                        </span>

                        <button
                          onClick={() => handleRemover(item)}
                          className="h-9 w-9 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
                          aria-label="Remover item"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 text-center">
                    <PackageSearch className="w-12 h-12 text-red-600 mx-auto" />
                    <p className="mt-3 text-zinc-900 font-extrabold text-lg">
                      Seu carrinho está vazio
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      Escolha itens do cardápio e monte seu pedido.
                    </p>

                    <Link
                      to={rotaCardapio}
                      onClick={() => setAberto(false)}
                      className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold transition shadow-[0_14px_30px_rgba(220,38,38,0.18)] w-full"
                    >
                      Ver cardápio
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {qtd > 0 && (
                <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-zinc-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-extrabold text-zinc-800">
                      Total
                    </span>
                    <span className="text-lg font-extrabold text-red-600">
                      {formatBRL(total)}
                    </span>
                  </div>

                  <Link
                    to={rotaCarrinho}
                    onClick={() => setAberto(false)}
                    className="block text-center w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-2xl shadow-[0_14px_30px_rgba(220,38,38,0.20)] transition"
                  >
                    Finalizar pedido
                  </Link>

                  <p className="mt-2 text-xs text-zinc-500 text-center">
                    Você revisa tudo na próxima etapa.
                  </p>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CarrinhoPopup;