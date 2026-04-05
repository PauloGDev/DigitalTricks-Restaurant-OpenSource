package com.ecommerce.digitaltricks.customer.dto;

public record ClienteLoginRequest(
        String telefone,
        String password
) {}
