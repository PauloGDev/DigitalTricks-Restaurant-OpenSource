package com.ecommerce.digitaltricks.integration;

import com.ecommerce.digitaltricks.integration.dto.ViaCepResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Component
public class ViaCepClient {

    private final RestClient restClient;

    public ViaCepClient() {
        this.restClient = RestClient.builder()
                .baseUrl("https://viacep.com.br/ws")
                .build();
    }

    public ViaCepResponse buscarCep(String cep) {
        String cepLimpo = limparCep(cep);

        if (cepLimpo.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP inválido.");
        }

        ViaCepResponse response = restClient.get()
                .uri("/{cep}/json/", cepLimpo)
                .retrieve()
                .body(ViaCepResponse.class);

        if (response == null || response.isErro()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CEP não encontrado.");
        }

        return response;
    }

    private String limparCep(String cep) {
        return cep == null ? "" : cep.replaceAll("\\D", "");
    }
}