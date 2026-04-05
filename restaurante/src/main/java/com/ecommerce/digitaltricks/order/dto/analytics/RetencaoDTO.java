package com.ecommerce.digitaltricks.order.dto.analytics;

public class RetencaoDTO {
    public int clientesRecorrentes;
    public int totalClientes;

    public RetencaoDTO(int recorrentes, int total) {
        this.clientesRecorrentes = recorrentes;
        this.totalClientes = total;
    }
}