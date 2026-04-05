package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.dto.CupomAplicadoDTO;

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