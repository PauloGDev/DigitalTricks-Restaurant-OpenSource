package com.ecommerce.digitaltricks.order.dto.pedido;

import java.util.List;

public record GrupoOpcionalSelecionadoDTO(
        Long grupoId,
        String tipoGrupo,
        List<ItemSelecionadoDTO> itens
) {
}
