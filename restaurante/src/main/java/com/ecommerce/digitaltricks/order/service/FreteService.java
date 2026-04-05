package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.order.dto.pedido.CalculoFreteResponseDTO;
import com.ecommerce.digitaltricks.order.dto.pedido.FreteDTO;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.customer.model.Endereco;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FreteService {

    public CalculoFreteResponseDTO calcularFrete(Empresa empresa, Endereco endereco, Double subtotal) {
        if (empresa == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empresa inválida.");
        }

        if (endereco == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereço inválido.");
        }

        if (!Boolean.TRUE.equals(empresa.getAceitaDelivery())) {
            return new CalculoFreteResponseDTO(
                    false,
                    "Este restaurante não realiza delivery.",
                    null,
                    null
            );
        }

        validarCoordenadasEmpresa(empresa);
        validarCoordenadasEndereco(endereco);

        double distanciaKm = calcularDistanciaKm(
                empresa.getLatitude(),
                empresa.getLongitude(),
                endereco.getLatitude(),
                endereco.getLongitude()
        );

        if (empresa.getRaioEntregaKm() != null && distanciaKm > empresa.getRaioEntregaKm()) {
            return new CalculoFreteResponseDTO(
                    false,
                    "Endereço fora da área de entrega.",
                    arredondar(distanciaKm),
                    null
            );
        }

        double valorFrete = calcularValorFrete(empresa, distanciaKm, subtotal);
        String prazo = estimarPrazo(distanciaKm);

        FreteDTO freteDTO = new FreteDTO(
                "Entrega padrão",
                arredondar(valorFrete),
                prazo
        );

        return new CalculoFreteResponseDTO(
                true,
                "Frete calculado com sucesso.",
                arredondar(distanciaKm),
                freteDTO
        );
    }

    public FreteDTO calcularFreteParaPedido(Empresa empresa, Endereco endereco, Double subtotal) {
        CalculoFreteResponseDTO response = calcularFrete(empresa, endereco, subtotal);

        if (!response.disponivel() || response.frete() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    response.mensagem() != null ? response.mensagem() : "Não foi possível calcular o frete.");
        }

        return response.frete();
    }

    private void validarCoordenadasEmpresa(Empresa empresa) {
        if (empresa.getLatitude() == null || empresa.getLongitude() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A empresa não possui latitude/longitude configuradas."
            );
        }
    }

    private void validarCoordenadasEndereco(Endereco endereco) {
        if (endereco.getLatitude() == null || endereco.getLongitude() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O endereço não possui latitude/longitude configuradas."
            );
        }
    }

    private double calcularValorFrete(Empresa empresa, double distanciaKm, Double subtotal) {
        double taxaFixa = empresa.getTaxaEntregaFixa() != null ? empresa.getTaxaEntregaFixa() : 0.0;
        double valorPorKm = empresa.getValorPorKm() != null ? empresa.getValorPorKm() : 0.0;
        double subtotalSeguro = subtotal != null ? subtotal : 0.0;

        if (empresa.getValorFreteGratis() != null && subtotalSeguro >= empresa.getValorFreteGratis()) {
            return 0.0;
        }

        double valor = taxaFixa + (distanciaKm * valorPorKm);

        if (valor < 0) {
            valor = 0;
        }

        return valor;
    }

    private String estimarPrazo(double distanciaKm) {
        if (distanciaKm <= 3) {
            return "20-30 min";
        }
        if (distanciaKm <= 5) {
            return "30-40 min";
        }
        if (distanciaKm <= 8) {
            return "40-55 min";
        }
        return "50-70 min";
    }

    private double calcularDistanciaKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private double arredondar(double valor) {
        return BigDecimal.valueOf(valor)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}