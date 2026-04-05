package com.ecommerce.digitaltricks.service.bot;

import com.ecommerce.digitaltricks.model.Conversa;
import com.ecommerce.digitaltricks.model.MensagemProcessada;
import com.ecommerce.digitaltricks.model.NumeroWhatsapp;
import com.ecommerce.digitaltricks.repository.bot.MensagemProcessadaRepository;
import com.ecommerce.digitaltricks.repository.bot.NumeroWhatsappRepository;
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

    private void processarMensagem(
            Map<String, Object> msg,
            NumeroWhatsapp numero,
            Long empresaId
    ) {
        String messageId = (String) msg.get("id");
        if (messageId == null || messageId.isBlank()) return;

        if (mensagemRepository.existsById(messageId)) return;

        String telefone = (String) msg.get("from");
        if (telefone == null || telefone.isBlank()) return;

        telefone = telefone.replaceAll("[^0-9]", "");
        if (telefone.length() < 10) return;

        Map<String, Object> textObj = (Map<String, Object>) msg.get("text");
        if (textObj == null || !textObj.containsKey("body")) return;

        String texto = (String) textObj.get("body");
        if (texto == null || texto.isBlank()) return;

        mensagemRepository.save(new MensagemProcessada(messageId));

        Conversa conversa = conversationService.findOrCreate(telefone, empresaId);
        botFlowService.handle(conversa, texto, numero);
    }

    public void processWebhook(Map<String, Object> payload) {
        try {
            if (payload == null || !payload.containsKey("entry")) return;

            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries == null || entries.isEmpty()) return;

            Map<String, Object> entry = entries.get(0);

            List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
            if (changes == null || changes.isEmpty()) return;

            Map<String, Object> change = changes.get(0);
            Map<String, Object> value = (Map<String, Object>) change.get("value");
            if (value == null) return;

            List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
            if (messages == null || messages.isEmpty()) return;

            Map<String, Object> metadata = (Map<String, Object>) value.get("metadata");
            if (metadata == null) return;

            String phoneNumberId = (String) metadata.get("phone_number_id");
            if (phoneNumberId == null || phoneNumberId.isBlank()) return;

            NumeroWhatsapp numero = numeroWhatsappRepository
                    .findByPhoneNumberId(phoneNumberId)
                    .orElseThrow(() -> new RuntimeException("Número não configurado"));

            Long empresaId = numero.getEmpresa().getId();

            for (Map<String, Object> msg : messages) {
                processarMensagem(msg, numero, empresaId);
            }

        } catch (Exception e) {
            log.error("Erro webhook WhatsApp", e);
        }
    }
}