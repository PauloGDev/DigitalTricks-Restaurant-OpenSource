package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.enums.pedido.TipoPagamento;

import java.util.List;

public record PedidoRequestDTO(
        TipoEntrega tipoEntrega,          // DELIVERY | RETIRADA
        Long enderecoId,                  // obrigatório se DELIVERY (pode ser null se RETIRADA)
        FreteDTO frete,                   // opcional (normalmente só DELIVERY)
        List<ItemPedidoRequestDTO> itens,
        TipoPagamento tipoPagamento,      // PIX | CREDIT_CARD | PAY_ON_DELIVERY
        PagamentoNaEntregaDTO pagamentoNaEntrega, // obrigatório se PAY_ON_DELIVERY
        Long empresaId
) {}