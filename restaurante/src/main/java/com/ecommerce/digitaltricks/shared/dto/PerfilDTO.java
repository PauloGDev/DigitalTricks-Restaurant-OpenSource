package com.ecommerce.digitaltricks.shared.dto;

import com.ecommerce.digitaltricks.customer.dto.EnderecoDTO;

import java.util.List;

public record PerfilDTO(
        Long id,
        String nomeCompleto,
        String telefone,
        String cpf,
        List<EnderecoDTO> enderecos
) {}
