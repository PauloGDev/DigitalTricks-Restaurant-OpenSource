package com.ecommerce.digitaltricks.dto.cliente;

public record ClienteLoginRequest(
        String telefone,
        String password
) {}
