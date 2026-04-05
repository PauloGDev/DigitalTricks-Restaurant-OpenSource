package com.ecommerce.digitaltricks.order.controller;

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
    private final com.ecommerce.digitaltricks.admin.repository.EmpresaRepository empresaRepository;

    public MercadoPagoWebhookController(
            MercadoPagoService mercadoPagoService,
            PedidoRepository pedidoRepository,
            PedidoStatusService pedidoStatusService,
            com.ecommerce.digitaltricks.admin.repository.EmpresaRepository empresaRepository
    ) {
        this.mercadoPagoService = mercadoPagoService;
        this.pedidoRepository = pedidoRepository;
        this.pedidoStatusService = pedidoStatusService;
        this.empresaRepository = empresaRepository;
    }

    private String resolveEmpresaToken(String paymentId) {
        Optional<Pedido> opt = pedidoRepository.findByMpPaymentId(paymentId);
        if (opt.isPresent() && opt.get().getEmpresaId() != null) {
            var empOpt = empresaRepository.findById(opt.get().getEmpresaId());
            if (empOpt.isPresent()) {
                return empOpt.get().getMercadoPagoAccessToken();
            }
        }
        return null;
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
                log.warn("Webhook MP recebido sem paymentId. topic={} type={} id={} body={}", topic, type, id, body);
                return ResponseEntity.ok("ok");
            }

            log.info("Webhook MP recebido. paymentId={}", paymentId);

            String token = null;
            if (externalRef != null && !externalRef.isBlank()) {
                try {
                    Long pedidoId = Long.valueOf(externalRef);
                    var p = pedidoRepository.findById(pedidoId);
                    if (p.isPresent() && p.get().getEmpresaId() != null) {
                        var emp = empresaRepository.findById(p.get().getEmpresaId());
                        if (emp.isPresent()) {
                            token = emp.get().getMercadoPagoAccessToken();
                        }
                    }
                } catch (NumberFormatException ignored) {}
            }

            Map<String, Object> payment = mercadoPagoService.consultarPagamento(token, paymentId);

            String mpStatus = asString(payment.get("status"));
            String externalRef = asString(payment.get("external_reference"));

            Optional<Pedido> optPedido = Optional.empty();
            if (externalRef != null && !externalRef.isBlank()) {
                try {
                    Long pedidoId = Long.valueOf(externalRef);
                    optPedido = pedidoRepository.findById(pedidoId);
                } catch (NumberFormatException ignore) {
                }
            }

            if (optPedido.isEmpty()) {
                optPedido = pedidoRepository.findByMpPaymentId(paymentId);
            }

            if (optPedido.isEmpty()) {
                log.warn("Webhook MP: nenhum Pedido encontrado. paymentId={} external_reference={}", paymentId, externalRef);
                return ResponseEntity.ok("ok");
            }

            Pedido pedido = optPedido.get();

            pedido.setMpPaymentId(paymentId);
            pedido.setMpStatus(mpStatus);
            pedido.setPaymentProvider("MERCADO_PAGO");
            pedido.setStatusPagamento(mapearStatusPagamento(mpStatus));

            StatusPedido novoStatusPedido = mapearStatusPedido(mpStatus, pedido);

            if (novoStatusPedido != null && pedido.getStatus() != novoStatusPedido) {
                if (novoStatusPedido == StatusPedido.CANCELADO) {
                    pedido = pedidoStatusService.cancelar(
                            pedido,
                            MotivoCancelamento.PAGAMENTO_NAO_APROVADO,
                            OrigemCancelamento.GATEWAY_PAGAMENTO
                    );
                } else {
                    pedido = pedidoStatusService.alterarStatus(pedido, novoStatusPedido);
                }

                log.info("Pedido {} atualizado para {} por webhook MP (mpStatus={})",
                        pedido.getId(), pedido.getStatus(), mpStatus);
            } else {
                pedidoRepository.save(pedido);
                log.info("Pedido {} sem mudança de status operacional (status atual={}, mpStatus={})",
                        pedido.getId(), pedido.getStatus(), mpStatus);
            }

            return ResponseEntity.ok("ok");
        } catch (Exception e) {
            log.error("Erro processando webhook MP: {}", e.getMessage(), e);
            return ResponseEntity.ok("ok");
        }
    }

    @SuppressWarnings("unchecked")
    private String extrairPaymentId(String topic, String type, String id, Map<String, Object> body) {
        if ((topic != null && topic.equalsIgnoreCase("payment")) && id != null && !id.isBlank()) {
            return id;
        }

        if ((type != null && type.equalsIgnoreCase("payment")) && id != null && !id.isBlank()) {
            return id;
        }

        if (body == null || body.isEmpty()) return null;

        Object dataObj = body.get("data");
        if (dataObj instanceof Map<?, ?> dataMap) {
            Object dataId = dataMap.get("id");
            if (dataId != null) return String.valueOf(dataId);
        }

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
                    ? StatusPedido.RECEBIDO
                    : null;
            case "cancelled", "canceled", "rejected", "refunded", "charged_back" -> StatusPedido.CANCELADO;
            default -> null;
        };
    }

    private String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }
}