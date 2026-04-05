package com.ecommerce.digitaltricks.order.dto.analytics;

import java.math.BigDecimal;

public class MotivoCancelamentoDTO {

    private String motivo;
    private int quantidade;
    private BigDecimal valorPerdido;

    public MotivoCancelamentoDTO(String motivo, int quantidade, BigDecimal valorPerdido) {
        this.motivo = motivo;
        this.quantidade = quantidade;
        this.valorPerdido = valorPerdido;
    }

    public String getMotivo() { return motivo; }
    public int getQuantidade() { return quantidade; }
    public BigDecimal getValorPerdido() { return valorPerdido; }
}
