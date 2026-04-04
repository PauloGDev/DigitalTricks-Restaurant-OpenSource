import { getTipoPagamentoLabel } from "./AnalyticsUtils";

export const buildAnalyticsInsights = (dados = {}) => {
  const insights = [];

  const pedidosHora = dados?.pedidosPorHora || [];
  const pagamentos = dados?.pagamentos || {};
  const topProdutos = dados?.topProdutos || [];
  const resumo = dados?.resumo || {};
  const comparacao = dados?.comparacao || {};

  if (pedidosHora.length > 0) {
    const pico = [...pedidosHora].sort((a, b) => b.quantidade - a.quantidade)[0];
    if (pico) {
      insights.push({
        tipo: "pico",
        titulo: "Horário de pico",
        descricao: `${String(pico.hora).padStart(2, "0")}:00 com ${pico.quantidade} pedidos`,
      });
    }
  }

  const pagamentoTop = Object.entries(pagamentos).sort((a, b) => b[1] - a[1])[0];
  if (pagamentoTop) {
    insights.push({
      tipo: "pagamento",
      titulo: "Pagamento dominante",
      descricao: `${getTipoPagamentoLabel(pagamentoTop[0])} representa maior volume`,
    });
  }

  if (topProdutos.length > 0) {
    const top = topProdutos[0];
    insights.push({
      tipo: "produto",
      titulo: "Produto líder",
      descricao: `${top.nome} (${top.quantidade} vendidos)`,
    });
  }

  if (Number(resumo?.cancelados || 0) > 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Cancelamentos no período",
      descricao: `${resumo.cancelados} pedido(s) cancelado(s)`,
    });
  }

  if (Number(comparacao?.crescimentoPercentual || 0) < 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Queda de desempenho",
      descricao: `Crescimento de ${comparacao.crescimentoPercentual}% no comparativo`,
    });
  }

  return insights;
};