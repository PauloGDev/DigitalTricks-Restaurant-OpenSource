package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.dto.GrupoOpcionalPedidoDTO;

import java.math.BigDecimal;
import java.util.List;

public record ItemPedidoDTO(
        Long id,
        Long variacaoId,
        String nomeProduto,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal totalOpcionais,
        BigDecimal totalItem,
        String imagemUrl,
        String observacao,
        List<GrupoOpcionalPedidoDTO> opcionais
) {}