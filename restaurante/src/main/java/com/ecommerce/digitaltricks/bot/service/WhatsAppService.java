package com.ecommerce.digitaltricks.bot.service;

import com.ecommerce.digitaltricks.bot.model.Conversa;
import com.ecommerce.digitaltricks.bot.model.MensagemProcessada;
import com.ecommerce.digitaltricks.bot.model.NumeroWhatsapp;
import com.ecommerce.digitaltricks.bot.repository.MensagemProcessadaRepository;
import com.ecommerce.digitaltricks.bot.repository.NumeroWhatsappRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    private final ConversationService conversationService;
    private final BotFlowService botFlowService;
    private final NumeroWhatsappRepository numeroWhatsappRepository;
    private final MensagemProcessadaRepository mensagemRepository;

    public WhatsAppService(
            ConversationService conversationService,
            BotFlowService botFlowService,
            NumeroWhatsappRepository numeroWhatsappRepository,
            MensagemProcessadaRepository mensagemRepository
    ) {
        this.conversationService = conversationService;
        this.botFlowService = botFlowService;
        this.numeroWhatsappRepository = numeroWhatsappRepository;
        this.mensagemRepository = mensagemRepository;
    }

    private boolean marcarComoProcessada(String messageId) {
        try {
            mensagemRepository.saveAndFlush(new MensagemProcessada(messageId));
            return true;
        } catch (Exception e) {
            log.info("Mensagem duplicada ou já processada: {}", messageId);
            return false;
        }
    }

    private void processarMensagem(Map<String, Object> msg, NumeroWhatsapp numero, Long empresaId) {
        String messageId = (String) msg.get("id");
        if (messageId == null || messageId.isBlank()) return;

        if (!marcarComoProcessada(messageId)) return;

        String telefone = (String) msg.get("from");
        if (telefone == null || telefone.isBlank()) return;

        telefone = telefone.replaceAll("[^0-9]", "");
        if (telefone.length() < 10) return;

        String tipo = (String) msg.get("type");
        if (!"text".equals(tipo)) {
            log.info("Tipo de mensagem não suportado: {}", tipo);
            return;
        }

        Map<String, Object> textObj = (Map<String, Object>) msg.get("text");
        if (textObj == null || !textObj.containsKey("body")) return;

        String texto = (String) textObj.get("body");
        if (texto == null || texto.isBlank()) return;

        Conversa conversa = conversationService.findOrCreate(telefone, empresaId);
        botFlowService.handle(conversa, texto, numero);
    }

    public void processWebhook(Map<String, Object> payload) {
        try {
            if (payload == null || !payload.containsKey("entry")) return;

            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries == null) return;

            for (Map<String, Object> entry : entries) {
                List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
                if (changes == null) continue;

                for (Map<String, Object> change : changes) {
                    Map<String, Object> value = (Map<String, Object>) change.get("value");
                    if (value == null) continue;

                    Map<String, Object> metadata = (Map<String, Object>) value.get("metadata");
                    if (metadata == null) continue;

                    String phoneNumberId = (String) metadata.get("phone_number_id");
                    if (phoneNumberId == null || phoneNumberId.isBlank()) continue;

                    NumeroWhatsapp numero = numeroWhatsappRepository
                            .findByPhoneNumberId(phoneNumberId)
                            .orElse(null);

                    if (numero == null || Boolean.FALSE.equals(numero.getAtivo())) {
                        log.warn("Número não configurado ou inativo: {}", phoneNumberId);
                        continue;
                    }

                    Long empresaId = numero.getEmpresa().getId();

                    List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                    if (messages == null || messages.isEmpty()) continue;

                    for (Map<String, Object> msg : messages) {
                        processarMensagem(msg, numero, empresaId);
                    }
                }
            }

        } catch (Exception e) {
            log.error("Erro webhook WhatsApp", e);
        }
    }
}