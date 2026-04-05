package com.ecommerce.digitaltricks.dto.analytics;

import java.math.BigDecimal;

public class ResumoDTO {
    public BigDecimal faturamentoTotal;
    public Integer totalPedidos;
    public BigDecimal ticketMedio;
    public Integer totalClientes;
    public int cancelados;
    public BigDecimal faturamentoPerdido;
    public Integer tempoMedioPreparo;
    public Integer tempoMedioEntrega;

    public ResumoDTO(
            BigDecimal faturamentoTotal,
            Integer totalPedidos,
            BigDecimal ticketMedio,
            Integer totalClientes,
            int cancelados,
            BigDecimal faturamentoPerdido,
            Integer tempoMedioPreparo,
            Integer tempoMedioEntrega
    ) {
        this.faturamentoTotal = faturamentoTotal;
        this.totalPedidos = totalPedidos;
        this.ticketMedio = ticketMedio;
        this.totalClientes = totalClientes;
        this.cancelados = cancelados;
        this.faturamentoPerdido = faturamentoPerdido;
        this.tempoMedioPreparo = tempoMedioPreparo;
        this.tempoMedioEntrega = tempoMedioEntrega;
    }
}