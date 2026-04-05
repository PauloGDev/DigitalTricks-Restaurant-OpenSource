package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.cart.model.Carrinho;
import com.ecommerce.digitaltricks.cart.model.CarrinhoItem;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.order.enums.TipoCupomDesconto;
import com.ecommerce.digitaltricks.order.enums.TipoEntrega;
import com.ecommerce.digitaltricks.order.enums.TipoPagamento;
import com.ecommerce.digitaltricks.order.model.Cupom;
import com.ecommerce.digitaltricks.order.model.CupomUso;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.shared.exception.CupomValidacaoException;
import com.ecommerce.digitaltricks.order.repository.CupomRepository;
import com.ecommerce.digitaltricks.order.repository.CupomUsoRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class CupomService {

    private final CupomRepository cupomRepository;
    private final CupomUsoRepository cupomUsoRepository;
    private final PedidoRepository pedidoRepository;

    public CupomService(CupomRepository cupomRepository, CupomUsoRepository cupomUsoRepository, PedidoRepository pedidoRepository) {
        this.cupomRepository = cupomRepository;
        this.cupomUsoRepository = cupomUsoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public void validarCupom(
            Cupom cupom,
            Cliente cliente,
            BigDecimal subtotal,
            Integer quantidadeItens,
            Boolean clienteJaTemPedidos,
            TipoEntrega tipoEntrega,
            TipoPagamento tipoPagamento
    ) {

        LocalDateTime agora = LocalDateTime.now();

        List<String> reasons = new ArrayList<>();
        Map<String, Object> details = new HashMap<>();

        if (cupom == null) {
            throw new CupomValidacaoException("CUPOM_INVALIDO", "Cupom inválido.");
        }

        if (!cupom.estaVigente(agora)) {
            reasons.add("Cupom expirado ou inativo.");
        }

        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            reasons.add("Carrinho vazio.");
        }

        if (cupom.getValorMinimoPedido() != null &&
                subtotal.compareTo(cupom.getValorMinimoPedido()) < 0) {
            reasons.add("Valor mínimo não atingido.");
        }

        if (cupom.getLimiteUsoTotal() != null &&
                cupom.getTotalUsado() != null &&
                cupom.getTotalUsado() >= cupom.getLimiteUsoTotal()) {
            reasons.add("Cupom esgotado.");
        }

        // 🔥 DIA DA SEMANA
        if (cupom.getDiasSemanaPermitidos() != null && !cupom.getDiasSemanaPermitidos().isBlank()) {
            String hoje = agora.getDayOfWeek().name();

            List<String> dias = Arrays.stream(cupom.getDiasSemanaPermitidos().split(","))
                    .map(String::trim)
                    .toList();

            if (!dias.contains(hoje)) {
                reasons.add("Cupom não válido para hoje.");
            }
        }

// 🔥 HORÁRIO
        if (cupom.getHorarioInicio() != null && cupom.getHorarioFim() != null) {
            LocalTime agoraHora = agora.toLocalTime();
            if (agoraHora.isBefore(cupom.getHorarioInicio()) || agoraHora.isAfter(cupom.getHorarioFim())) {
                reasons.add("Cupom fora do horário permitido.");
            }
        }

// 🔥 TIPO ENTREGA
        if (cupom.getTipoEntregaPermitida() != null) {
            if (tipoEntrega == null || cupom.getTipoEntregaPermitida() != tipoEntrega) {
                reasons.add("Cupom não válido para este tipo de entrega.");
            }
        }

// 🔥 TIPO PAGAMENTO
        if (cupom.getTipoPagamentoPermitido() != null) {
            if (tipoPagamento == null || cupom.getTipoPagamentoPermitido() != tipoPagamento) {
                reasons.add("Cupom não válido para este tipo de pagamento.");
            }
        }

        // 🔥 USO POR CLIENTE
        if (cliente != null && cupom.getLimiteUsoPorUsuario() != null) {
            long usos = cupomUsoRepository.countByCupomIdAndClienteId(cupom.getId(), cliente.getId());

            if (usos >= cupom.getLimiteUsoPorUsuario()) {
                reasons.add("Limite de uso atingido.");
            }
        }

        if (Boolean.TRUE.equals(cupom.getApenasPrimeiraCompra())
                && Boolean.TRUE.equals(clienteJaTemPedidos)) {
            reasons.add("Apenas primeira compra.");
        }

        if (!reasons.isEmpty()) {
            throw new CupomValidacaoException(
                    "REQUISITOS_NAO_ATENDIDOS",
                    reasons.get(0),
                    reasons,
                    details
            );
        }
    }

    public BigDecimal calcularDesconto(Cupom cupom, BigDecimal subtotal) {
        if (cupom == null || subtotal == null) return BigDecimal.ZERO;

        BigDecimal desconto;

        if (cupom.getTipoDesconto() == TipoCupomDesconto.PERCENTUAL) {
            desconto = subtotal
                    .multiply(cupom.getValorDesconto())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (cupom.getValorMaximoDesconto() != null &&
                    desconto.compareTo(cupom.getValorMaximoDesconto()) > 0) {
                desconto = cupom.getValorMaximoDesconto();
            }
        } else {
            desconto = cupom.getValorDesconto();
        }

        if (desconto.compareTo(subtotal) > 0) desconto = subtotal;
        if (desconto.compareTo(BigDecimal.ZERO) < 0) desconto = BigDecimal.ZERO;

        return desconto;
    }

    public void aplicarNoCarrinho(
            Carrinho carrinho,
            Cupom cupom,
            Cliente cliente,
            TipoEntrega tipoEntrega,
            TipoPagamento tipoPagamento
    ) {

        carrinho.calcularTotal();

        BigDecimal subtotal = carrinho.getSubtotal();

        int quantidadeItens = carrinho.getItens().stream()
                .map(CarrinhoItem::getQuantidade)
                .mapToInt(Integer::intValue)
                .sum();

        boolean clienteJaTemPedidos = cliente != null
                && pedidoRepository.existsByClienteId(cliente.getId());

        validarCupom(
                cupom,
                cliente,
                subtotal,
                quantidadeItens,
                clienteJaTemPedidos,
                tipoEntrega,
                tipoPagamento
        );

        BigDecimal desconto = calcularDesconto(cupom, subtotal);

        carrinho.setCupom(cupom);
        carrinho.setDescontoCupom(desconto);
        carrinho.calcularTotal();
    }

    public void removerDoCarrinho(Carrinho carrinho) {
        carrinho.setCupom(null);
        carrinho.setDescontoCupom(BigDecimal.ZERO);
        carrinho.setMotivoCupomInvalido(null);
        carrinho.setCodigoErroCupom(null);
        carrinho.calcularTotal();
    }

    public void registrarUso(Cupom cupom, Cliente cliente, Pedido pedido) {
        CupomUso uso = new CupomUso(cupom, cliente, pedido);
        cupomUsoRepository.save(uso);

        int atual = cupom.getTotalUsado() != null ? cupom.getTotalUsado() : 0;
        cupom.setTotalUsado(atual + 1);
        cupomRepository.save(cupom);
    }
}