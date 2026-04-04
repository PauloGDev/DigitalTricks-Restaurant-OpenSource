import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  Users,
  Repeat,
  TicketPercent,
  Truck,
  CreditCard,
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

export default function AnalyticsSummaryGrid({ dados, loading, isDark = true }) {
  const resumo = dados?.resumo || {};
  const retencao = dados?.retencao || {};
  const cupons = dados?.cupons || {};
  const comparacao = dados?.comparacao || {};
  const entregas = dados?.entregas || {};

  const totalClientes = Number(
    retencao?.totalClientes ?? resumo?.totalClientes ?? resumo?.clientes ?? 0
  );
  const clientesRecorrentes = Number(retencao?.clientesRecorrentes || 0);

  const taxaRetencao =
    totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;

  const totalLogistico =
    Number(entregas?.DELIVERY || 0) + Number(entregas?.RETIRADA || 0);

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
      title: "Clientes",
      value: formatNumber(totalClientes),
      hint: "Clientes únicos no período",
      icon: Users,
    },
    {
      title: "Clientes recorrentes",
      value: formatNumber(clientesRecorrentes),
      hint: "Clientes que compraram mais de uma vez",
      icon: Repeat,
    },
    {
      title: "Retenção",
      value: formatPercent(taxaRetencao),
      hint: "Percentual de recompra",
      icon: Repeat,
    },
    {
      title: "Pedidos com cupom",
      value: formatNumber(cupons?.pedidosComCupom || 0),
      hint: "Volume de pedidos com desconto",
      icon: TicketPercent,
    },
    {
      title: "Desconto em cupons",
      value: formatCurrency(cupons?.descontoTotal || 0),
      hint: "Valor total concedido em descontos",
      icon: CreditCard,
    },
    {
      title: "Cancelamentos",
      value: formatNumber(resumo?.cancelados || 0),
      hint: "Pedidos cancelados",
      icon: AlertCircle,
    },
    {
      title: "Faturamento perdido",
      value: formatCurrency(resumo?.faturamentoPerdido || 0),
      hint: "Impacto dos cancelamentos",
      icon: TrendingUp,
    },
    {
      title: "Tempo médio de preparo",
      value: resumo?.tempoMedioPreparo != null ? `${resumo.tempoMedioPreparo} min` : "—",
      hint: "Tempo operacional de preparo",
      icon: Clock3,
    },
    {
      title: "Tempo médio de entrega",
      value: resumo?.tempoMedioEntrega != null ? `${resumo.tempoMedioEntrega} min` : "—",
      hint: "Tempo operacional de entrega",
      icon: Truck,
    },
    {
      title: "Faturamento atual",
      value: formatCurrency(comparacao?.faturamentoAtual || 0),
      hint: "Período atual",
      icon: Wallet,
    },
    {
      title: "Período anterior",
      value: formatCurrency(comparacao?.faturamentoAnterior || 0),
      hint: "Base de comparação",
      icon: Wallet,
    },
    {
      title: "Crescimento",
      value: formatCurrency(comparacao?.crescimentoValor || 0),
      hint: "Diferença absoluta entre períodos",
      icon: TrendingUp,
    },
    {
      title: "Entrega / retirada",
      value: formatNumber(totalLogistico),
      hint: "Total de pedidos logísticos",
      icon: Truck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {cards.map((card) => (
        <SummaryCard key={card.title} loading={loading} isDark={isDark} {...card} />
      ))}
    </div>
  );
}