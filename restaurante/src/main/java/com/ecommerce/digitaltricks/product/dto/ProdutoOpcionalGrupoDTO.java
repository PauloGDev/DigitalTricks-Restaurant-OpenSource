package com.ecommerce.digitaltricks.product.dto;

import com.ecommerce.digitaltricks.product.enums.TipoSelecaoOpcional;
import java.util.List;

public record ProdutoOpcionalGrupoDTO(
        Long id,
        String nome,
        String descricao,
        boolean obrigatorio,
        Integer minSelecionaveis,
        Integer maxSelecionaveis,
        TipoSelecaoOpcional tipoSelecao,
        boolean ativo,
        Integer ordem,
        List<ProdutoOpcionalItemDTO> itens,
        String tipoGrupo
) {}