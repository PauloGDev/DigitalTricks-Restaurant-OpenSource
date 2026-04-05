package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import com.ecommerce.digitaltricks.order.dto.analytics.*;
import com.ecommerce.digitaltricks.shared.exception.ForbiddenException;
import com.ecommerce.digitaltricks.shared.exception.NotFoundException;
import com.ecommerce.digitaltricks.order.model.ItemPedido;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.order.model.PedidoStatusLog;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoStatusLogRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnalyticsService {

    private final PedidoRepository pedidoRepository;
    private final PedidoStatusLogRepository pedidoStatusLogRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public AnalyticsService(
            PedidoRepository pedidoRepository,
            PedidoStatusLogRepository pedidoStatusLogRepository,
            UsuarioRepository usuarioRepository,
            UsuarioEmpresaRepository usuarioEmpresaRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoStatusLogRepository = pedidoStatusLogRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    public AnalyticsDTO buscarAnalyticsEmpresa(Long empresaId, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        boolean possuiAcesso = usuarioEmpresaRepository
                .existsByUsuarioIdAndEmpresaIdAndAtivoTrue(usuario.getId(), empresaId);

        if (!possuiAcesso) {
            throw new ForbiddenException("Você não tem acesso a esta empresa");
        }

        return getAnalytics(empresaId);
    }

    public AnalyticsDTO getAnalytics(Long empresaId) {
        List<Pedido> pedidos = pedidoRepository.findByEmpresaId(empresaId);

        Map<String, BigDecimal> faturamentoPorDia = new HashMap<>();
        Map<String, Integer> pedidosPorDia = new HashMap<>();
        Map<Integer, Integer> pedidosPorHora = new HashMap<>();
        Map<String, Long> pagamentos = new HashMap<>();
        Map<String, Long> entregas = new HashMap<>();

        Map<Long, Integer> produtosCount = new HashMap<>();
        Map<Long, BigDecimal> produtosFaturamento = new HashMap<>();
        Map<Long, String> produtosNome = new HashMap<>();
        Map<Long, String> produtosImagem = new HashMap<>();

        Map<Long, Integer> pedidosPorCliente = new HashMap<>();

        Map<String, Integer> motivosCount = new LinkedHashMap<>();
        Map<String, BigDecimal> motivosValorPerdido = new LinkedHashMap<>();
        Map<String, Long> entregasCount = new LinkedHashMap<>();
        Map<String, BigDecimal> entregasReceita = new LinkedHashMap<>();

        BigDecimal faturamentoComCupom = BigDecimal.ZERO;
        BigDecimal descontoTotalCupons = BigDecimal.ZERO;
        int pedidosComCupom = 0;

        BigDecimal faturamentoPeriodoAtual = BigDecimal.ZERO;
        BigDecimal faturamentoPeriodoAnterior = BigDecimal.ZERO;

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioAtual = agora.minusDays(7);
        LocalDateTime inicioAnterior = agora.minusDays(14);

        BigDecimal faturamentoTotal = BigDecimal.ZERO;
        int totalPedidos = pedidos.size();

        int cancelados = 0;
        BigDecimal faturamentoPerdido = BigDecimal.ZERO;

        long somaTempoPreparo = 0;
        int totalComTempoPreparo = 0;

        long somaTempoEntrega = 0;
        int totalComTempoEntrega = 0;

        long somaTempoTotal = 0;
        int totalComTempoTotal = 0;

        for (Pedido p : pedidos) {
            BigDecimal total = p.getTotal() != null ? p.getTotal() : BigDecimal.ZERO;
            BigDecimal descontoCupom = p.getDescontoCupom() != null ? p.getDescontoCupom() : BigDecimal.ZERO;

            boolean pedidoCancelado = p.getStatus() == StatusPedido.CANCELADO;
            boolean pedidoValido =
                    p.getStatus() == StatusPedido.ENTREGUE ||
                            p.getStatus() == StatusPedido.RETIRADO;

            if (pedidoCancelado) {
                cancelados++;
                faturamentoPerdido = faturamentoPerdido.add(total);

                if (p.getMotivoCancelamento() != null) {
                    String motivo = p.getMotivoCancelamento().name();
                    motivosCount.merge(motivo, 1, Integer::sum);
                    motivosValorPerdido.merge(motivo, total, BigDecimal::add);
                }
            } else if (pedidoValido) {
                faturamentoTotal = faturamentoTotal.add(total);

                if (p.getTipoEntrega() != null) {
                    String tipo = p.getTipoEntrega().name();
                    entregasCount.merge(tipo, 1L, Long::sum);
                    entregasReceita.merge(tipo, total, BigDecimal::add);
                }
            }

            if (p.getData() != null) {
                String dia = p.getData().toLocalDate().toString();

                if (!pedidoCancelado) {
                    faturamentoPorDia.merge(dia, total, BigDecimal::add);
                }

                pedidosPorDia.merge(dia, 1, Integer::sum);

                int hora = p.getData().getHour();
                pedidosPorHora.merge(hora, 1, Integer::sum);

                if (!pedidoCancelado) {
                    if (!p.getData().isBefore(inicioAtual)) {
                        faturamentoPeriodoAtual = faturamentoPeriodoAtual.add(total);
                    } else if (!p.getData().isBefore(inicioAnterior) && p.getData().isBefore(inicioAtual)) {
                        faturamentoPeriodoAnterior = faturamentoPeriodoAnterior.add(total);
                    }
                }
            }

            if (p.getTipoPagamento() != null) {
                pagamentos.merge(p.getTipoPagamento().name(), 1L, Long::sum);
            }

            if (p.getTipoEntrega() != null) {
                entregas.merge(p.getTipoEntrega().name(), 1L, Long::sum);
            }

            if (pedidoValido && p.getCliente() != null && p.getCliente().getId() != null) {
                pedidosPorCliente.merge(p.getCliente().getId(), 1, Integer::sum);
            }

            if (p.getCupomCodigo() != null && !p.getCupomCodigo().isBlank()) {
                pedidosComCupom++;
                if (!pedidoCancelado) {
                    faturamentoComCupom = faturamentoComCupom.add(total);
                    descontoTotalCupons = descontoTotalCupons.add(descontoCupom);
                }
            }

            if (p.getItens() != null) {
                for (ItemPedido item : p.getItens()) {
                    Produto produto = item.getProduto();
                    if (produto == null || produto.getId() == null) {
                        continue;
                    }

                    Long produtoId = produto.getId();
                    int quantidade = item.getQuantidade();
                    BigDecimal faturamentoItem = item.getTotalItem() != null
                            ? item.getTotalItem()
                            : BigDecimal.ZERO;

                    produtosCount.merge(produtoId, quantidade, Integer::sum);
                    produtosFaturamento.merge(produtoId, faturamentoItem, BigDecimal::add);
                    produtosNome.putIfAbsent(produtoId, produto.getNome());
                    produtosImagem.putIfAbsent(produtoId, produto.getImagemUrl());
                }
            }

            List<PedidoStatusLog> logs = pedidoStatusLogRepository.findByPedidoIdOrderByDataAsc(p.getId());

            LocalDateTime emPreparo = firstLogTime(logs, StatusPedido.EM_PREPARO);
            LocalDateTime pronto = firstLogTime(logs, StatusPedido.PRONTO);

            if (emPreparo != null && pronto != null && !pronto.isBefore(emPreparo)) {
                somaTempoPreparo += Duration.between(emPreparo, pronto).toMinutes();
                totalComTempoPreparo++;
            }

            LocalDateTime saiuEntrega = firstLogTime(logs, StatusPedido.SAIU_PARA_ENTREGA);
            LocalDateTime entregue = firstLogTime(logs, StatusPedido.ENTREGUE);

            if (saiuEntrega != null && entregue != null && !entregue.isBefore(saiuEntrega)) {
                somaTempoEntrega += Duration.between(saiuEntrega, entregue).toMinutes();
                totalComTempoEntrega++;
            }

            // Tempo total: do RECEBIDO até status final (ENTREGUE/RETIRADO/CANCELADO)
            LocalDateTime recebido = firstLogTime(logs, StatusPedido.RECEBIDO);
            LocalDateTime statusFinal = firstLogTime(logs, p.getStatus());
            if (recebido != null && statusFinal != null && !statusFinal.isBefore(recebido)) {
                long mins = Duration.between(recebido, statusFinal).toMinutes();
                if (mins > 0 && mins < 300) {
                    somaTempoTotal += mins;
                    totalComTempoTotal++;
                }
            }
        }


        int clientesRecorrentes = (int) pedidosPorCliente.values()
                .stream()
                .filter(q -> q > 1)
                .count();

        int totalClientes = pedidosPorCliente.size();

        int totalPedidosValidos = Math.max(totalPedidos - cancelados, 1);

        BigDecimal ticketMedio = totalPedidos > 0
                ? faturamentoTotal.divide(BigDecimal.valueOf(totalPedidosValidos), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<FaturamentoDiaDTO> faturamento = faturamentoPorDia.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new FaturamentoDiaDTO(e.getKey(), e.getValue()))
                .toList();

        List<PedidosDiaDTO> pedidosDia = pedidosPorDia.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new PedidosDiaDTO(e.getKey(), e.getValue()))
                .toList();

        List<PedidosHoraDTO> pedidosHora = pedidosPorHora.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new PedidosHoraDTO(e.getKey(), e.getValue()))
                .toList();

        List<TopProdutoDTO> topProdutos = produtosCount.entrySet()
                .stream()
                .sorted((a, b) -> {
                    int cmp = b.getValue().compareTo(a.getValue());
                    if (cmp != 0) return cmp;

                    BigDecimal fatA = produtosFaturamento.getOrDefault(a.getKey(), BigDecimal.ZERO);
                    BigDecimal fatB = produtosFaturamento.getOrDefault(b.getKey(), BigDecimal.ZERO);
                    return fatB.compareTo(fatA);
                })
                .limit(5)
                .map(e -> new TopProdutoDTO(
                        e.getKey(),
                        produtosNome.getOrDefault(e.getKey(), "Produto"),
                        e.getValue(),
                        produtosImagem.get(e.getKey()),
                        produtosFaturamento.getOrDefault(e.getKey(), BigDecimal.ZERO)
                ))
                .toList();

        BigDecimal crescimentoValor = faturamentoPeriodoAtual.subtract(faturamentoPeriodoAnterior);

        BigDecimal crescimentoPercentual = BigDecimal.ZERO;
        if (faturamentoPeriodoAnterior.compareTo(BigDecimal.ZERO) > 0) {
            crescimentoPercentual = crescimentoValor
                    .multiply(BigDecimal.valueOf(100))
                    .divide(faturamentoPeriodoAnterior, 2, RoundingMode.HALF_UP);
        }

        Integer tempoMedioPreparo = totalComTempoPreparo > 0
                ? (int) Math.round((double) somaTempoPreparo / totalComTempoPreparo)
                : null;

        Integer tempoMedioEntrega = totalComTempoEntrega > 0
                ? (int) Math.round((double) somaTempoEntrega / totalComTempoEntrega)
                : null;

        Integer tempoMedioEntregaFinal = totalComTempoTotal > 0
                ? (int) Math.round((double) somaTempoTotal / totalComTempoTotal)
                : null;

        List<TopFaturamentoDTO> topFaturamento = produtosFaturamento.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(e -> new TopFaturamentoDTO(
                        e.getKey(),
                        produtosNome.getOrDefault(e.getKey(), "Produto"),
                        e.getValue(),
                        produtosCount.getOrDefault(e.getKey(), 0),
                        produtosImagem.get(e.getKey())
                ))
                .toList();

        List<MotivoCancelamentoDTO> motivosCancelamento = motivosCount.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> new MotivoCancelamentoDTO(
                        e.getKey(), e.getValue(),
                        motivosValorPerdido.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .toList();

        List<ReceitaEntregaDTO> receitaPorEntrega = entregasCount.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map(e -> new ReceitaEntregaDTO(
                        e.getKey(), e.getValue(),
                        entregasReceita.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .toList();

        return new AnalyticsDTO(
                faturamento,
                pedidosDia,
                new ResumoDTO(
                        faturamentoTotal,
                        totalPedidos,
                        ticketMedio,
                        totalClientes,
                        cancelados,
                        faturamentoPerdido,
                        tempoMedioPreparo,
                        tempoMedioEntrega
                ),
                topProdutos,
                topFaturamento,
                pedidosHora,
                pagamentos,
                entregas,
                new CuponsDTO(pedidosComCupom, faturamentoComCupom, descontoTotalCupons),
                new RetencaoDTO(clientesRecorrentes, totalClientes),
                new ComparacaoDTO(
                        faturamentoPeriodoAtual,
                        faturamentoPeriodoAnterior,
                        crescimentoValor,
                        crescimentoPercentual
                ),
                motivosCancelamento,
                receitaPorEntrega,
                tempoMedioEntregaFinal
        );
    }

    private LocalDateTime firstLogTime(List<PedidoStatusLog> logs, StatusPedido status) {
        return logs.stream()
                .filter(log -> log.getStatus() == status)
                .map(PedidoStatusLog::getData)
                .findFirst()
                .orElse(null);
    }
}