package com.ecommerce.digitaltricks.bot.service;

import com.ecommerce.digitaltricks.bot.model.NumeroWhatsapp;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class WhatsAppSenderService {

    public void sendText(NumeroWhatsapp numero, String to, String message) {
        WebClient.create("https://graph.facebook.com/v19.0/" + numero.getPhoneNumberId() + "/messages")
                .post()
                .header("Authorization", "Bearer " + numero.getToken())
                .bodyValue(Map.of(
                        "messaging_product", "whatsapp",
                        "to", to,
                        "type", "text",
                        "text", Map.of("body", message)
                ))
                .retrieve()
                .bodyToMono(String.class)
                .subscribe();
    }
}
