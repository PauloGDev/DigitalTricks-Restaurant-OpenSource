package com.ecommerce.digitaltricks.order.dto.analytics;

import java.math.BigDecimal;

public class TopFaturamentoDTO {

    public Long produtoId;
    public String nome;
    public BigDecimal faturamento;
    public int quantidade;
    public String imagemUrl;

    public TopFaturamentoDTO(Long produtoId, String nome, BigDecimal faturamento, int quantidade, String imagemUrl) {
        this.produtoId = produtoId;
        this.nome = nome;
        this.faturamento = faturamento;
        this.quantidade = quantidade;
        this.imagemUrl = imagemUrl;
    }
}
