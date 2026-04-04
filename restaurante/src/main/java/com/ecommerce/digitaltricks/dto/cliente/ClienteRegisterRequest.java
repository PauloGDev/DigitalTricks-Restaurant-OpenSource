package com.ecommerce.digitaltricks.dto.cliente;

import com.ecommerce.digitaltricks.enums.usuarios.cliente.Genero;

import java.time.LocalDate;

public record ClienteRegisterRequest(
        String telefone,
        String password,
        String nomeCompleto,
        String email,
        LocalDate dataNascimento,
        Genero genero
) {}
