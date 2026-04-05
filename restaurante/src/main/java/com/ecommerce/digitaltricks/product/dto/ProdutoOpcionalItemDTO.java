package com.ecommerce.digitaltricks.dto;

import java.math.BigDecimal;

public record ProdutoOpcionalItemDTO(
        Long id,
        String nome,
        BigDecimal precoExtra,
        Boolean ativo,
        Integer estoque,
        Integer ordem
) {}