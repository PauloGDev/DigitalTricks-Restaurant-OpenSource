import { AlertCircle } from "lucide-react";

export default function AnalyticsErrorState({ message, isDark = true }) {
  if (!message) return null;

  return (
    <div
      className={[
        "rounded-3xl border p-5",
        isDark
          ? "border-red-500/20 bg-red-500/10"
          : "border-red-200 bg-red-50 shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 rounded-2xl p-2",
            isDark ? "bg-white/5 text-red-300" : "bg-white text-red-600",
          ].join(" ")}
        >
          <AlertCircle className="h-5 w-5" />
        </span>

        <div>
          <p className={`font-extrabold ${isDark ? "text-red-300" : "text-red-700"}`}>
            Erro ao carregar métricas
          </p>
          <p className={`mt-1 text-sm ${isDark ? "text-red-200/80" : "text-red-600"}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}