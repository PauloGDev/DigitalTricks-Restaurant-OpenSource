package com.ecommerce.digitaltricks.dto.pedido;

import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;

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