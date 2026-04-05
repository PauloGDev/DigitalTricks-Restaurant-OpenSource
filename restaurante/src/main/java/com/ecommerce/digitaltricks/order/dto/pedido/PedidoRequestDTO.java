package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.order.enums.TipoEntrega;
import com.ecommerce.digitaltricks.order.enums.TipoPagamento;

import java.util.List;

public record PedidoRequestDTO(
        TipoEntrega tipoEntrega,          // DELIVERY | RETIRADA
        Long enderecoId,                  // obrigatório se DELIVERY (pode ser null se RETIRADA)
        FreteDTO frete,                   // opcional (normalmente só DELIVERY)
        List<ItemPedidoRequestDTO> itens,
        TipoPagamento tipoPagamento,      // PIX | CREDIT_CARD | PAY_ON_DELIVERY
        PagamentoNaEntregaDTO pagamentoNaEntrega, // obrigatório se PAY_ON_DELIVERY
        Long empresaId,
        String cpf                        // obrigatório para PIX/CREDIT_CARD, opcional para PAY_ON_DELIVERY
) {}