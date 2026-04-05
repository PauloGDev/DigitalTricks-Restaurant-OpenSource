package com.ecommerce.digitaltricks.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ClienteEmpresaDTO(
        Long id,
        Long clienteId,
        String telefone,
        String nomeCompleto,
        String email,
        Long empresaId,
        String nomeFantasiaEmpresa,
        Boolean ativo,
        Boolean bloqueado,
        Integer totalPedidos,
        BigDecimal totalGasto,
        LocalDateTime ultimoPedidoEm,
        String observacoesInternas
) {
}