package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.dto.GrupoOpcionalSelecionadoDTO;

import java.math.BigDecimal;
import java.util.List;

public record ItemPedidoRequestDTO(
        Long produtoId,
        Long variacaoId,
        int quantidade,

        String nomeProduto,
        BigDecimal precoUnitario,

        List<GrupoOpcionalSelecionadoDTO> opcionais,

        String observacao
) {}