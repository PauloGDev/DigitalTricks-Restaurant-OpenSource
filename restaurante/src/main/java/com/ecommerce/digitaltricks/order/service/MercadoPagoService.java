package com.ecommerce.digitaltricks.order.service;

import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MercadoPagoService {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoService.class);
    private static final String BASE = "https://api.mercadopago.com";

    private final RestTemplate rest;

    @Value("${mp.accessToken}")
    private String accessToken;

    public MercadoPagoService(RestTemplateBuilder builder) {
        // Timeouts (ms)
        int connectTimeoutMs = (int) Duration.ofSeconds(8).toMillis();
        int responseTimeoutMs = (int) Duration.ofSeconds(20).toMillis();

        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(connectTimeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS)
                .setResponseTimeout(responseTimeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS)
                .build();

        CloseableHttpClient client = HttpClients.custom()
                .setDefaultRequestConfig(config)
                .build();

        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(client);

        this.rest = builder
                .requestFactory(() -> factory)
                .build();
    }

    private HttpHeaders headers(String idempotencyKey) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setAccept(List.of(MediaType.APPLICATION_JSON));
        h.setBearerAuth(accessToken);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            h.set("X-Idempotency-Key", idempotencyKey);
        }
        return h;
    }

    private RuntimeException mpError(String action, HttpStatusCode status, String body) {
        String msg = "MercadoPago API error (" + action + "): HTTP " + status + " - " + body;
        return new RuntimeException(msg);
    }

    @SuppressWarnings("rawtypes")
    private Map<String, Object> exchangeForMap(String url, HttpMethod method, Object requestBody, String idemKey, String action) {
        try {
            HttpEntity<?> req = (requestBody == null)
                    ? new HttpEntity<>(headers(idemKey))
                    : new HttpEntity<>(requestBody, headers(idemKey));

            ResponseEntity<Map> resp = rest.exchange(url, method, req, Map.class);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw mpError(action, resp.getStatusCode(), String.valueOf(resp.getBody()));
            }

            // Converte para Map<String, Object>
            // (o Jackson já devolve Map com Object normalmente)
            return (Map<String, Object>) resp.getBody();

        } catch (HttpStatusCodeException e) {
            throw mpError(action, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Falha de rede ao chamar MercadoPago (" + action + "): " + e.getMessage(), e);
        } catch (RestClientException e) {
            throw new RuntimeException("Erro ao chamar MercadoPago (" + action + "): " + e.getMessage(), e);
        }
    }

    /**
     * PIX
     * Retorno útil:
     * - id
     * - status
     * - point_of_interaction.transaction_data.qr_code
     * - point_of_interaction.transaction_data.qr_code_base64
     * - point_of_interaction.transaction_data.ticket_url
     */
    public Map<String, Object> criarPix(String externalReference, String description,
                                        BigDecimal value, String email, String cpf) {

        if (externalReference == null || externalReference.isBlank()) throw new IllegalArgumentException("externalReference obrigatório");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("description obrigatória");
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("value deve ser > 0");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email obrigatório");
        if (cpf == null || cpf.isBlank()) throw new IllegalArgumentException("cpf obrigatório");

        String cpfDigits = cpf.replaceAll("\\D", "");

        Map<String, Object> payer = Map.of(
                "email", email,
                "identification", Map.of("type", "CPF", "number", cpfDigits)
        );

        Map<String, Object> body = new HashMap<>();
        body.put("transaction_amount", value.setScale(2, RoundingMode.HALF_UP));
        body.put("description", description);
        body.put("payment_method_id", "pix");
        body.put("payer", payer);
        body.put("external_reference", externalReference);

        String idemKey = "pix-" + externalReference + "-" + System.currentTimeMillis();

        log.info("Criando PIX MP externalReference={} amount={} payerEmail={}", externalReference, value, email);

        return exchangeForMap(
                BASE + "/v1/payments",
                HttpMethod.POST,
                body,
                idemKey,
                "criarPix"
        );
    }
    /**
     * CARTÃO (Checkout API)
     * IMPORTANTE: token vem do frontend (MercadoPago.js / Bricks).
     */
    public Map<String, Object> criarCartao(String externalReference, String description, double value,
                                           String token, int installments, String paymentMethodId,
                                           String email, String cpf) {

        if (externalReference == null || externalReference.isBlank()) throw new IllegalArgumentException("externalReference obrigatório");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("description obrigatória");
        if (value <= 0) throw new IllegalArgumentException("value deve ser > 0");
        if (token == null || token.isBlank()) throw new IllegalArgumentException("token obrigatório");
        if (installments < 1) throw new IllegalArgumentException("installments deve ser >= 1");
        if (paymentMethodId == null || paymentMethodId.isBlank()) throw new IllegalArgumentException("paymentMethodId obrigatório");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email obrigatório");
        if (cpf == null || cpf.isBlank()) throw new IllegalArgumentException("cpf obrigatório");

        Map<String, Object> payer = Map.of(
                "email", email,
                "identification", Map.of("type", "CPF", "number", cpf)
        );

        Map<String, Object> body = new HashMap<>();
        body.put("transaction_amount", value);
        body.put("description", description);
        body.put("token", token);
        body.put("installments", installments);
        body.put("payment_method_id", paymentMethodId);
        body.put("payer", payer);
        body.put("external_reference", externalReference);

        String idemKey = "card-" + externalReference;

        log.info("Criando CARTÃO MercadoPago externalReference={} value={} installments={}", externalReference, value, installments);

        return exchangeForMap(
                BASE + "/v1/payments",
                HttpMethod.POST,
                body,
                idemKey,
                "criarCartao"
        );
    }

    /**
     * Consulta pagamento (webhook / status).
     */
    public Map<String, Object> consultarPagamento(String paymentId) {
        if (paymentId == null || paymentId.isBlank()) throw new IllegalArgumentException("paymentId obrigatório");

        return exchangeForMap(
                BASE + "/v1/payments/" + paymentId,
                HttpMethod.GET,
                null,
                null,
                "consultarPagamento"
        );
    }
}