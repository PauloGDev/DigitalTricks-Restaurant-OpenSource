import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock3,
  CookingPot,
  Bike,
  Package,
  X,
  ChefHat,
  ShieldAlert,
} from "lucide-react";

const STATUS_CONFIG = {
  RECEBIDO: {
    label: "Recebido",
    icon: CheckCircle,
    color: "text-amber-600",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-500/10",
  },
  EM_PREPARO: {
    label: "Em Preparo",
    icon: CookingPot,
    color: "text-orange-600",
    bgLight: "bg-orange-50",
    bgDark: "bg-orange-500/10",
  },
  PRONTO: {
    label: "Pronto",
    icon: ChefHat,
    color: "text-emerald-600",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-500/10",
  },
  SAIU_PARA_ENTREGA: {
    label: "Saiu para Entrega",
    icon: Bike,
    color: "text-blue-600",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-500/10",
  },
  ENTREGUE: {
    label: "Entregue",
    icon: Package,
    color: "text-zinc-700",
    bgLight: "bg-zinc-100",
    bgDark: "bg-white/10",
  },
};

const STATUS_LABELS = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  RETIRADO: "Retirado",
  AGUARDANDO_RETIRADA: "Aguardando Retirada",
  CANCELADO: "Cancelado",
};

function getStepStatus(status, isDark) {
  const cfg = STATUS_CONFIG[status];
  if (!cfg)
    return { color: "text-zinc-500", bgLight: "bg-zinc-100", bgDark: "bg-white/10" };
  return {
    color: cfg.color,
    bgLight: cfg.bgLight,
    bgDark: cfg.bgDark,
  };
}

