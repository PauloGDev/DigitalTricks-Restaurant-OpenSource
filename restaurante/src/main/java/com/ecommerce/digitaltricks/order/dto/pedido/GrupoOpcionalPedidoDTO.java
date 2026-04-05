package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.enums.pedido.TipoItemPedidoOpcional;

import java.util.List;

public record GrupoOpcionalPedidoDTO(
        Long grupoId,
        String grupoNome,
        TipoItemPedidoOpcional tipoGrupo,
        List<ItemPedidoOpcionalDTO> itens
) {}