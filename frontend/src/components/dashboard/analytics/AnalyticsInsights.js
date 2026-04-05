import { getTipoPagamentoLabel } from "./AnalyticsUtils";

export const buildAnalyticsInsights = (dados = {}) => {
  const insights = [];

  const pedidosHora = dados?.pedidosPorHora || [];
  const pagamentos = dados?.pagamentos || {};
  const topProdutos = dados?.topProdutos || [];
  const resumo = dados?.resumo || {};
  const comparacao = dados?.comparacao || {};
  const retencao = dados?.retencao || {};
  const cupons = dados?.cupons || {};

  // Horário de pico
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

  // Pagamento dominante
  const pagamentoTop = Object.entries(pagamentos).sort((a, b) => b[1] - a[1])[0];
  if (pagamentoTop) {
    insights.push({
      tipo: "pagamento",
      titulo: "Pagamento dominante",
      descricao: `${getTipoPagamentoLabel(pagamentoTop[0])} representa maior volume`,
    });
  }

  // Produto líder
  if (topProdutos.length > 0) {
    const top = topProdutos[0];
    insights.push({
      tipo: "produto",
      titulo: "Produto líder",
      descricao: `${top.nome} (${top.quantidade} vendidos)`,
    });
  }

  // Ticket médio
  const ticketMedio = Number(resumo?.ticketMedio || 0);
  if (ticketMedio > 0) {
    insights.push({
      tipo: "ticket",
      titulo: "Ticket médio",
      descricao: `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ticketMedio)} por pedido`,
    });
  }

  // Retenção
  const totalClientes = Number(retencao?.totalClientes || 0);
  const recorrentes = Number(retencao?.clientesRecorrentes || 0);
  if (totalClientes > 0) {
    const taxa = ((recorrentes / totalClientes) * 100).toFixed(0);
    insights.push({
      tipo: recorrentes >= totalClientes * 0.3 ? "positivo" : "alerta",
      titulo: "Retenção de clientes",
      descricao: `${recorrentes} de ${totalClientes} clientes retornaram (${taxa}%)`,
    });
  }

  // Cupons
  const pedidosComCupom = Number(cupons?.pedidosComCupom || 0);
  if (pedidosComCupom > 0) {
    const descontoTotal = Number(cupons?.descontoTotal || 0);
    insights.push({
      tipo: "cupom",
      titulo: "Impacto de cupons",
      descricao: `${pedidosComCupom} pedidos com R$ ${descontoTotal.toFixed(2)} em descontos`,
    });
  }

  // Tempo médio de preparo
  if (resumo?.tempoMedioPreparo != null) {
    const tempo = resumo.tempoMedioPreparo;
    insights.push({
      tipo: tempo <= 15 ? "positivo" : tempo > 30 ? "alerta" : "info",
      titulo: "Tempo médio preparo",
      descricao: `${tempo} minutos do início ao pronto`,
    });
  }

  // Cancelamentos
  if (Number(resumo?.cancelados || 0) > 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Cancelamentos",
      descricao: `${resumo.cancelados} pedido(s) cancelado(s)`,
    });
  }

  // Queda de desempenho
  const crescimentoPct = Number(comparacao?.crescimentoPercentual || 0);
  if (crescimentoPct < 0) {
    insights.push({
      tipo: "alerta",
      titulo: "Queda de faturamento",
      descricao: `${crescimentoPct.toFixed(1)}% vs período anterior`,
    });
  } else if (crescimentoPct > 0) {
    insights.push({
      tipo: "positivo",
      titulo: "Crescimento",
      descricao: `+${crescimentoPct.toFixed(1)}% vs período anterior`,
    });
  }

  return insights;
};