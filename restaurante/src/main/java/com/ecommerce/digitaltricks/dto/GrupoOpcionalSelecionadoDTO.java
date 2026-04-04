package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record GrupoOpcionalSelecionadoDTO(
        Long grupoId,
        String tipoGrupo,
        List<ItemSelecionadoDTO> itens
) {
}
