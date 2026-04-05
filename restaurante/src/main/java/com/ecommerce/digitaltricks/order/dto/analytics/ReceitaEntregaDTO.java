package com.ecommerce.digitaltricks.order.dto.analytics;

import java.math.BigDecimal;

public class ReceitaEntregaDTO {

    public String tipoEntrega;
    public long quantidade;
    public BigDecimal receita;

    public ReceitaEntregaDTO(String tipoEntrega, long quantidade, BigDecimal receita) {
        this.tipoEntrega = tipoEntrega;
        this.quantidade = quantidade;
        this.receita = receita;
    }
}
