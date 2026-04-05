package com.ecommerce.digitaltricks.order.dto.analytics;

import java.util.List;
import java.util.Map;

public class AnalyticsDTO {

    public List<FaturamentoDiaDTO> faturamento;
    public List<PedidosDiaDTO> pedidos;
    public ResumoDTO resumo;

    // 🔥 NOVOS
    public List<TopProdutoDTO> topProdutos;
    public List<PedidosHoraDTO> pedidosPorHora;
    public Map<String, Long> pagamentos;
    public Map<String, Long> entregas;
    public CuponsDTO cupons;
    public RetencaoDTO retencao;
    public ComparacaoDTO comparacao;

    public AnalyticsDTO(
            List<FaturamentoDiaDTO> faturamento,
            List<PedidosDiaDTO> pedidos,
            ResumoDTO resumo,
            List<TopProdutoDTO> topProdutos,
            List<PedidosHoraDTO> pedidosPorHora,
            Map<String, Long> pagamentos,
            Map<String, Long> entregas,
            CuponsDTO cupons,
            RetencaoDTO retencao,
            ComparacaoDTO comparacao
    ) {
        this.faturamento = faturamento;
        this.pedidos = pedidos;
        this.resumo = resumo;
        this.topProdutos = topProdutos;
        this.pedidosPorHora = pedidosPorHora;
        this.pagamentos = pagamentos;
        this.entregas = entregas;
        this.cupons = cupons;
        this.retencao = retencao;
        this.comparacao = comparacao;
    }
}