export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

export const formatNumber = (value) =>
  new Intl.NumberFormat("pt-BR").format(Number(value || 0));

export const formatPercent = (value) =>
  `${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`;

export const formatDateLabel = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const PAYMENT_LABELS = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de crédito",
  DEBIT_CARD: "Cartão de débito",
  PAY_ON_DELIVERY: "Pagamento na entrega",
};

export const DELIVERY_METHOD_LABELS = {
  CASH: "Dinheiro",
  DEBIT_CARD: "Débito na entrega",
  CREDIT_CARD: "Crédito na entrega",
};

export const DELIVERY_TYPE_LABELS = {
  DELIVERY: "Delivery",
  RETIRADA: "Retirada",
  LOCAL: "Consumo no local",
};

export const STATUS_LABELS = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  AGUARDANDO_RETIRADA: "Aguardando retirada",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

export const STATUS_PAGAMENTO_LABELS = {
  PENDENTE: "Pagamento pendente",
  PROCESSANDO: "Pagamento em processamento",
  APROVADO: "Pagamento aprovado",
  RECUSADO: "Pagamento recusado",
  CANCELADO: "Pagamento cancelado",
  ESTORNADO: "Pagamento estornado",
  REEMBOLSADO: "Pagamento reembolsado",
};

export const MOTIVO_CANCELAMENTO_LABELS = {
  CLIENTE_DESISTIU: "Cliente desistiu",
  PAGAMENTO_NAO_APROVADO: "Pagamento não aprovado",
  FALTA_DE_ESTOQUE: "Falta de estoque",
  AREA_NAO_ATENDIDA: "Área não atendida",
  ERRO_OPERACIONAL: "Erro operacional",
  TEMPO_EXCEDIDO: "Tempo excedido",
  OUTRO: "Outro",
};

export const ORIGEM_CANCELAMENTO_LABELS = {
  CLIENTE: "Cliente",
  LOJA: "Loja",
  SISTEMA: "Sistema",
  GATEWAY_PAGAMENTO: "Gateway de pagamento",
};

export const getStatusLabel = (status) =>
  STATUS_LABELS[String(status || "").trim().toUpperCase()] || status || "—";

export const getStatusPagamentoLabel = (statusPagamento) =>
  STATUS_PAGAMENTO_LABELS[String(statusPagamento || "").trim().toUpperCase()] ||
  statusPagamento ||
  "—";

export const getMotivoCancelamentoLabel = (motivo) =>
  MOTIVO_CANCELAMENTO_LABELS[String(motivo || "").trim().toUpperCase()] ||
  motivo ||
  "—";

export const getOrigemCancelamentoLabel = (origem) =>
  ORIGEM_CANCELAMENTO_LABELS[String(origem || "").trim().toUpperCase()] ||
  origem ||
  "—";

export const getTipoEntregaLabel = (tipoEntrega) =>
  DELIVERY_TYPE_LABELS[String(tipoEntrega || "").trim().toUpperCase()] ||
  tipoEntrega ||
  "—";

export const getTipoPagamentoLabel = (tipoPagamento) =>
  PAYMENT_LABELS[String(tipoPagamento || "").trim().toUpperCase()] ||
  tipoPagamento ||
  "—";

export const getPagamentoEntregaMetodoLabel = (metodo) =>
  DELIVERY_METHOD_LABELS[String(metodo || "").trim().toUpperCase()] ||
  metodo ||
  "—";

export const getPagamentoCompletoLabel = (pedido) => {
  const tipoPagamento = String(pedido?.tipoPagamento || "")
    .trim()
    .toUpperCase();

  if (tipoPagamento === "PAY_ON_DELIVERY") {
    const metodo = String(pedido?.pagamentoNaEntrega?.metodo || "")
      .trim()
      .toUpperCase();

    if (metodo === "CASH") {
      if (
        pedido?.pagamentoNaEntrega?.precisaTroco &&
        pedido?.pagamentoNaEntrega?.trocoPara != null
      ) {
        return `Dinheiro na entrega • Troco para ${formatCurrency(
          pedido.pagamentoNaEntrega.trocoPara
        )}`;
      }
      return "Dinheiro na entrega";
    }

    if (metodo === "DEBIT_CARD") return "Débito na entrega";
    if (metodo === "CREDIT_CARD") return "Crédito na entrega";

    return "Pagamento na entrega";
  }

  if (tipoPagamento === "PIX") return "PIX";
  if (tipoPagamento === "CREDIT_CARD") return "Cartão de crédito";
  if (tipoPagamento === "DEBIT_CARD") return "Cartão de débito";

  return "—";
};

