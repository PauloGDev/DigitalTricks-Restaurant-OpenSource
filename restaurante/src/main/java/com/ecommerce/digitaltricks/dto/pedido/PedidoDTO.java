package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.dto.cliente.EnderecoDTO;
import com.ecommerce.digitaltricks.enums.pedido.MotivoCancelamento;
import com.ecommerce.digitaltricks.enums.pedido.OrigemCancelamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPagamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.enums.pedido.TipoPagamento;

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