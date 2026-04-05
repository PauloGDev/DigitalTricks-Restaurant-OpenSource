import {
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  Wallet,
  Users,
  TicketPercent,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "./AnalyticsUtils";

function SummaryCard({ title, value, hint, icon: Icon, loading, isDark = true }) {
  return (
    <div
      className={[
        "rounded-3xl border p-5 transition",
        isDark
          ? "border-white/10 bg-[#121212]/95 hover:bg-[#171717]"
          : "border-zinc-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-white/45" : "text-zinc-500"}`}>
            {title}
          </p>

          {loading ? (
            <div
              className={`mt-3 h-8 w-28 animate-pulse rounded-xl ${
                isDark ? "bg-white/10" : "bg-zinc-200"
              }`}
            />
          ) : (
            <p className={`mt-2 text-2xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
              {value}
            </p>
          )}

          <p className={`mt-2 text-xs ${isDark ? "text-white/35" : "text-zinc-500"}`}>
            {hint}
          </p>
        </div>

        <span
          className={[
            "grid h-11 w-11 place-items-center rounded-2xl",
            isDark ? "bg-white/5 text-[#ff6b6f]" : "bg-zinc-100 text-red-600",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

// Helper para crescimento com sinal e cor
function GrowthIndicator({ valor, percentual, loading, isDark = true }) {
  const pct = Number(percentual || 0);
  const isNeutral = pct === 0;
  const isPositive = pct > 0;
  const color = isNeutral
    ? isDark ? "text-white/45" : "text-zinc-500"
    : isPositive
    ? "text-emerald-500"
    : "text-red-500";
  const Arrow = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const prefix = isPositive ? "+" : "";

  return (
    <div
      className={[
        "rounded-3xl border p-5 col-span-full 2xl:col-span-2 transition",
        isDark ? "border-white/10 bg-[#121212]/95" : "border-zinc-200 bg-white shadow-sm",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${isDark ? "text-white/45" : "text-zinc-500"}`}>
            Comparação com período anterior
          </p>
          {loading ? (
            <div className={`mt-2 h-7 w-36 animate-pulse rounded-xl ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />
          ) : (
            <div className="mt-2 flex items-end gap-3">
              <span className={`text-2xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                {prefix}{pct.toFixed(1)}%
              </span>
              <span className={`text-sm font-bold ${color}`}>
                <Arrow className="inline w-4 h-4" />
                {formatCurrency(valor)}
              </span>
            </div>
          )}
          <p className={`mt-2 text-xs ${isDark ? "text-white/35" : "text-zinc-500"}`}>
            {isNeutral ? "Sem variação" : isPositive ? "Crescimento em relação a 7 dias atrás" : "Queda em relação a 7 dias atrás"}
          </p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${color} ${isDark ? "bg-white/5" : "bg-zinc-100"}`}>
          <Arrow className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export default function AnalyticsSummaryGrid({ dados, loading, isDark = true }) {
  const resumo = dados?.resumo || {};
  const retencao = dados?.retencao || {};
  const cupons = dados?.cupons || {};
  const comparacao = dados?.comparacao || {};

  const totalClientes = Number(
    retencao?.totalClientes ?? resumo?.totalClientes ?? resumo?.clientes ?? 0
  );
  const clientesRecorrentes = Number(retencao?.clientesRecorrentes || 0);

  const taxaRetencao =
    totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;

  const cards = [
    {
      title: "Faturamento total",
      value: formatCurrency(resumo?.faturamentoTotal ?? 0),
      hint: "Total vendido no período",
      icon: Wallet,
    },
    {
      title: "Pedidos",
      value: formatNumber(resumo?.totalPedidos || 0),
      hint: "Quantidade total de pedidos",
      icon: ShoppingCart,
    },
    {
      title: "Ticket médio",
      value: formatCurrency(resumo?.ticketMedio || 0),
      hint: "Média por pedido",
      icon: TrendingUp,
    },
    {
      title: "Clientes únicos",
      value: formatNumber(totalClientes),
      hint: "Clientes distintos no período",
      icon: Users,
    },
    {
      title: "Retenção",
      value: clientesRecorrentes > 0
        ? `${formatNumber(clientesRecorrentes)} (${taxaRetencao.toFixed(0)}%)`
        : formatPercent(0),
      hint: "Clientes que retornaram",
      icon: Users,
    },
    {
      title: "Desconto em cupons",
      value: formatCurrency(cupons?.descontoTotal || 0),
      hint: `${formatNumber(cupons?.pedidosComCupom || 0)} pedidos com desconto`,
      icon: TicketPercent,
    },
    {
      title: "Cancelamentos",
      value: formatNumber(resumo?.cancelados || 0),
      hint: resumo?.faturamentoPerdido > 0
        ? `Perda de ${formatCurrency(resumo.faturamentoPerdido)}`
        : "Pedidos cancelados",
      icon: AlertCircle,
    },
    {
      title: "Tempo médio preparo",
      value: resumo?.tempoMedioPreparo != null ? `${resumo.tempoMedioPreparo} min` : "—",
      hint: resumo?.tempoMedioEntrega != null ? `Entrega: ${resumo.tempoMedioEntrega} min` : "Do preparo ao pronto",
      icon: Clock3,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <SummaryCard key={card.title} loading={loading} isDark={isDark} {...card} />
      ))}

      <div className="col-span-full">
        <GrowthIndicator
          valor={comparacao?.crescimentoValor || 0}
          percentual={comparacao?.crescimentoPercentual || 0}
          loading={loading}
          isDark={isDark}
        />
      </div>
    </div>
  );
}