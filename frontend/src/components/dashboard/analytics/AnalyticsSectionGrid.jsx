import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  YAxis,
} from "recharts";
import AnalyticsChartCard from "./AnalyticsChartCard";
import {
  formatCurrency,
  formatDateLabel,
  formatNumber,
  formatPercent,
  mapPagamentosAnalytics,
  mapEntregasAnalytics,
  mapPedidosHora,
  mapTopProdutos,
} from "./AnalyticsUtils";

const PIE_COLORS = ["#dc2626", "#f97316", "#2563eb", "#16a34a", "#7c3aed", "#0891b2"];

function StatBox({ label, value, isDark = true }) {
  return (
    <div
      className={[
        "rounded-2xl border p-4",
        isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50",
      ].join(" ")}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          isDark ? "text-white/45" : "text-zinc-500"
        }`}
      >
        {label}
      </p>
      <p className={`mt-2 text-xl font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
        {value}
      </p>
    </div>
  );
}

export default function AnalyticsSectionGrid({ dados, loading, isDark = true }) {
  const pagamentosChart = mapPagamentosAnalytics(dados?.pagamentos);
  const entregasChart = mapEntregasAnalytics(dados?.entregas);
  const horariosChart = mapPedidosHora(dados?.pedidosPorHora);
  const topProdutosChart = mapTopProdutos(dados?.topProdutos);

  const totalClientes = Number(
    dados?.retencao?.totalClientes ??
      dados?.resumo?.totalClientes ??
      dados?.resumo?.clientes ??
      0
  );
  const clientesRecorrentes = Number(dados?.retencao?.clientesRecorrentes || 0);
  const taxaRetencao =
    totalClientes > 0 ? (clientesRecorrentes / totalClientes) * 100 : 0;

  const axisStroke = isDark ? "#3f3f46" : "#e4e4e7";
  const tickColor = isDark ? "#a1a1aa" : "#52525b";
  const tooltipStyle = {
    backgroundColor: isDark ? "#18181b" : "#ffffff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e4e4e7",
    borderRadius: 16,
    color: isDark ? "#fff" : "#18181b",
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <AnalyticsChartCard
        title="Faturamento por dia"
        subtitle="Visualize a evolução do faturamento diário."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados?.faturamento || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisStroke} />
            <XAxis dataKey="data" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [formatCurrency(value), "Faturamento"]}
              labelFormatter={(label) => `Data: ${formatDateLabel(label)}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="valor"
              name="Faturamento"
              stroke="#dc2626"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Pedidos por dia"
        subtitle="Acompanhe o volume de pedidos ao longo do tempo."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados?.pedidos || []}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisStroke} />
            <XAxis dataKey="data" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [formatNumber(value), "Pedidos"]}
              labelFormatter={(label) => `Data: ${formatDateLabel(label)}`}
            />
            <Legend />
            <Bar dataKey="quantidade" name="Pedidos" fill="#dc2626" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Pedidos por hora"
        subtitle="Descubra os horários de maior movimento."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={horariosChart}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisStroke} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis tick={{ fontSize: 12, fill: tickColor }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatNumber(value), "Pedidos"]} />
            <Legend />
            <Bar dataKey="quantidade" name="Pedidos por hora" fill="#2563eb" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Top produtos"
        subtitle="Produtos com maior volume e faturamento."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topProdutosChart} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={axisStroke} />
            <XAxis type="number" tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 12, fill: tickColor }}
              width={220}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, key) => {
                if (key === "Quantidade vendida") return [formatNumber(value), "Quantidade"];
                if (key === "Faturamento") return [formatCurrency(value), "Faturamento"];
                return [value, key];
              }}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nome || "Produto"}
            />
            <Legend />
            <Bar dataKey="quantidade" name="Quantidade vendida" fill="#16a34a" radius={[0, 10, 10, 0]} />
            <Bar dataKey="faturamento" name="Faturamento" fill="#f97316" radius={[0, 10, 10, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Métodos de pagamento"
        subtitle="Distribuição por tipo de pagamento."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pagamentosChart}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
            >
              {pagamentosChart.map((entry, index) => (
                <Cell key={entry.nome} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatNumber(value), "Pedidos"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Tipo de entrega"
        subtitle="Compare delivery e retirada."
        loading={loading}
        isDark={isDark}
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={entregasChart}
              dataKey="valor"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ nome, percent }) => `${nome} (${(percent * 100).toFixed(0)}%)`}
            >
              {entregasChart.map((entry, index) => (
                <Cell key={entry.nome} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatNumber(value), "Pedidos"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Cupons"
        subtitle="Impacto de descontos e uso de cupons."
        loading={loading}
        isDark={isDark}
      >
        <div className="grid h-[300px] grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Pedidos com cupom" value={formatNumber(dados?.cupons?.pedidosComCupom || 0)} isDark={isDark} />
          <StatBox label="Faturamento com cupom" value={formatCurrency(dados?.cupons?.faturamentoComCupom || 0)} isDark={isDark} />
          <StatBox label="Desconto total" value={formatCurrency(dados?.cupons?.descontoTotal || 0)} isDark={isDark} />
        </div>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Retenção"
        subtitle="Clientes recorrentes e taxa de recompra."
        loading={loading}
        isDark={isDark}
      >
        <div className="grid h-[300px] grid-cols-1 gap-4 sm:grid-cols-3">
          <StatBox label="Clientes únicos" value={formatNumber(totalClientes)} isDark={isDark} />
          <StatBox label="Recorrentes" value={formatNumber(clientesRecorrentes)} isDark={isDark} />
          <StatBox label="Taxa de retenção" value={formatPercent(taxaRetencao)} isDark={isDark} />
        </div>
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Comparação de períodos"
        subtitle="Desempenho atual versus período anterior."
        loading={loading}
        isDark={isDark}
      >
        <div className="grid h-[300px] grid-cols-1 gap-4 sm:grid-cols-4">
          <StatBox label="Atual" value={formatCurrency(dados?.comparacao?.faturamentoAtual || 0)} isDark={isDark} />
          <StatBox label="Anterior" value={formatCurrency(dados?.comparacao?.faturamentoAnterior || 0)} isDark={isDark} />
          <StatBox label="Crescimento" value={formatCurrency(dados?.comparacao?.crescimentoValor || 0)} isDark={isDark} />
          <StatBox label="% Crescimento" value={formatPercent(dados?.comparacao?.crescimentoPercentual || 0)} isDark={isDark} />
        </div>
      </AnalyticsChartCard>
    </div>
  );
}