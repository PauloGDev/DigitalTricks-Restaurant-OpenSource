package com.ecommerce.digitaltricks.order.dto.cupom;


import java.math.BigDecimal;

public record CupomAplicadoDTO(
        Long id,
        String codigo,
        String nome,
        String tipoDesconto,
        BigDecimal valorDesconto,
        BigDecimal descontoAplicado
) {}