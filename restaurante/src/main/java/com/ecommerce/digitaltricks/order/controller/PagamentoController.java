package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.order.enums.TipoPagamento;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.model.ClientePerfil;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.service.MercadoPagoService;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@RestController
@RequestMapping("/api/pagamentos")
@CrossOrigin(origins="*")
public class PagamentoController {

    private final PedidoRepository pedidoRepository;
    private final EmpresaRepository empresaRepository;
    private final ClienteRepository clienteRepository;
    private final MercadoPagoService mercadoPagoService;

    public PagamentoController(
            PedidoRepository pedidoRepository,
            EmpresaRepository empresaRepository,
            ClienteRepository clienteRepository,
            MercadoPagoService mercadoPagoService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.empresaRepository = empresaRepository;
        this.clienteRepository = clienteRepository;
        this.mercadoPagoService = mercadoPagoService;
    }

    private Cliente getCliente(Authentication auth) {
        String telefone = auth.getName();

        return clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    /**
     * Resolve o token MP do restaurante atraves da empresa do pedido.
     */
    private String getEmpresaToken(Pedido pedido) {
        if (pedido == null || pedido.getEmpresa() == null) return null;
        Empresa empresa = empresaRepository.findById(pedido.getEmpresa().getId())
                .orElse(null);
        if (empresa == null) return null;
        return empresa.getMercadoPagoAccessToken();
    }

    @PostMapping("/{pedidoId}/pix")
    public ResponseEntity<?> pagarPix(
            @PathVariable Long pedidoId,
            Authentication auth
    ) {

        Cliente cliente = getCliente(auth);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // 🔥 valida dono do pedido
        if (pedido.getCliente() == null ||
                !pedido.getCliente().getId().equals(cliente.getId())) {
            return ResponseEntity.status(403).body(Map.of("erro", "Acesso negado"));
        }

        if (pedido.getTipoPagamento() != TipoPagamento.PIX) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erro", "Este pedido não está configurado para PIX."
            ));
        }

        ClientePerfil perfil = cliente.getPerfil();
        if (perfil == null) throw new RuntimeException("Perfil não encontrado");

        String cpf = pedido.getCpf();
        if (cpf == null || cpf.isBlank()) throw new RuntimeException("CPF obrigatório para pagamento via PIX.");

        BigDecimal value = pedido.getTotal().setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> payment = mercadoPagoService.criarPix(
                getEmpresaToken(pedido),
                String.valueOf(pedido.getId()),
                "Pedido #" + pedido.getId(),
                value,
                perfil.getEmail(),
                cpf
        );

        String mpPaymentId = String.valueOf(payment.get("id"));
        String status = String.valueOf(payment.get("status"));

        Map<String, Object> poi = (Map<String, Object>) payment.get("point_of_interaction");
        Map<String, Object> tx = poi != null ? (Map<String, Object>) poi.get("transaction_data") : null;

        String qrCode = tx != null ? (String) tx.get("qr_code") : null;
        String qrBase64 = tx != null ? (String) tx.get("qr_code_base64") : null;
        String ticketUrl = tx != null ? (String) tx.get("ticket_url") : null;

        pedido.setTipoPagamento(TipoPagamento.PIX);
        pedido.setInvoiceUrl(ticketUrl);
        pedido.setPixPayload(qrCode);
        pedido.setPixQrCodeBase64(qrBase64);
        pedido.setMpPaymentId(mpPaymentId);
        pedido.setMpStatus(status);
        pedido.setPaymentProvider("MERCADO_PAGO");

        pedidoRepository.save(pedido);

        return ResponseEntity.ok(Map.of(
                "pedidoId", pedido.getId(),
                "mpPaymentId", mpPaymentId,
                "status", status,
                "invoiceUrl", ticketUrl,
                "pixPayload", qrCode,
                "pixQrCodeBase64", qrBase64
        ));
    }

    public record CartaoDTO(String token, Integer installments, String paymentMethodId) {}

    @PostMapping("/{pedidoId}/cartao")
    public ResponseEntity<?> pagarCartao(
            @PathVariable Long pedidoId,
            Authentication auth,
            @RequestBody CartaoDTO cartao
    ) {

        if (cartao == null || cartao.token() == null || cartao.token().isBlank()
                || cartao.paymentMethodId() == null || cartao.paymentMethodId().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erro", "token e paymentMethodId são obrigatórios"));
        }

        Cliente cliente = getCliente(auth);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (pedido.getCliente() == null ||
                !pedido.getCliente().getId().equals(cliente.getId())) {
            return ResponseEntity.status(403).body(Map.of("erro", "Acesso negado"));
        }

        if (pedido.getTipoPagamento() != TipoPagamento.CREDIT_CARD) {
            return ResponseEntity.badRequest().body(Map.of(
                    "erro", "Este pedido não está configurado para Cartão."
            ));
        }

        ClientePerfil perfil = cliente.getPerfil();
        if (perfil == null) throw new RuntimeException("Perfil não encontrado");

        // CPF: tenta do pedido; se nao vier, usa placeholder (o brick do MP ja valida)
        String cpf = pedido.getCpf();
        if (cpf == null || cpf.isBlank()) {
            cpf = "00000000000"; // placeholder; validaçao real feita pelo Brick MP
        }

        double value = pedido.getTotal().setScale(2, RoundingMode.HALF_UP).doubleValue();

        Map<String, Object> payment = mercadoPagoService.criarCartao(
                getEmpresaToken(pedido),
                String.valueOf(pedido.getId()),
                "Pedido #" + pedido.getId(),
                value,
                cartao.token(),
                cartao.installments() != null ? cartao.installments() : 1,
                cartao.paymentMethodId(),
                perfil.getEmail(),
                cpf
        );

        String mpPaymentId = String.valueOf(payment.get("id"));
        String status = String.valueOf(payment.get("status"));

        pedido.setTipoPagamento(TipoPagamento.CREDIT_CARD);
        pedido.setMpPaymentId(mpPaymentId);
        pedido.setMpStatus(status);
        pedido.setPaymentProvider("MERCADO_PAGO");

        pedidoRepository.save(pedido);

        return ResponseEntity.ok(Map.of(
                "pedidoId", pedido.getId(),
                "mpPaymentId", mpPaymentId,
                "status", status
        ));
    }
}