package com.ecommerce.digitaltricks.cart.dto;

import java.math.BigDecimal;

public record CarrinhoOpcionalItemDTO(
        Long itemId,
        String nome,
        BigDecimal precoExtra,
        Integer quantidade
) {}