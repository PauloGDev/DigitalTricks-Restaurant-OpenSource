package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.order.enums.MetodoPagamentoNaEntrega;

import java.math.BigDecimal;

public record PagamentoNaEntregaDTO(
        MetodoPagamentoNaEntrega metodo,
        Boolean precisaTroco,
        BigDecimal trocoPara
) {}