package com.ecommerce.digitaltricks.order.dto.analytics;

import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    public List<FaturamentoDiaDTO> faturamento;
    public List<PedidosDiaDTO> pedidos;
    public ResumoDTO resumo;
    public List<TopProdutoDTO> topProdutos;
    public List<TopFaturamentoDTO> topFaturamento;
    public List<PedidosHoraDTO> pedidosPorHora;
    public Map<String, Long> pagamentos;
    public Map<String, Long> entregas;
    public CuponsDTO cupons;
    public RetencaoDTO retencao;
    public ComparacaoDTO comparacao;
    public List<MotivoCancelamentoDTO> motivosCancelamento;
    public List<ReceitaEntregaDTO> receitaPorEntrega;
    public Integer tempoMedioEntregaFinal;

    public AnalyticsDTO(
            List<FaturamentoDiaDTO> faturamento,
            List<PedidosDiaDTO> pedidos,
            ResumoDTO resumo,
            List<TopProdutoDTO> topProdutos,
            List<TopFaturamentoDTO> topFaturamento,
            List<PedidosHoraDTO> pedidosPorHora,
            Map<String, Long> pagamentos,
            Map<String, Long> entregas,
            CuponsDTO cupons,
            RetencaoDTO retencao,
            ComparacaoDTO comparacao,
            List<MotivoCancelamentoDTO> motivosCancelamento,
            List<ReceitaEntregaDTO> receitaPorEntrega,
            Integer tempoMedioEntregaFinal
    ) {
        this.faturamento = faturamento;
        this.pedidos = pedidos;
        this.resumo = resumo;
        this.topProdutos = topProdutos;
        this.topFaturamento = topFaturamento;
        this.pedidosPorHora = pedidosPorHora;
        this.pagamentos = pagamentos;
        this.entregas = entregas;
        this.cupons = cupons;
        this.retencao = retencao;
        this.comparacao = comparacao;
        this.motivosCancelamento = motivosCancelamento;
        this.receitaPorEntrega = receitaPorEntrega;
        this.tempoMedioEntregaFinal = tempoMedioEntregaFinal;
    }
}
