package com.ecommerce.digitaltricks.dto.pedido;

import java.util.List;

public record CarrinhoOpcionalGrupoDTO(
        Long grupoId,
        String grupoNome,
        String tipoGrupo,
        List<CarrinhoOpcionalItemDTO> itens
) {}