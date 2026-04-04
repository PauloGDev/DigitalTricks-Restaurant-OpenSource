package com.ecommerce.digitaltricks.integration;

import com.ecommerce.digitaltricks.integration.dto.CoordenadaDTO;
import com.ecommerce.digitaltricks.integration.dto.NominatimResult;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Component
public class NominatimClient {

    private final RestClient restClient;

    public NominatimClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader(HttpHeaders.USER_AGENT, "digitaltricks/1.0 contato@seudominio.com")
                .build();
    }

    public CoordenadaDTO geocodificar(String rua, String numero, String bairro, String cidade, String uf, String cep) {
        String q = montarEndereco(rua, numero, bairro, cidade, uf, cep);

        List<NominatimResult> resultados = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("format", "jsonv2")
                        .queryParam("limit", 1)
                        .queryParam("countrycodes", "br")
                        .queryParam("q", q)
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<NominatimResult>>() {});

        if (resultados == null || resultados.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível geocodificar o endereço.");
        }

        NominatimResult r = resultados.get(0);

        return new CoordenadaDTO(
                Double.valueOf(r.lat()),
                Double.valueOf(r.lon()),
                r.display_name()
        );
    }

    private String montarEndereco(String rua, String numero, String bairro, String cidade, String uf, String cep) {
        return String.join(", ",
                safe(rua),
                safe(numero),
                safe(bairro),
                safe(cidade),
                safe(uf),
                safe(cep),
                "Brasil"
        ).replaceAll("(,\\s*){2,}", ", ").trim();
    }

    private String safe(String s) {
        return s == null ? "" : s.trim();
    }
}