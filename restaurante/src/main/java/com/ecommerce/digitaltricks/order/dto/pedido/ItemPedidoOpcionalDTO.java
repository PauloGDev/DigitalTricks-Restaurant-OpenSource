package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.enums.pedido.TipoItemPedidoOpcional;

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