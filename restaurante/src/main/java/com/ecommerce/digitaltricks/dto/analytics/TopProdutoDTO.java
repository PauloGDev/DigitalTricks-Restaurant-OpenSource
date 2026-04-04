package com.ecommerce.digitaltricks.dto.analytics;

import java.math.BigDecimal;

public class TopProdutoDTO {

    public Long produtoId;
    public String nome;
    public int quantidade;
    public String imagemUrl;
    public BigDecimal faturamento;

    public TopProdutoDTO(Long produtoId, String nome, int quantidade, String imagemUrl, BigDecimal faturamento) {
        this.produtoId = produtoId;
        this.nome = nome;
        this.quantidade = quantidade;
        this.imagemUrl = imagemUrl;
        this.faturamento = faturamento;
    }
}