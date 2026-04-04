package com.ecommerce.digitaltricks.dto.analytics;

import java.math.BigDecimal;

public class FaturamentoDiaDTO {
    public String data;
    public BigDecimal valor;

    public FaturamentoDiaDTO(String data, BigDecimal valor) {
        this.data = data;
        this.valor = valor;
    }
}