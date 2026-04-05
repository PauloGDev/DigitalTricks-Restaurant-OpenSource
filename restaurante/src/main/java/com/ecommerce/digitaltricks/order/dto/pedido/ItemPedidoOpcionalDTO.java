package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.order.enums.TipoItemPedidoOpcional;

import java.math.BigDecimal;

public record ItemPedidoOpcionalDTO(
        Long itemId,
        String nome,
        BigDecimal precoExtra,
        Integer quantidade,
        TipoItemPedidoOpcional tipoGrupo,
        Long grupoId,
        String grupoNome
) {}