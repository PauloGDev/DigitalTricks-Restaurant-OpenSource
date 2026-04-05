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

const ICON_STYLES = {
  alerta: "bg-red-500/10 text-red-500",
  positivo: "bg-emerald-500/10 text-emerald-500",
  cupom: "bg-amber-500/10 text-amber-500",
  pico: "bg-blue-500/10 text-blue-500",
  pagamento: "bg-violet-500/10 text-violet-500",
  produto: "bg-orange-500/10 text-orange-500",
  ticket: "bg-teal-500/10 text-teal-500",
};

export default function AnalyticsInsightsCard({ insights = [], isDark = true }) {
  if (!insights.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((item, index) => {
        const Icon = ICONS[item.tipo] || TrendingUp;
        const badgeStyle = BADGE_STYLES[item.tipo] ?? BADGE_STYLES.default;
        const iconStyle = ICON_STYLES[item.tipo] || ICON_STYLES.pico;

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
              <div className={`p-2 rounded-xl ${iconStyle}`}>
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