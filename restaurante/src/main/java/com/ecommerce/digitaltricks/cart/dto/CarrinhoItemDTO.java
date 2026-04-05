package com.ecommerce.digitaltricks.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarrinhoItemDTO(
        Long id,                    // ✅ itemId (CarrinhoItem.id)
        Long produtoId,
        String nomeProduto,          // ✅ nome do produto (separado)
        String produtoDescricao,     // ✅ descrição do produto
        Long variacaoId,             // ✅ se existir
        String variacaoNome,         // ✅ se existir

        BigDecimal precoUnitario,
        int quantidade,
        BigDecimal subtotal,
        String imagemUrl,

        String observacao,           // ✅
        List<CarrinhoOpcionalGrupoDTO> opcionais, // ✅ detalhado
        List<String> opcionaisResumo            // ✅ fallback (texto)
) {}