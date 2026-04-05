package com.ecommerce.digitaltricks.costumer.dto;

public record ClienteAuthResponse(
        String token,
        Long clienteId,
        String telefone
) {}
