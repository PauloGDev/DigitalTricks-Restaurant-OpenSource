package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.enums.pedido.MetodoPagamentoNaEntrega;

import java.math.BigDecimal;

public record PagamentoNaEntregaDTO(
        MetodoPagamentoNaEntrega metodo,
        Boolean precisaTroco,
        BigDecimal trocoPara
) {}