package com.ecommerce.digitaltricks.dto.analytics;

import java.math.BigDecimal;

public class CuponsDTO {
    public int pedidosComCupom;
    public BigDecimal faturamentoComCupom;
    public BigDecimal descontoTotal;

    public CuponsDTO(int pedidosComCupom, BigDecimal faturamentoComCupom, BigDecimal descontoTotal) {
        this.pedidosComCupom = pedidosComCupom;
        this.faturamentoComCupom = faturamentoComCupom;
        this.descontoTotal = descontoTotal;
    }
}