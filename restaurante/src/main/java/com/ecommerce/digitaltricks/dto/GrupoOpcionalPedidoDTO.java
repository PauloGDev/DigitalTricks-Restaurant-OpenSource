package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.dto.pedido.ItemPedidoOpcionalDTO;
import com.ecommerce.digitaltricks.enums.pedido.TipoItemPedidoOpcional;

import java.util.List;

public record GrupoOpcionalPedidoDTO(
        Long grupoId,
        String grupoNome,
        TipoItemPedidoOpcional tipoGrupo,
        List<ItemPedidoOpcionalDTO> itens
) {}