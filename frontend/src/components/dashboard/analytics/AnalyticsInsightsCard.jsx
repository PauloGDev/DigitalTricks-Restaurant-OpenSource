import {
  TrendingUp,
  Clock,
  CreditCard,
  Star,
  AlertTriangle,
  TicketPercent,
  Sparkles,
} from "lucide-react";

const ICONS = {
  pico: Clock,
  pagamento: CreditCard,
  produto: Star,
  alerta: AlertTriangle,
  cupom: TicketPercent,
  ticket: TrendingUp,
  positivo: Sparkles,
};

const BADGE_STYLES = {
  alerta: (d) =>
    d ? "border-red-500/20 bg-red-500/10 text-red-400" : "border-red-200 bg-red-50 text-red-700",
  positivo: (d) =>
    d ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700",
  cupom: (d) =>
    d ? "border-amber-500/20 bg-amber-500/10 text-amber-400" : "border-amber-200 bg-amber-50 text-amber-700",
  default: (d) =>
    d ? "border-white/10 bg-[#121212]" : "border-zinc-200 bg-white",
};

export default function AnalyticsInsightsCard({ insights = [], isDark = true }) {
  if (!insights.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((item, index) => {
        const Icon = ICONS[item.tipo] || TrendingUp;
        const badgeStyle = BADGE_STYLES[item.tipo] ?? BADGE_STYLES.default;

        return (
          <div
            key={index}
            className={`rounded-3xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
              item.tipo === "alerta" || item.tipo === "positivo" || item.tipo === "cupom"
                ? badgeStyle(isDark)
                : isDark
                ? "border-white/10 bg-[#121212]"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <Icon size={18} />
              </div>

              <div>
                <p className="text-sm font-bold">{item.titulo}</p>
                <p className="text-xs opacity-70">{item.descricao}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}