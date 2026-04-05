package com.ecommerce.digitaltricks.product.dto;

import com.ecommerce.digitaltricks.product.model.Variacao;

import java.math.BigDecimal;

public record VariacaoDTO(Long id, String nome, BigDecimal preco, Integer estoque, BigDecimal precoPromocional) {
    public Variacao toEntity() {
        Variacao v = new Variacao();
        v.setId(id);
        v.setNome(nome);
        v.setPreco(preco);
        v.setEstoque(estoque);
        v.setPrecoPromocional(precoPromocional);
        return v;
    }
}
