package com.ecommerce.digitaltricks.bot.service;

import com.ecommerce.digitaltricks.bot.model.NumeroWhatsapp;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class WhatsAppSenderService {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://graph.facebook.com")
            .build();

    public String sendText(NumeroWhatsapp numero, String to, String message) {
        return webClient.post()
                .uri("/v19.0/{phoneNumberId}/messages", numero.getPhoneNumberId())
                .header("Authorization", "Bearer " + numero.getToken())
                .bodyValue(Map.of(
                        "messaging_product", "whatsapp",
                        "to", to,
                        "type", "text",
                        "text", Map.of("body", message)
                ))
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }
}
