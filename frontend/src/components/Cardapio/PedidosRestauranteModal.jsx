import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ReceiptText,
  Clock,
  Calendar,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  ChevronDown,
  Package,
} from "lucide-react";
import axios from "axios";

const statusUI = {
  PENDENTE: {
    chip: "bg-amber-100 text-amber-900 border-amber-200",
    icon: <Clock size={14} />,
    label: "Pendente",
  },
  PAGO: {
    chip: "bg-emerald-100 text-emerald-900 border-emerald-200",
    icon: <CreditCard size={14} />,
    label: "Pago",
  },
  ENVIADO: {
    chip: "bg-sky-100 text-sky-900 border-sky-200",
    icon: <Truck size={14} />,
    label: "Saiu para entrega",
  },
  ENTREGUE: {
    chip: "bg-green-100 text-green-900 border-green-200",
    icon: <CheckCircle2 size={14} />,
    label: "Entregue",
  },
  CANCELADO: {
    chip: "bg-red-100 text-red-900 border-red-200",
    icon: <XCircle size={14} />,
    label: "Cancelado",
  },
};

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(v || 0)
  );

const safeDate = (iso) => {
  if (!iso) return null;
  const s = String(iso).replace(/\.(\d{3})\d+/, ".$1");
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

export default function PedidosRestauranteModal({ slug, onClose }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [semToken, setSemToken] = useState(false);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setSemToken(true);
      return;
    }

    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const apiUrl = base.endsWith("/api") ? base : `${base}/api`;
    const url = `${apiUrl}/restaurantes/${slug}/pedidos/me`;
    console.log("[PedidosRestauranteModal] slug:", slug, "| url:", url);

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("[PedidosRestauranteModal] response:", res.status, res.data);
        setPedidos(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          // não autenticado como cliente autorizado — mostra vazio sem erro
          setPedidos([]);
        } else {
          console.error(
            "[PedidosRestauranteModal] erro:",
            status,
            err.response?.data || err.message
          );
          setErro(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleExpand = (id) =>
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <ReceiptText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">
                    Meus Pedidos
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {loading
                      ? "Carregando..."
                      : `${pedidos.length} pedido${pedidos.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto px-4 pt-4 pb-24 max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9,
                    ease: "linear",
                  }}
                >
                  <Package className="h-8 w-8 text-zinc-300" />
                </motion.div>
                <p className="mt-3 text-sm">Buscando seus pedidos...</p>
              </div>
            ) : semToken ? (
              <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center">
                <ReceiptText className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
                <p className="font-bold text-zinc-700">Faca login para ver seus pedidos</p>
              </div>
            ) : erro ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
                <XCircle className="mx-auto mb-3 h-10 w-10 text-amber-400" />
                <p className="font-bold text-amber-800">
                  Nao foi possivel carregar os pedidos
                </p>
                <p className="mt-1 text-sm text-amber-600">
                  Verifique sua conexao e tente novamente
                </p>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center">
                <ReceiptText className="mx-auto mb-3 h-10 w-10 text-zinc-300" />
                <p className="font-bold text-zinc-700">Nenhum pedido ainda</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Faca seu primeiro pedido neste restaurante!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((pedido) => {
                  const status = statusUI[pedido.status] || {
                    chip: "bg-zinc-100 text-zinc-800 border-zinc-200",
                    icon: <Clock size={14} />,
                    label: pedido.status,
                  };
                  const data = safeDate(pedido.data);
                  const expandido = expandidos[pedido.id];

                  return (
                    <div
                      key={pedido.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                    >
                      {/* Order header - always visible, click to expand */}
                      <button
                        onClick={() => toggleExpand(pedido.id)}
                        className="w-full px-4 py-3 text-left transition hover:bg-zinc-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                              <span className="text-xs font-black">
                                #{pedido.id}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <Calendar size={12} />
                                {data
                                  ? data.toLocaleDateString("pt-BR")
                                  : "—"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${status.chip}`}
                            >
                              {status.icon}
                              {status.label}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-zinc-400 transition ${expandido ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>

                        {/* Summary line */}
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-zinc-500">
                            {(pedido.itens || []).length}{" "}
                            {(pedido.itens || []).length === 1
                              ? "item"
                              : "itens"}
                          </span>
                          <span className="font-black text-zinc-900">
                            {formatBRL(pedido.total)}
                          </span>
                        </div>
                      </button>

                      {/* Expanded items */}
                      {expandido && (
                        <div className="border-t border-zinc-100 px-4 py-3">
                          {(pedido.itens || []).map((item, idx) => (
                            <div
                              key={`${pedido.id}-${idx}`}
                              className="flex items-start justify-between py-2 text-sm"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="truncate font-semibold text-zinc-900">
                                  {item.nomeProduto}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {item.quantidade}x &middot;{" "}
                                  {formatBRL(item.precoUnitario)}
                                </p>
                              </div>
                              <span className="shrink-0 font-semibold text-zinc-700">
                                {formatBRL(
                                  (item.quantidade || 0) *
                                    (item.precoUnitario || 0)
                                )}
                              </span>
                            </div>
                          ))}
                          <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-800">
                              Total
                            </span>
                            <span className="text-base font-black text-emerald-600">
                              {formatBRL(pedido.total)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
