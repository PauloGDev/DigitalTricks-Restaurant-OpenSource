package com.ecommerce.digitaltricks.costumer.dto;

public record EnderecoDTO(
        Long id,
        String logradouro,
        String numero,
        String bairro,
        String cidade,
        String uf,
        String cep,
        String complemento,
        boolean padrao
) {}