package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.customer.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.order.enums.MotivoCancelamento;
import com.ecommerce.digitaltricks.order.enums.OrigemCancelamento;
import com.ecommerce.digitaltricks.order.enums.StatusPagamento;
import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import com.ecommerce.digitaltricks.order.enums.TipoEntrega;
import com.ecommerce.digitaltricks.order.enums.TipoPagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoDTO(
        Long id,
        LocalDateTime data,
        BigDecimal total,
        BigDecimal subTotal,
        TipoPagamento tipoPagamento,
        StatusPedido status,
        StatusPagamento statusPagamento,
        MotivoCancelamento motivoCancelamento,
        OrigemCancelamento origemCancelamento,
        EnderecoDTO enderecoEntrega,
        TipoEntrega tipoEntrega,
        PagamentoNaEntregaDTO pagamentoNaEntrega,
        List<ItemPedidoDTO> itens,
        String nomeCompleto,
        String cpf,
        String telefone,
        String email,
        String servicoFrete,
        Double valorFrete,
        String prazoFrete
) {}