import { motion } from "framer-motion";
import PageTitle from "../../context/PageTitle";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Truck,
  Package,
  Calendar,
  AlertCircle,
  Clock,
  UtensilsCrossed,
  Receipt,
  BadgeCheck,
  XCircle,
} from "lucide-react";
import { normalizeStatus } from "./useMeusPedidos";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.45, ease: "easeOut" },
  }),
};

const containerStagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

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
    label: "Em entrega",
  },
  ENTREGUE: {
    chip: "bg-green-100 text-green-900 border-green-200",
    icon: <BadgeCheck size={14} />,
    label: "Entregue",
  },
  CANCELADO: {
    chip: "bg-red-100 text-red-900 border-red-200",
    icon: <XCircle size={14} />,
    label: "Cancelado",
  },
};

const formatBRL = (v = 0) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const safeDate = (iso) => {
  // seu backend manda microsegundos (ex: .82856). Alguns browsers podem falhar.
  // aqui reduz pra milissegundos (3 dígitos) e evita Invalid Date.
  if (!iso) return null;
  const s = String(iso);
  const fixed = s.replace(/\.(\d{3})\d+/, ".$1"); // mantém só 3 casas
  const d = new Date(fixed);
  return isNaN(d.getTime()) ? null : d;
};

const isValidUrl = (url) => {
  try {
    new URL(url?.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

export default function PedidosView({
  pedidos = [],
  pedidosFiltrados = [],
  pedidosPaginados = [],
  loading = false,
  search = "",
  statusFilter = "TODOS",
  currentPage = 1,
  totalPages = 1,
  onSearchChange = () => {},
  onStatusChange = () => {},
  onPrevPage = () => {},
  onNextPage = () => {},
  onPay = () => {},
}) {
  return (
    <div className="pt-20 bg-gradient-to-b from-amber-50 via-orange-50 to-zinc-50 min-h-screen">
      <PageTitle title="Meus Pedidos | Restaurante" />

      <div className="px-4 sm:px-[5vw] md:px-[3vw] lg:px-[9vw] py-12 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-6">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3">
                <span className="h-11 w-11 rounded-2xl bg-red-600 text-white grid place-items-center shadow-[0_12px_28px_rgba(220,38,38,0.25)]">
                  <UtensilsCrossed size={22} />
                </span>
                Meus pedidos
              </h1>
              <p className="text-sm text-zinc-600 mt-2">
                Acompanhe seus pedidos, pagamentos e entrega.
              </p>
            </div>

            {/* contador (debug útil) */}
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm w-full sm:w-auto">
              <p className="text-xs font-extrabold text-zinc-500">Pedidos carregados</p>
              <p className="text-sm font-extrabold text-zinc-900">
                total: {pedidos.length} • filtrados: {pedidosFiltrados.length}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex items-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 flex-1 shadow-sm">
            <Search size={18} className="text-zinc-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar por pedido ou prato..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent w-full text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>

          <select
            className="rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-sm px-4 py-3 shadow-sm"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="TODOS">Todos os status</option>
            {Object.keys(statusUI).map((status) => (
              <option key={status} value={status}>
                {statusUI[status]?.label ?? status}
              </option>
            ))}
          </select>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              className="inline-block"
            >
              <Receipt className="w-8 h-8 text-red-600" />
            </motion.div>
            <p className="mt-3 text-zinc-600 text-sm">Carregando seus pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <Package className="w-10 h-10 text-zinc-400 mx-auto" />
            <p className="mt-3 text-zinc-800 font-extrabold">Você ainda não fez pedidos</p>
            <p className="text-zinc-600 text-sm mt-1">Quando você pedir, eles vão aparecer aqui.</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <p className="mt-3 text-zinc-800 font-extrabold">Nenhum pedido encontrado</p>
            <p className="text-zinc-600 text-sm mt-1">Tente outro termo ou altere o filtro.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerStagger}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {pedidosPaginados.map((pedido, i) => {
              const statusNorm = normalizeStatus(pedido.status);
              const ui = statusUI[statusNorm] || {
                chip: "bg-zinc-100 text-zinc-800 border-zinc-200",
                icon: <Clock size={14} />,
                label: statusNorm || pedido.status,
              };

              const podePagar = statusNorm === "PENDENTE" || statusNorm === "CANCELADO";
              const hasTrack = statusNorm === "ENVIADO" && isValidUrl(pedido.linkRastreio);

              const d = safeDate(pedido.data);

              return (
                <motion.div
                  key={pedido.id ?? `${i}`}
                  custom={i}
                  variants={fadeUp}
                  className="rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-zinc-100 bg-gradient-to-r from-white via-white to-orange-50/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-base font-extrabold text-zinc-900 flex items-center gap-2">
                          <Receipt size={18} className="text-red-600" />
                          Pedido #{pedido.id}
                        </h2>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {d ? d.toLocaleString("pt-BR") : "—"}
                        </p>
                      </div>

                      <span
                        className={[
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-full border",
                          ui.chip,
                        ].join(" ")}
                      >
                        {ui.icon}
                        {ui.label}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-xs font-extrabold text-zinc-500 mb-3">Itens do pedido</p>

                    <div className="divide-y divide-zinc-100">
                      {(pedido.itens || []).map((item, idx) => (
                        <div
                          key={`${pedido.id}-${idx}`}
                          className="py-3 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-extrabold text-zinc-900 truncate">
                              {item.nomeProduto}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {item.quantidade}x • {formatBRL(item.precoUnitario)}
                            </p>
                          </div>

                          <span className="text-sm font-extrabold text-zinc-900 shrink-0">
                            {formatBRL((item.quantidade || 0) * (item.precoUnitario || 0))}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-zinc-800">Total</span>
                      <span className="text-lg font-extrabold text-red-600">
                        {formatBRL(pedido.total)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                      {hasTrack ? (
                        <a
                          href={pedido.linkRastreio.startsWith("http") ? pedido.linkRastreio : `https://${pedido.linkRastreio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold transition"
                        >
                          <Truck className="w-4 h-4" />
                          Acompanhar entrega
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-sm text-zinc-600 bg-white border border-zinc-200 px-4 py-3 rounded-2xl">
                          <Truck size={16} className="text-zinc-400" />
                          <span>Aguardando atualização…</span>
                        </div>
                      )}

                      {podePagar ? (
                        <button
                          onClick={() => onPay(pedido)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold transition"
                        >
                          <CreditCard size={16} />
                          Pagar agora
                        </button>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-extrabold text-sm">
                          <BadgeCheck size={16} className="text-emerald-700" />
                          Sem ação necessária
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Paginação */}
        {!loading && pedidosFiltrados.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={onPrevPage}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-800 font-extrabold text-sm disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            <span className="text-sm font-semibold text-zinc-600">
              Página <span className="font-extrabold text-zinc-900">{currentPage}</span> de{" "}
              <span className="font-extrabold text-zinc-900">{totalPages}</span>
            </span>

            <button
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-zinc-800 font-extrabold text-sm disabled:opacity-40 hover:bg-zinc-50 transition"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}