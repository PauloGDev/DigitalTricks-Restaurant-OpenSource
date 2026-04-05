package com.ecommerce.digitaltricks.cart.dto;

import com.ecommerce.digitaltricks.order.dto.cupom.CupomAplicadoDTO;

import java.math.BigDecimal;
import java.util.List;

public record CarrinhoDTO(
        Long id,
        Long usuarioId,
        List<CarrinhoItemDTO> itens,
        BigDecimal subtotal,
        BigDecimal descontoCupom,
        BigDecimal total,
        CupomAplicadoDTO cupom,
        String motivoCupomInvalido,
        String codigoErroCupom
) {}