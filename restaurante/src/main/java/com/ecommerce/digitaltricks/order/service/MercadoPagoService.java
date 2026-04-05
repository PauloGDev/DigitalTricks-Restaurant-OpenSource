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
    private String fallbackAccessToken;

    public MercadoPagoService(RestTemplateBuilder builder) {
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

    private HttpHeaders headers(String accessToken, String idempotencyKey) {
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
        return new RuntimeException("MercadoPago API error (" + action + "): HTTP " + status + " - " + body);
    }

    private String resolveToken(String restauranteToken) {
        return (restauranteToken != null && !restauranteToken.isBlank())
                ? restauranteToken : fallbackAccessToken;
    }

    @SuppressWarnings("rawtypes")
    private Map<String, Object> exchangeForMap(String url, HttpMethod method, Object requestBody,
                                                String accessToken, String idemKey, String action) {
        try {
            HttpEntity<?> req = (requestBody == null)
                    ? new HttpEntity<>(headers(accessToken, idemKey))
                    : new HttpEntity<>(requestBody, headers(accessToken, idemKey));

            ResponseEntity<Map> resp = rest.exchange(url, method, req, Map.class);

            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                throw mpError(action, resp.getStatusCode(), String.valueOf(resp.getBody()));
            }

            return (Map<String, Object>) resp.getBody();

        } catch (HttpStatusCodeException e) {
            throw mpError(action, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Falha de rede ao chamar MercadoPago (" + action + "): " + e.getMessage(), e);
        } catch (RestClientException e) {
            throw new RuntimeException("Erro ao chamar MercadoPago (" + action + "): " + e.getMessage(), e);
        }
    }

    public Map<String, Object> criarPix(String externalReference, String description,
                                        BigDecimal value, String email, String cpf) {
        return criarPix(null, externalReference, description, value, email, cpf);
    }

    public Map<String, Object> criarPix(String restauranteAccessToken,
                                        String externalReference, String description,
                                        BigDecimal value, String email, String cpf) {
        if (externalReference == null || externalReference.isBlank()) throw new IllegalArgumentException("externalReference obrigatório");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("description obrigatória");
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("value deve ser > 0");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email obrigatório");
        if (cpf == null || cpf.isBlank()) throw new IllegalArgumentException("cpf obrigatório");

        String cpfDigits = cpf.replaceAll("\\D", "");
        String token = resolveToken(restauranteAccessToken);

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
                BASE + "/v1/payments", HttpMethod.POST, body, token, idemKey, "criarPix");
    }

    public Map<String, Object> criarCartao(String externalReference, String description, double value,
                                           String token, int installments, String paymentMethodId,
                                           String email, String cpf) {
        return criarCartao(null, externalReference, description, value, token, installments, paymentMethodId, email, cpf);
    }

    public Map<String, Object> criarCartao(String restauranteAccessToken,
                                           String externalReference, String description, double value,
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

        String accessToken = resolveToken(restauranteAccessToken);

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

        String idemKey = "card-" + externalReference + "-" + System.currentTimeMillis();
        log.info("Criando CARTÃO MercadoPago externalReference={} value={} installments={}", externalReference, value, installments);

        return exchangeForMap(
                BASE + "/v1/payments", HttpMethod.POST, body, accessToken, idemKey, "criarCartao");
    }

    public Map<String, Object> consultarPagamento(String paymentId) {
        return consultarPagamento(null, paymentId);
    }

    public Map<String, Object> consultarPagamento(String restauranteAccessToken, String paymentId) {
        if (paymentId == null || paymentId.isBlank()) throw new IllegalArgumentException("paymentId obrigatório");
        return exchangeForMap(BASE + "/v1/payments/" + paymentId, HttpMethod.GET, null,
                resolveToken(restauranteAccessToken), null, "consultarPagamento");
    }

    /**
     * Retorna o URL de autorização OAuth para conectar conta MP do restaurante.
     */
    public String getAuthorizationUrl(String empresaId) {
        String clientIdMp = getEnvOrConfig("MP_CLIENT_ID");
        String redirectUri = getEnvOrConfig("MP_REDIRECT_URI",
                "http://localhost:8080/api/empresas/mp/callback");
        return String.format(
                "https://auth.mercadopago.com/authorization?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
                clientIdMp, redirectUri, empresaId);
    }

    /**
     * Realiza OAuth com MercadoPago para conectar conta do restaurante.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> oauthToken(String authorizationCode) {
        String clientIdMp = getEnvOrConfig("MP_CLIENT_ID");
        String clientSecretMp = getEnvOrConfig("MP_CLIENT_SECRET");
        String redirectUri = getEnvOrConfig("MP_REDIRECT_URI",
                "http://localhost:8080/api/empresas/mp/callback");
        if (clientIdMp == null || clientSecretMp == null) {
            throw new RuntimeException("MP_CLIENT_ID e MP_CLIENT_SECRET devem ser configurados como variaveis de ambiente.");
        }
        try {
            Map<String, String> body = new HashMap<>();
            body.put("grant_type", "authorization_code");
            body.put("client_id", clientIdMp);
            body.put("client_secret", clientSecretMp);
            body.put("code", authorizationCode);
            body.put("redirect_uri", redirectUri);

            ResponseEntity<Map> response = rest.exchange(
                    "https://api.mercadopago.com/oauth/token", HttpMethod.POST,
                    new HttpEntity<>(body, MediaType.APPLICATION_JSON), Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Falha no OAuth MP: HTTP " + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Erro no OAuth do MercadoPago: " + e.getMessage(), e);
        }
    }

    /**
     * Renova o access token do restaurante usando o refresh token.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> refreshToken(String refreshToken) {
        String clientIdMp = getEnvOrConfig("MP_CLIENT_ID");
        String clientSecretMp = getEnvOrConfig("MP_CLIENT_SECRET");
        if (clientIdMp == null || clientSecretMp == null) {
            throw new RuntimeException("MP_CLIENT_ID e MP_CLIENT_SECRET devem ser configurados.");
        }
        try {
            Map<String, String> body = new HashMap<>();
            body.put("grant_type", "refresh_token");
            body.put("client_id", clientIdMp);
            body.put("client_secret", clientSecretMp);
            body.put("refresh_token", refreshToken);

            ResponseEntity<Map> response = rest.exchange(
                    "https://api.mercadopago.com/oauth/token", HttpMethod.POST,
                    new HttpEntity<>(body, MediaType.APPLICATION_JSON), Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Falha ao renovar token MP: HTTP " + response.getStatusCode());
            }
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao renovar token MercadoPago: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    public String getMpPublicKey(String accessToken) {
        try {
            ResponseEntity<Map> response = rest.exchange(BASE + "/users/me", HttpMethod.GET,
                    new HttpEntity<>(headers(accessToken, null)), Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Map<String, Object> creds = (Map<String, Object>) body.get("credentials");
                if (creds != null) {
                    Object pk = creds.get("public_key");
                    if (pk != null) return String.valueOf(pk);
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("Erro ao buscar public key MP: {}", e.getMessage());
            return null;
        }
    }

    private String getEnvOrConfig(String key) {
        String val = System.getenv(key);
        if (val == null) val = System.getProperty(key);
        return val;
    }

    private String getEnvOrConfig(String key, String defaultValue) {
        String val = getEnvOrConfig(key);
        return val != null ? val : defaultValue;
    }
}
