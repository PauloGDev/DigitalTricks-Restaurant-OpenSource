import { BarChart3 } from "lucide-react";

export default function AnalyticsEmptyState({ isDark = true }) {
  return (
    <div
      className={[
        "rounded-3xl border p-8 text-center backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-[#121212]/95"
          : "border-zinc-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
          isDark ? "bg-white/5 text-white/55" : "bg-zinc-100 text-zinc-500",
        ].join(" ")}
      >
        <BarChart3 className="h-6 w-6" />
      </div>

      <h3
        className={`mt-4 text-lg font-extrabold ${
          isDark ? "text-white" : "text-zinc-900"
        }`}
      >
        Ainda não há métricas suficientes
      </h3>

      <p className={`mt-2 text-sm ${isDark ? "text-white/50" : "text-zinc-600"}`}>
        Assim que houver pedidos registrados, os gráficos e indicadores serão exibidos aqui.
      </p>
    </div>
  );
}