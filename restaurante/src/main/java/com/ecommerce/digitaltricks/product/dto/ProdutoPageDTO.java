package com.ecommerce.digitaltricks.dto;

import java.util.List;

public record ProdutoPageDTO(
        List<ProdutoDTO> produtos,
        int paginaAtual,
        int totalPaginas,
        long totalProdutos
) {}
