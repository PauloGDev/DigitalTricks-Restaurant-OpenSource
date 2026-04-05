package com.ecommerce.digitaltricks.dto.pedido;

import java.math.BigDecimal;

public record PedidoUpdateDTO(
        BigDecimal total,
        String status,
        Long enderecoId,
        String nomeCompleto,
        String cpf,
        String telefone,
        String email,
        String linkRastreio
) {}

