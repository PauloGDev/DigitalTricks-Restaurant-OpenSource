package com.ecommerce.digitaltricks.dto.cliente;

public record ClienteAuthResponse(
        String token,
        Long clienteId,
        String telefone
) {}
