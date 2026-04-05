package com.ecommerce.digitaltricks.dto.pedido;

import java.util.List;

public record GrupoOpcionalSelecionadoDTO(
        Long grupoId,
        String tipoGrupo,
        List<ItemSelecionadoDTO> itens
) {
}
