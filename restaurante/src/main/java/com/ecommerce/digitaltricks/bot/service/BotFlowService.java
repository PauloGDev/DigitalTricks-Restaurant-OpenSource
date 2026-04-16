package com.ecommerce.digitaltricks.bot.service;

import com.ecommerce.digitaltricks.bot.enums.EstadoBot;
import com.ecommerce.digitaltricks.bot.model.Conversa;
import com.ecommerce.digitaltricks.bot.model.NumeroWhatsapp;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import org.springframework.stereotype.Service;

@Service
public class BotFlowService {

    private final WhatsAppSenderService sender;
    private final ConversationService conversationService;
    private final PedidoRepository pedidoRepository;

    public BotFlowService(
            WhatsAppSenderService sender,
            ConversationService conversationService,
            PedidoRepository pedidoRepository
    ) {
        this.sender = sender;
        this.conversationService = conversationService;
        this.pedidoRepository = pedidoRepository;
    }

    public void handle(Conversa conversa, String texto, NumeroWhatsapp numero) {
        String textoNormalizado = texto == null ? "" : texto.trim();

        if (conversa.getEstado() == null) {
            conversa.setEstado(EstadoBot.INICIO);
        }

        switch (conversa.getEstado()) {
            case INICIO -> iniciar(conversa, numero);
            case MENU_PRINCIPAL -> menu(conversa, textoNormalizado, numero);
            case AGUARDANDO_HUMANO -> {
                sender.sendText(numero, conversa.getTelefone(),
                        "👨‍💼 Você já está sendo atendido por um humano.");
            }
            default -> iniciar(conversa, numero);
        }

        conversationService.save(conversa);
    }

    private void iniciar(Conversa c, NumeroWhatsapp numero) {
        sender.sendText(numero, c.getTelefone(),
                "👋 Olá! Como posso ajudar?\n\n" +
                        "1️⃣ Ver meu pedido\n" +
                        "2️⃣ Falar com atendente");

        c.setEstado(EstadoBot.MENU_PRINCIPAL);
    }

    private void menu(Conversa c, String texto, NumeroWhatsapp numero) {
        switch (texto) {
            case "1" -> verPedidoAtual(c, numero);
            case "2" -> chamarAtendente(c, numero);
            default -> sender.sendText(numero, c.getTelefone(),
                    "Não entendi 🤔\n\nDigite:\n1️⃣ Ver pedido\n2️⃣ Falar com atendente");
        }
    }

    private void verPedidoAtual(Conversa c, NumeroWhatsapp numero) {
        Pedido pedido = pedidoRepository
                .findTopByTelefoneAndEmpresaIdOrderByDataDesc(c.getTelefone(), c.getEmpresa().getId());

        if (pedido == null) {
            sender.sendText(numero, c.getTelefone(), "📭 Você não possui pedidos.");
            return;
        }

        sender.sendText(numero, c.getTelefone(),
                "📦 Pedido #" + pedido.getId() +
                        "\nStatus: " + pedido.getStatus() +
                        "\nTotal: R$ " + pedido.getTotal());
    }

    private void chamarAtendente(Conversa c, NumeroWhatsapp numero) {
        c.setEstado(EstadoBot.AGUARDANDO_HUMANO);

        sender.sendText(numero, c.getTelefone(),
                "👨‍💼 Chamando atendente...\nAguarde um momento.");
    }
}