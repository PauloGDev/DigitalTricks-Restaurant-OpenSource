import { TrendingUp, Clock, CreditCard, Star } from "lucide-react";

const ICONS = {
  pico: Clock,
  pagamento: CreditCard,
  produto: Star,
};

export default function AnalyticsInsightsCard({ insights = [], isDark = true }) {
  if (!insights.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {insights.map((item, index) => {
        const Icon = ICONS[item.tipo] || TrendingUp;

        return (
          <div
            key={index}
            className={`rounded-3xl border p-4 ${
              isDark
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