function StatusStep({ status, isDark, isFinal, isCaminho }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.RECEBIDO;
  const Icon = cfg.icon || CheckCircle;
  const s = getStepStatus(status, isDark);

  return (
    <div className="flex items-center gap-3">
      {isCaminho && !isFinal && (
        <div
          className={`grid h-9 w-9 place-items-center rounded-2xl shadow-sm ${
            isDark ? "bg-white/5 text-white/50" : "bg-zinc-100 text-zinc-400"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      {isCaminho && isFinal && (
        <div
          className={`grid h-9 w-9 place-items-center rounded-2xl shadow-sm ${
            isDark ? `${cfg.bgDark} ${cfg.color}` : `${cfg.bgLight} ${s.color}`
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <span
        className={`text-sm font-bold ${
          isFinal
            ? isDark
              ? "text-white"
              : "text-zinc-900"
            : isDark
            ? "text-white/50"
            : "text-zinc-500"
        }`}
      >
        {STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}

export default function StatusChangeModal({
  pedido,
  novoStatus,
  onClose,
  onConfirm,
  loading,
  error,
  isDark: isDarkProp,
}) {
  const isDark = isDarkProp ?? (localStorage.getItem("navbar-theme-override") === "dark");

  const statusAtual = pedido?.status;
  const desejado = novoStatus;

  // Define o caminho de transição
  const caminho = useMemo(() => {
    if (!statusAtual || !desejado || statusAtual === desejado) return [];

    const ordem = [
      "AGUARDANDO_PAGAMENTO",
      "RECEBIDO",
      "EM_PREPARO",
      "PRONTO",
      "SAIU_PARA_ENTREGA",
      "ENTREGUE",
    ];

    const idxAtual = ordem.indexOf(statusAtual);
    const idxDesejado = ordem.indexOf(desejado);
    if (idxAtual < 0 || idxDesejado <= idxAtual) return [];

    return ordem.slice(idxAtual + 1, idxDesejado + 1);
  }, [statusAtual, desejado]);

  const pulaEtapas = caminho.length > 1;

  // Mensagem de alerta
  const alerta = useMemo(() => {
    if (statusAtual === "AGUARDANDO_PAGAMENTO" && desejado !== "RECEBIDO") {
      return "O pedido ainda não foi pago. Ao avançar, o status será alterado independentemente do pagamento.";
    }
    if (pulaEtapas) {
      return `O pedido passará por ${caminho.length - 1} etapas intermediárias automaticamente.`;
    }
    return null;
  }, [statusAtual, desejado, pulaEtapas, caminho]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/70" : "bg-black/50"}`}
          onClick={onClose}
        />

        <div className="absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            key="modal"
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border ${
              isDark
                ? "bg-[#171717] border-white/10"
                : "bg-white border-zinc-200"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`px-5 sm:px-6 py-4 border-b ${isDark ? "border-white/10" : "border-zinc-100"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-2xl grid place-items-center ${
                      alerta
                        ? "bg-amber-500/10 text-amber-400"
                        : isDark
                        ? "bg-blue-500/10 text-blue-300"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {alerta ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <ArrowRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                      Mover pedido #{pedido?.id}
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-white/45" : "text-zinc-500"}`}>
                      Confirmar mudança de status
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={`h-9 w-9 rounded-xl grid place-items-center transition ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-zinc-100 hover:bg-zinc-200"
                  }`}
                >
                  <X className={`w-4 h-4 ${isDark ? "text-white/60" : "text-zinc-500"}`} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 sm:px-6 py-5 space-y-5">
              {/* Status atual → desejado */}
              <div>
                <div
                  className={`text-[10px] font-extrabold uppercase tracking-[0.14em] mb-3 ${isDark ? "text-white/40" : "text-zinc-500"}`}
                >
                  Status
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <StatusStep status={statusAtual} isDark={isDark} isCaminho={false} isFinal={false} />
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                  <StatusStep status={desejado} isDark={isDark} isCaminho={false} isFinal={true} />
                </div>

                {/* Caminho intermediário */}
                {caminho.length > 1 && statusAtual !== "AGUARDANDO_PAGAMENTO" && (
                  <div className={`rounded-2xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50"}`}>
                    <div className="space-y-2">
                      <div className={`text-xs font-bold ${isDark ? "text-white/55" : "text-zinc-600"}`}>
                        Etapas intermediárias:
                      </div>
                      {caminho.map((s, i) => (
                        <div key={s} className="flex items-center gap-2 pl-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-white/30" : "bg-zinc-300"}`} />
                          <StatusStep
                            status={s}
                            isDark={isDark}
                            isCaminho={true}
                            isFinal={i === caminho.length - 1}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Alerta */}
              {alerta && (
                <div
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
                    isDark
                      ? "border-amber-500/20 bg-amber-500/10"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${isDark ? "text-amber-300" : "text-amber-600"}`}
                  />
                  <p className={`text-sm font-medium ${isDark ? "text-amber-100" : "text-amber-800"}`}>
                    {alerta}
                  </p>
                </div>
              )}

              {/* Info pedido */}
              <div className={`flex items-center gap-4 text-xs ${isDark ? "text-white/50" : "text-zinc-600"}`}>
                <span className="flex items-center gap-1">
                  <Clock3 className="w-3.5 h-3.5" />
                  Pedido {pedido?.id}
                </span>
                <span>{pedido?.nomeCompleto || "Cliente"}</span>
              </div>

              {/* Error */}
              {error && (
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className={`text-sm font-medium ${isDark ? "text-red-200" : "text-red-700"}`}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={`px-5 sm:px-6 py-4 border-t flex gap-3 justify-end ${isDark ? "border-white/10" : "border-zinc-100"}`}
            >
              <button
                onClick={onClose}
                disabled={loading}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
                  isDark
                    ? "bg-white/5 text-white/70 hover:bg-white/10"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Cancelar
              </button>

              <button
                onClick={() => onConfirm(desejado)}
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_12px_28px_rgba(229,37,42,0.25)] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Movendo...
                  </span>
                ) : (
                  `Mover para ${STATUS_LABELS[desejado] || desejado}`
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
