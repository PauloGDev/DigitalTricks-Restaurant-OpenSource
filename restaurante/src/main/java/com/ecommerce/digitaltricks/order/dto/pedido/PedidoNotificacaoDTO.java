package com.ecommerce.digitaltricks.order.dto.pedido;

import com.ecommerce.digitaltricks.order.enums.StatusPedido;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PedidoNotificacaoDTO(
        UUID notificationId,
        Long pedidoId,
        Long empresaId,
        String nomeCliente,
        BigDecimal total,
        StatusPedido status,
        String mensagem,
        Instant criadaEm
) {}