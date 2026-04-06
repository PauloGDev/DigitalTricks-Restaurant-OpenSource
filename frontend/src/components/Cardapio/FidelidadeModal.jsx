import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Gift, Sparkles, Trophy, Award } from "lucide-react";

const levels = [
  { nome: "Bronze", min: 0, cor: "text-orange-500", bg: "bg-orange-500", border: "border-orange-200", bgSoft: "bg-orange-50" },
  { nome: "Prata", min: 5, cor: "text-zinc-500", bg: "bg-zinc-400", border: "border-zinc-200", bgSoft: "bg-zinc-50" },
  { nome: "Ouro", min: 10, cor: "text-amber-500", bg: "bg-amber-400", border: "border-amber-200", bgSoft: "bg-amber-50" },
  { nome: "Mestre", min: 15, cor: "text-purple-600", bg: "bg-purple-500", border: "border-purple-200", bgSoft: "bg-purple-50" },
];

function nivelAtual(pontos) {
  let nivel = levels[0];
  for (const l of levels) {
    if (pontos >= l.min) nivel = l;
  }
  return nivel;
}

function proximoNivel(pontos) {
  for (const l of levels) {
    if (pontos < l.min) return l;
  }
  return null;
}

function progresso(pontos) {
  const atual = nivelAtual(pontos);
  const prox = proximoNivel(pontos);
  if (!prox) return 100;
  const inicio = atual.min;
  const fim = prox.min;
  return Math.min(100, Math.round(((pontos - inicio) / (fim - inicio)) * 100));
}

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

export default function FidelidadeModal({ pontos, totalPedidos, totalGasto, onClose }) {
  const nivel = nivelAtual(pontos || 0);
  const prox = proximoNivel(pontos || 0);
  const pct = progresso(pontos || 0);

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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">Programa Fidelidade</h2>
                  <p className="text-xs text-zinc-500">
                    Ganhe 1 ponto a cada pedido
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
          <div className="overflow-y-auto px-4 pt-5 pb-24 max-h-[calc(90vh-80px)]">
            {/* Points display */}
            <div className={`rounded-3xl border ${nivel.border} ${nivel.bgSoft} p-6 text-center`}>
              <div className={`inline-flex items-center gap-2 rounded-full ${nivel.bg} px-4 py-1.5`}>
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-sm font-black text-white">{nivel.nome}</span>
              </div>
              <p className="mt-4 text-5xl font-black text-zinc-900">{pontos || 0}</p>
              <p className="text-sm text-zinc-500">ponto{pontos !== 1 ? "s" : ""} acumulados</p>

              {/* Progress bar */}
              {prox ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-600">Faltam {prox.min - (pontos || 0)} para {prox.nome}</span>
                    <span className="font-bold text-zinc-400">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${nivel.bg}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-purple-600">
                  <Trophy className="h-4 w-4" />
                  Nivel maximo atingido!
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <Gift className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-lg font-black text-zinc-900">{totalPedidos}</p>
                <p className="text-xs text-zinc-500">pedidos</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <Sparkles className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-lg font-black text-zinc-900">{formatBRL(totalGasto)}</p>
                <p className="text-xs text-zinc-500">total gasto</p>
              </div>
            </div>

            {/* Levels guide */}
            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-700">
                <Award className="h-4 w-4" />
                Tabela de niveis
              </h3>
              <div className="space-y-2">
                {levels.map((l) => {
                  const ativo = nivel === l;
                  return (
                    <div
                      key={l.nome}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                        ativo ? `${l.bgSoft} ${l.border} shadow-sm` : "border-zinc-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${l.bg}`} />
                        <span className={`text-sm font-bold ${ativo ? l.cor : "text-zinc-600"}`}>
                          {l.nome}
                        </span>
                        {ativo && (
                          <span className={`rounded-full ${l.bg} px-2 py-0.5 text-[10px] font-black text-white`}>
                            Atual
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {l.min === 0 ? "Inicio" : `${l.min} pedidos`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
