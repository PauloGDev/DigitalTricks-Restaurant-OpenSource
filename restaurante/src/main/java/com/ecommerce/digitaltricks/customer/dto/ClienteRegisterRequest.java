package com.ecommerce.digitaltricks.costumer.dto;

import com.ecommerce.digitaltricks.costumer.enums.Genero;

import java.time.LocalDate;

public record ClienteRegisterRequest(
        String telefone,
        String password,
        String nomeCompleto,
        String email,
        LocalDate dataNascimento,
        Genero genero
) {}