export const isPagamentoAprovado = (pedido) =>
  String(pedido?.statusPagamento || "").trim().toUpperCase() === "APROVADO";

export const normalizePedido = (pedido = {}) => {
  const tipoPagamento = String(pedido?.tipoPagamento || "")
    .trim()
    .toUpperCase();

  const tipoEntrega = String(
    pedido?.tipoEntrega ||
      (pedido?.mesa ? "LOCAL" : pedido?.enderecoEntrega ? "DELIVERY" : "RETIRADA")
  )
    .trim()
    .toUpperCase();

  const pagamentoNaEntrega = pedido?.pagamentoNaEntrega
    ? {
        metodo: String(pedido.pagamentoNaEntrega.metodo || "")
          .trim()
          .toUpperCase(),
        precisaTroco: Boolean(pedido.pagamentoNaEntrega.precisaTroco),
        trocoPara:
          pedido.pagamentoNaEntrega.trocoPara != null
            ? Number(pedido.pagamentoNaEntrega.trocoPara)
            : null,
      }
    : null;

  const itens = Array.isArray(pedido?.itens) ? pedido.itens : [];

  const subtotalCalculado = itens.reduce(
    (acc, item) => acc + Number(item?.totalItem || 0),
    0
  );

  const valorFrete = Number(pedido?.valorFrete || 0);
  const total = Number(pedido?.total || subtotalCalculado + valorFrete);

  const status = String(pedido?.status || "").trim().toUpperCase();
  const statusPagamento = String(pedido?.statusPagamento || "")
    .trim()
    .toUpperCase();

  return {
    ...pedido,
    id: pedido?.id ?? null,
    data: pedido?.data || null,
    total,
    subtotal: Number(pedido?.subtotal ?? subtotalCalculado),
    valorFrete,
    tipoPagamento,
    tipoPagamentoLabel: getTipoPagamentoLabel(tipoPagamento),
    tipoEntrega,
    tipoEntregaLabel: getTipoEntregaLabel(tipoEntrega),
    pagamentoNaEntrega,
    pagamentoLabel: getPagamentoCompletoLabel({
      ...pedido,
      tipoPagamento,
      pagamentoNaEntrega,
    }),
    status,
    statusLabel: getStatusLabel(status),
    statusPagamento,
    statusPagamentoLabel: getStatusPagamentoLabel(statusPagamento),
    motivoCancelamento: pedido?.motivoCancelamento || null,
    motivoCancelamentoLabel: getMotivoCancelamentoLabel(
      pedido?.motivoCancelamento
    ),
    origemCancelamento: pedido?.origemCancelamento || null,
    origemCancelamentoLabel: getOrigemCancelamentoLabel(
      pedido?.origemCancelamento
    ),
    pagamentoAprovado: isPagamentoAprovado({ statusPagamento }),
    itens,
    quantidadeItens: itens.reduce(
      (acc, item) => acc + Number(item?.quantidade || 0),
      0
    ),
  };
};

export const normalizePedidosList = (pedidos = []) =>
  Array.isArray(pedidos) ? pedidos.map(normalizePedido) : [];

export const normalizeAnalyticsData = (data) => ({
  faturamento: Array.isArray(data?.faturamento) ? data.faturamento : [],
  pedidos: Array.isArray(data?.pedidos) ? data.pedidos : [],
  resumo: data?.resumo || {},
  topProdutos: Array.isArray(data?.topProdutos) ? data.topProdutos : [],
  pedidosPorHora: Array.isArray(data?.pedidosPorHora) ? data.pedidosPorHora : [],
  pagamentos: data?.pagamentos || {},
  entregas: data?.entregas || {},
  cupons: data?.cupons || {},
  retencao: data?.retencao || {},
  comparacao: data?.comparacao || {},
});

export const mapPedidosHora = (lista = []) =>
  lista
    .map((item) => ({
      hora: Number(item?.hora ?? 0),
      label: `${String(item?.hora ?? 0).padStart(2, "0")}:00`,
      quantidade: Number(item?.quantidade || 0),
    }))
    .sort((a, b) => a.hora - b.hora);

