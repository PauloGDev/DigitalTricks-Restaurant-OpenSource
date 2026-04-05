package com.ecommerce.digitaltricks.customer.dto;

public record ClienteAuthResponse(
        String token,
        Long clienteId,
        String telefone
) {}
