package com.ecommerce.digitaltricks.order.dto.pedido;

public record CalculoFreteResponseDTO(
        boolean disponivel,
        String mensagem,
        Double distanciaKm,
        FreteDTO frete
) {}