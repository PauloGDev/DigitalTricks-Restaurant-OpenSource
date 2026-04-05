package com.ecommerce.digitaltricks.order.dto.analytics;

import java.math.BigDecimal;

public class ComparacaoDTO {
    public BigDecimal faturamentoAtual;
    public BigDecimal faturamentoAnterior;
    public BigDecimal crescimentoValor;
    public BigDecimal crescimentoPercentual;

    public ComparacaoDTO(BigDecimal faturamentoAtual,
                         BigDecimal faturamentoAnterior,
                         BigDecimal crescimentoValor,
                         BigDecimal crescimentoPercentual) {
        this.faturamentoAtual = faturamentoAtual;
        this.faturamentoAnterior = faturamentoAnterior;
        this.crescimentoValor = crescimentoValor;
        this.crescimentoPercentual = crescimentoPercentual;
    }
}