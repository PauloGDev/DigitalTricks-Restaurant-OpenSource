package com.ecommerce.digitaltricks.dto.pedido;

import java.math.BigDecimal;

public record CarrinhoOpcionalItemDTO(
        Long itemId,
        String nome,
        BigDecimal precoExtra,
        Integer quantidade
) {}