package com.ecommerce.digitaltricks.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProdutoDTO(
        Long id,
        boolean ativo,
        String nome,
        String descricao,
        List<String> categorias,
        BigDecimal precoBase,
        Integer estoque,
        String slug,
        String imagemUrl,
        List<VariacaoDTO> variacoes,
        int pedidos,
        BigDecimal precoMinimo,
        List<ProdutoOpcionalGrupoDTO> gruposOpcionais,
        boolean permiteObservacao,
        int maxObservacaoChars,
        boolean emOferta,
        String tipoDesconto,
        BigDecimal valorDesconto,
        String tituloOferta,
        LocalDateTime inicioOferta,
        LocalDateTime fimOferta,
        BigDecimal precoPromocional,
        boolean ofertaVigente
) {}