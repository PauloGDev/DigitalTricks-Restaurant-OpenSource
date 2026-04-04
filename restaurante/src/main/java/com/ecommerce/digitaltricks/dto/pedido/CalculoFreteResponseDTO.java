package com.ecommerce.digitaltricks.dto.pedido;

public record CalculoFreteResponseDTO(
        boolean disponivel,
        String mensagem,
        Double distanciaKm,
        FreteDTO frete
) {}