export const mapTopProdutos = (lista = []) =>
  (Array.isArray(lista) ? lista : [])
    .map((item, index) => {
      const nome =
        item?.nome ||
        item?.nomeProduto ||
        item?.produtoNome ||
        item?.produto?.nome ||
        item?.titulo ||
        `Produto ${index + 1}`;

      const quantidade =
        Number(
          item?.quantidade ??
            item?.totalVendido ??
            item?.qtdVendida ??
            item?.vendidos ??
            0
        ) || 0;

      const faturamento =
        Number(
          item?.faturamento ??
            item?.valorTotal ??
            item?.total ??
            item?.receita ??
            0
        ) || 0;

      const produtoId =
        item?.produtoId ??
        item?.id ??
        item?.produto?.id ??
        index;

      return {
        nome: String(nome).trim(),
        quantidade,
        produtoId,
        faturamento,
        imagemUrl: item?.imagemUrl || null,
      };
    })
    .filter((item) => item.nome && item.quantidade > 0);

export const mapPagamentosAnalytics = (pagamentos = {}) =>
  Object.entries(pagamentos || {}).map(([key, value]) => ({
    nome: getTipoPagamentoLabel(key),
    chave: key,
    valor: Number(value || 0),
  }));

export const mapEntregasAnalytics = (entregas = {}) =>
  Object.entries(entregas || {}).map(([key, value]) => ({
    nome: getTipoEntregaLabel(key),
    chave: key,
    valor: Number(value || 0),
  }));

export const mapStatusAnalytics = (statusObj = {}) =>
  Object.entries(statusObj || {}).map(([key, value]) => ({
    nome: getStatusLabel(key),
    chave: key,
    valor: Number(value || 0),
  }));

export const buildPedidosAnalyticsFromPedidos = (pedidos = []) => {
  const lista = normalizePedidosList(pedidos);

  const pagamentos = {};
  const entregas = {};
  const status = {};
  const pagamentosEntrega = {
    CASH: 0,
    DEBIT_CARD: 0,
    CREDIT_CARD: 0,
  };

  let faturamentoTotal = 0;
  let totalPedidos = 0;
  let pedidosAprovados = 0;
  let pedidosComTroco = 0;
  let itensVendidos = 0;
  let cancelados = 0;

  for (const pedido of lista) {
    totalPedidos += 1;
    itensVendidos += Number(pedido.quantidadeItens || 0);

    pagamentos[pedido.tipoPagamento] =
      Number(pagamentos[pedido.tipoPagamento] || 0) + 1;
    entregas[pedido.tipoEntrega] =
      Number(entregas[pedido.tipoEntrega] || 0) + 1;
    status[pedido.status] = Number(status[pedido.status] || 0) + 1;

    if (pedido.status === "CANCELADO") {
      cancelados += 1;
    }

    if (["ENTREGUE", "RETIRADO"].includes(pedido.status)) {
      faturamentoTotal += Number(pedido.total || 0);
    }

    if (pedido.pagamentoAprovado) {
      pedidosAprovados += 1;
    }

    if (
      pedido.tipoPagamento === "PAY_ON_DELIVERY" &&
      pedido.pagamentoNaEntrega?.metodo
    ) {
      const metodo = pedido.pagamentoNaEntrega.metodo;
      pagamentosEntrega[metodo] = Number(pagamentosEntrega[metodo] || 0) + 1;

      if (metodo === "CASH" && pedido.pagamentoNaEntrega?.precisaTroco) {
        pedidosComTroco += 1;
      }
    }
  }

  return {
    resumo: {
      faturamentoTotal,
      totalPedidos,
      ticketMedio: totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0,
      pedidosAprovados,
      pedidosComTroco,
      itensVendidos,
      cancelados,
    },
    pagamentos,
    entregas,
    status,
    pagamentosEntrega,
  };
};

export const hasAnalyticsData = (dados) =>
  (dados?.faturamento?.length || 0) > 0 ||
  (dados?.pedidos?.length || 0) > 0 ||
  (dados?.pedidosPorHora?.length || 0) > 0 ||
  (dados?.topProdutos?.length || 0) > 0 ||
  Object.keys(dados?.pagamentos || {}).length > 0 ||
  Object.keys(dados?.entregas || {}).length > 0 ||
  Number(dados?.resumo?.totalPedidos || 0) > 0;