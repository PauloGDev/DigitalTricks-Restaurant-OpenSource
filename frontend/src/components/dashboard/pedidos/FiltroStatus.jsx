import { motion } from "framer-motion";
import { Filter } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const LABELS = {
  "": "Todos",
  PENDENTE: "Pendente",
  PAGO: "Pago",
  ENVIADO: "Enviado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

// Cores no padrão “restaurante” (fundo branco + destaque vermelho)
const STYLES = {
  "": {
    active: "bg-zinc-900 text-white ring-zinc-900",
    inactive: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50",
  },
  PENDENTE: {
    active: "bg-amber-500 text-black ring-amber-500",
    inactive:
      "bg-white text-amber-700 ring-amber-200 hover:bg-amber-50 hover:ring-amber-300",
  },
  PAGO: {
    active: "bg-emerald-600 text-white ring-emerald-600",
    inactive:
      "bg-white text-emerald-700 ring-emerald-200 hover:bg-emerald-50 hover:ring-emerald-300",
  },
  ENVIADO: {
    active: "bg-blue-600 text-white ring-blue-600",
    inactive:
      "bg-white text-blue-700 ring-blue-200 hover:bg-blue-50 hover:ring-blue-300",
  },
  CONCLUIDO: {
    active: "bg-zinc-900 text-white ring-zinc-900",
    inactive: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50",
  },
  CANCELADO: {
    active: "bg-red-600 text-white ring-red-600",
    inactive:
      "bg-white text-red-700 ring-red-200 hover:bg-red-50 hover:ring-red-300",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

const FiltroStatus = ({ status, setStatus, setPage, setLoading }) => {
  const statuses = ["", "PENDENTE", "PAGO", "ENVIADO", "CONCLUIDO", "CANCELADO"];

  const onPick = (s) => {
    if (s === status) return; // evita setState desnecessário
    setStatus(s);
    setPage(0);
    setLoading?.(true); // mantém seu comportamento, mas não quebra se não passar
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={fadeUp}
      className="mb-4"
    >
      {/* Container no estilo do resto (branco + borda) */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-3 sm:p-4">
        <div className="flex items-center gap-2 text-zinc-700 mb-3">
          <span className="h-9 w-9 rounded-2xl bg-red-600 text-white grid place-items-center shadow-[0_10px_22px_rgba(220,38,38,0.16)]">
            <Filter className="w-4 h-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-zinc-900">Filtrar status</p>
            <p className="text-xs text-zinc-500">Clique para refinar a lista.</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => {
            const isActive = status === s;
            const palette = STYLES[s] || STYLES[""];
            return (
              <button
                key={s}
                type="button"
                onClick={() => onPick(s)}
                aria-pressed={isActive}
                className={cx(
                  "h-10 px-4 rounded-2xl",
                  "text-sm font-extrabold",
                  "ring-1 ring-inset transition",
                  "focus:outline-none focus:ring-2 focus:ring-red-200",
                  isActive ? palette.active : palette.inactive
                )}
              >
                {LABELS[s] ?? s}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default FiltroStatus;