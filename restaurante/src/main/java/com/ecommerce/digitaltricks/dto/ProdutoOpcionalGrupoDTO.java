package com.ecommerce.digitaltricks.dto;

import com.ecommerce.digitaltricks.enums.produtos.TipoSelecaoOpcional;
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