package com.ecommerce.digitaltricks.customer.dto;

import com.ecommerce.digitaltricks.customer.enums.Genero;

import java.time.LocalDate;

public record ClienteRegisterRequest(
        String telefone,
        String password,
        String nomeCompleto,
        String email,
        LocalDate dataNascimento,
        Genero genero
) {}
