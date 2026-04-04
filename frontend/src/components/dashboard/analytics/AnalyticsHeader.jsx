import { BarChart3, RefreshCw } from "lucide-react";

export default function AnalyticsHeader({
  loading,
  erro,
  ultimaAtualizacao,
  onRefresh,
  empresaId,
  isDark = true,
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-5 backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-[#121212]/95"
          : "border-zinc-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_12px_28px_rgba(229,37,42,0.22)]">
            <BarChart3 className="h-5 w-5" />
          </span>

          <div>
            <h2
              className={`text-xl font-extrabold sm:text-2xl ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              Analytics
            </h2>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-zinc-600"}`}>
              Acompanhe vendas, pedidos, clientes, horários, pagamentos e desempenho geral.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ultimaAtualizacao && !loading && !erro && (
            <span
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                isDark
                  ? "border-white/10 bg-white/5 text-white/60"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600",
              ].join(" ")}
            >
              Atualizado às{" "}
              {ultimaAtualizacao.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || !empresaId}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
              isDark
                ? "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>
    </div>
  );
}