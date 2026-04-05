package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.order.enums.TipoItemPedidoOpcional;

import java.util.List;

public record GrupoOpcionalPedidoDTO(
        Long grupoId,
        String grupoNome,
        TipoItemPedidoOpcional tipoGrupo,
        List<ItemPedidoOpcionalDTO> itens
) {}