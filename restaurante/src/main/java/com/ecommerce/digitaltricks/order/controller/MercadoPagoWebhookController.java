package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.order.enums.MotivoCancelamento;
import com.ecommerce.digitaltricks.order.enums.OrigemCancelamento;
import com.ecommerce.digitaltricks.order.enums.StatusPagamento;
import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.service.MercadoPagoService;
import com.ecommerce.digitaltricks.order.service.PedidoStatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/webhooks/mercadopago")
public class MercadoPagoWebhookController {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoWebhookController.class);

    private final MercadoPagoService mercadoPagoService;
    private final PedidoRepository pedidoRepository;
    private final PedidoStatusService pedidoStatusService;
    private final EmpresaRepository empresaRepository;

    public MercadoPagoWebhookController(
            MercadoPagoService mercadoPagoService,
            PedidoRepository pedidoRepository,
            PedidoStatusService pedidoStatusService,
            EmpresaRepository empresaRepository
    ) {
        this.mercadoPagoService = mercadoPagoService;
        this.pedidoRepository = pedidoRepository;
        this.pedidoStatusService = pedidoStatusService;
        this.empresaRepository = empresaRepository;
    }

    @PostMapping
    public ResponseEntity<String> receber(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String id,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        try {
            String paymentId = extrairPaymentId(topic, type, id, body);

            if (paymentId == null || paymentId.isBlank()) {
                log.warn("Webhook MP: sem paymentId. topic={} type={} id={}", topic, type, id);
                return ResponseEntity.ok("ok");
            }

            log.info("Webhook MP recebido. paymentId={}", paymentId);

            Optional<Pedido> optPedido = encontrarPedidoPorPaymentId(paymentId);

            if (optPedido.isPresent()) {
                Pedido ped = optPedido.get();

                // Evita processamento duplicado de notificacoes MP
                if (ped.getMpPaymentId() != null && ped.getMpPaymentId().equals(paymentId)
                        && ped.getStatus() != StatusPedido.AGUARDANDO_PAGAMENTO
                        && ped.getStatus() != StatusPedido.RECEBIDO) {
                    log.info("Pedido {} ja processado MP paymentId={}, status={}", ped.getId(), paymentId, ped.getStatus());
                    return ResponseEntity.ok("ok");
                }

                String token = ped.getEmpresa() != null
                        ? empresaRepository.findById(ped.getEmpresa().getId())
                                .map(e -> e.getMercadoPagoAccessToken()).orElse(null)
                        : null;

                Map<String, Object> payment = mercadoPagoService.consultarPagamento(token, paymentId);
                String mpStatus = asString(payment.get("status"));

                ped.setMpPaymentId(paymentId);
                ped.setMpStatus(mpStatus);
                ped.setPaymentProvider("MERCADO_PAGO");
                ped.setStatusPagamento(mapearStatusPagamento(mpStatus));

                StatusPedido novoStatus = mapearStatusPedido(mpStatus, ped);
                if (novoStatus != null && ped.getStatus() != novoStatus) {
                    if (novoStatus == StatusPedido.CANCELADO) {
                        ped = pedidoStatusService.cancelar(ped,
                                MotivoCancelamento.PAGAMENTO_NAO_APROVADO,
                                OrigemCancelamento.GATEWAY_PAGAMENTO);
                    } else {
                        ped = pedidoStatusService.alterarStatus(ped, novoStatus);
                    }
                    log.info("Pedido {} -> {} (mpStatus={})", ped.getId(), ped.getStatus(), mpStatus);
                } else {
                    pedidoRepository.save(ped);
                }
            }

            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Erro no webhook MP: {}", e.getMessage(), e);
            return ResponseEntity.ok("ok");
        }
    }

    private Optional<Pedido> encontrarPedidoPorPaymentId(String paymentId) {
        // 1. Ja temos o pedido mapeado por nosso lado
        var byPayment = pedidoRepository.findByMpPaymentId(paymentId);
        if (byPayment.isPresent()) return byPayment;

        // 2. Tenta consultar o MP para pegar o external_reference
        try {
            Map<String, Object> payment = mercadoPagoService.consultarPagamento(paymentId);
            String externalRef = asString(payment.get("external_reference"));
            if (externalRef != null && !externalRef.isBlank()) {
                try {
                    return pedidoRepository.findById(Long.valueOf(externalRef));
                } catch (NumberFormatException ignored) {}
            }
        } catch (Exception e) {
            // Notificacao de teste do MP ou pagamento inexistente - ignorar
            log.info("Webhook MP: pagamento {} nao encontrado. Ignorando.", paymentId);
        }
        return Optional.empty();
    }

    @SuppressWarnings("unchecked")
    private String extrairPaymentId(String topic, String type, String id, Map<String, Object> body) {
        if (topic != null && topic.equalsIgnoreCase("payment") && id != null && !id.isBlank()) return id;
        if (type != null && type.equalsIgnoreCase("payment") && id != null && !id.isBlank()) return id;
        if (body == null || body.isEmpty()) return null;

        Object dataObj = body.get("data");
        if (dataObj instanceof Map<?, ?> dataMap && dataMap.get("id") != null)
            return String.valueOf(dataMap.get("id"));

        Object idDirect = body.get("id");
        if (idDirect != null) return String.valueOf(idDirect);
        return null;
    }

    private StatusPagamento mapearStatusPagamento(String mpStatus) {
        if (mpStatus == null) return StatusPagamento.PENDENTE;
        return switch (mpStatus.toLowerCase()) {
            case "approved" -> StatusPagamento.APROVADO;
            case "pending", "in_process", "in_mediation" -> StatusPagamento.PROCESSANDO;
            case "rejected" -> StatusPagamento.RECUSADO;
            case "cancelled", "canceled" -> StatusPagamento.CANCELADO;
            case "refunded" -> StatusPagamento.REEMBOLSADO;
            case "charged_back" -> StatusPagamento.ESTORNADO;
            default -> StatusPagamento.PENDENTE;
        };
    }

    private StatusPedido mapearStatusPedido(String mpStatus, Pedido pedido) {
        if (mpStatus == null) return null;
        return switch (mpStatus.toLowerCase()) {
            case "approved" -> pedido.getStatus() == StatusPedido.AGUARDANDO_PAGAMENTO
                    ? StatusPedido.RECEBIDO : null;
            case "cancelled", "canceled", "rejected", "refunded", "charged_back" -> StatusPedido.CANCELADO;
            default -> null;
        };
    }

    private String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }
}
