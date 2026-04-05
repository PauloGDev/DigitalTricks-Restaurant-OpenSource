package com.ecommerce.digitaltricks.cart.dto;

import java.util.List;

public record CarrinhoOpcionalGrupoDTO(
        Long grupoId,
        String grupoNome,
        String tipoGrupo,
        List<CarrinhoOpcionalItemDTO> itens
) {}