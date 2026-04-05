package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.order.enums.MotivoCancelamento;
import com.ecommerce.digitaltricks.order.enums.OrigemCancelamento;
import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.order.model.PedidoStatusLog;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoStatusLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PedidoStatusService {

    private final PedidoRepository pedidoRepository;
    private final PedidoStatusLogRepository pedidoStatusLogRepository;

    // Fluxo de status — inclui delivery e retirada
    private static final Map<StatusPedido, List<StatusPedido>> FLUXO = Map.of(
            StatusPedido.AGUARDANDO_PAGAMENTO, List.of(StatusPedido.RECEBIDO, StatusPedido.CANCELADO),
            StatusPedido.RECEBIDO, List.of(StatusPedido.EM_PREPARO, StatusPedido.AGUARDANDO_RETIRADA, StatusPedido.CANCELADO),
            StatusPedido.EM_PREPARO, List.of(StatusPedido.PRONTO, StatusPedido.AGUARDANDO_RETIRADA, StatusPedido.CANCELADO),
            StatusPedido.PRONTO, List.of(StatusPedido.SAIU_PARA_ENTREGA, StatusPedido.AGUARDANDO_RETIRADA, StatusPedido.RETIRADO, StatusPedido.ENTREGUE),
            StatusPedido.AGUARDANDO_RETIRADA, List.of(StatusPedido.RETIRADO, StatusPedido.CANCELADO),
            StatusPedido.SAIU_PARA_ENTREGA, List.of(StatusPedido.ENTREGUE, StatusPedido.CANCELADO),
            StatusPedido.RETIRADO, List.of(),
            StatusPedido.ENTREGUE, List.of(),
            StatusPedido.CANCELADO, List.of()
    );

    // Caminho de progresso para entrega
    private static final List<StatusPedido> ORDEM_PROGRESSO_ENTREGA = List.of(
            StatusPedido.AGUARDANDO_PAGAMENTO,
            StatusPedido.RECEBIDO,
            StatusPedido.EM_PREPARO,
            StatusPedido.PRONTO,
            StatusPedido.SAIU_PARA_ENTREGA,
            StatusPedido.ENTREGUE
    );

    // Caminho de progresso para retirada
    private static final List<StatusPedido> ORDEM_PROGRESSO_RETIRADA = List.of(
            StatusPedido.AGUARDANDO_PAGAMENTO,
            StatusPedido.RECEBIDO,
            StatusPedido.EM_PREPARO,
            StatusPedido.PRONTO,
            StatusPedido.AGUARDANDO_RETIRADA,
            StatusPedido.RETIRADO
    );

    // Status que permitem entrega direta (ignora pagamento)
    private static final List<StatusPedido> ENTREGA_PERMITIDA = List.of(
            StatusPedido.RECEBIDO,
            StatusPedido.EM_PREPARO
    );

    public PedidoStatusService(
            PedidoRepository pedidoRepository,
            PedidoStatusLogRepository pedidoStatusLogRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoStatusLogRepository = pedidoStatusLogRepository;
    }

    public void registrarStatusInicial(Pedido pedido) {
        if (pedido == null || pedido.getId() == null || pedido.getStatus() == null) {
            return;
        }

        if (pedidoStatusLogRepository.existsByPedidoId(pedido.getId())) {
            return;
        }

        pedidoStatusLogRepository.save(
                new PedidoStatusLog(pedido, pedido.getStatus(), LocalDateTime.now())
        );
    }

    /**
     * Troca o status de um pedido com validacao estrita.
     * Só permite transicoes diretamente no FLUXO.
     */
    public Pedido alterarStatus(Pedido pedido, StatusPedido novoStatus) {
        if (pedido == null || novoStatus == null) {
            throw new RuntimeException("Pedido/status inválido.");
        }

        StatusPedido statusAtual = pedido.getStatus();
        if (statusAtual == null) {
            pedido.setStatus(novoStatus);
            Pedido salvo = pedidoRepository.save(pedido);
            pedidoStatusLogRepository.save(new PedidoStatusLog(salvo, novoStatus, LocalDateTime.now()));
            return salvo;
        }

        if (statusAtual == novoStatus) {
            return pedido;
        }

        List<StatusPedido> proximos = FLUXO.getOrDefault(statusAtual, List.of());
        if (!proximos.contains(novoStatus)) {
            throw new RuntimeException("Transição inválida de status: " + getLabel(statusAtual) + " → " + getLabel(novoStatus));
        }

        pedido.setStatus(novoStatus);
        Pedido salvo = pedidoRepository.save(pedido);
        pedidoStatusLogRepository.save(new PedidoStatusLog(salvo, novoStatus, LocalDateTime.now()));

        return salvo;
    }

    /**
     * Avança o pedido automaticamente por etapas intermediárias
     * até chegar no status desejado.
     * Ex: RECEBIDO → EM_PREPARO → PRONTO → SAIU_PARA_ENTREGA
     */
    public Pedido avancarPara(Pedido pedido, StatusPedido statusDesejado) {
        if (pedido == null || statusDesejado == null) {
            throw new RuntimeException("Pedido/status inválido.");
        }

        StatusPedido atual = pedido.getStatus();
        if (atual == null) {
            throw new RuntimeException("Pedido sem status definido.");
        }

        if (atual == statusDesejado) {
            return pedido;
        }

        // Se cancelado ou final, não pode avançar
        if (atual == StatusPedido.CANCELADO || atual == StatusPedido.ENTREGUE || atual == StatusPedido.RETIRADO) {
            throw new RuntimeException("Pedido já está em estado final (" + getLabel(atual) + "). Não é possível avançar.");
        }

        // Monta o caminho de avanço
        List<StatusPedido> caminho = construirCaminho(atual, statusDesejado);
        if (caminho.isEmpty()) {
            throw new RuntimeException("Não foi possível avançar de " + getLabel(atual) + " para " + getLabel(statusDesejado));
        }

        // Avança passo a passo registrando log
        for (StatusPedido proximo : caminho) {
            pedido.setStatus(proximo);
            pedido = pedidoRepository.save(pedido);
            pedidoStatusLogRepository.save(new PedidoStatusLog(pedido, proximo, LocalDateTime.now()));
        }

        return pedido;
    }

    /**
     * Permite enviar para entrega mesmo se o pagamento não foi confirmado.
     * Pula etapas intermediárias mas ainda registra logs.
     */
    public Pedido enviarParaEntrega(Pedido pedido) {
        StatusPedido atual = pedido.getStatus();

        if (atual == StatusPedido.CANCELADO || atual == StatusPedido.ENTREGUE || atual == StatusPedido.RETIRADO) {
            throw new RuntimeException("Pedido em estado final (" + getLabel(atual) + ").");
        }

        if (atual == StatusPedido.SAIU_PARA_ENTREGA || atual == StatusPedido.ENTREGUE) {
            throw new RuntimeException("Pedido já está " + getLabel(atual) + ".");
        }

        // Avança: RECEBIDO → EM_PREPARO → PRONTO → SAIU_PARA_ENTREGA
        return avancarPara(pedido, StatusPedido.SAIU_PARA_ENTREGA);
    }

    /**
     * Marca como entregue (ignora intermediários)
     */
    public Pedido marcarEntregue(Pedido pedido) {
        StatusPedido atual = pedido.getStatus();

        if (atual == StatusPedido.CANCELADO) {
            throw new RuntimeException("Pedido cancelado.");
        }
        if (atual == StatusPedido.ENTREGUE) {
            return pedido;
        }

        return avancarPara(pedido, StatusPedido.ENTREGUE);
    }

    public Pedido cancelar(Pedido pedido, MotivoCancelamento motivo, OrigemCancelamento origem) {
        pedido.setMotivoCancelamento(motivo);
        pedido.setOrigemCancelamento(origem);
        return alterarStatus(pedido, StatusPedido.CANCELADO);
    }

    /**
     * Retorna os status válidos para transição a partir do status atual.
     */
    public List<StatusPedido> getProximosStatus(StatusPedido statusAtual) {
        return FLUXO.getOrDefault(statusAtual, List.of());
    }

    /**
     * Retorna informações sobre a transição entre dois status.
     * Usado pelo frontend para mostrar o caminho.
     */
    public TransicaoInfo analisarTransicao(StatusPedido atual, StatusPedido desejado) {
        if (atual == desejado) {
            return new TransicaoInfo(atual, desejado, List.of(), false);
        }

        // Verifica se é transição direta
        List<StatusPedido> proximos = FLUXO.getOrDefault(atual, List.of());
        if (proximos.contains(desejado)) {
            return new TransicaoInfo(atual, desejado, List.of(desejado), true);
        }

        // Tenta construir caminho
        List<StatusPedido> caminho = construirCaminho(atual, desejado);
        return new TransicaoInfo(atual, desejado, caminho, !caminho.isEmpty());
    }

    /* ── Helpers ── */

    private List<StatusPedido> construirCaminho(StatusPedido de, StatusPedido para) {
        // Tenta caminho de entrega
        List<StatusPedido> resultado = construirCaminhoPorOrdem(de, para, ORDEM_PROGRESSO_ENTREGA);
        if (!resultado.isEmpty()) return resultado;

        // Tenta caminho de retirada
        resultado = construirCaminhoPorOrdem(de, para, ORDEM_PROGRESSO_RETIRADA);
        if (!resultado.isEmpty()) return resultado;

        // Fallback: transição direta (status finais ou não-lineares)
        if (FLUXO.getOrDefault(de, List.of()).contains(para)) {
            return List.of(para);
        }

        return List.of();
    }

    private List<StatusPedido> construirCaminhoPorOrdem(StatusPedido de, StatusPedido para, List<StatusPedido> ordem) {
        int idxDe = ordem.indexOf(de);
        int idxPara = ordem.indexOf(para);

        if (idxDe < 0 || idxPara < 0 || idxPara <= idxDe) {
            return List.of();
        }

        List<StatusPedido> caminho = new ArrayList<>();
        for (int i = idxDe + 1; i <= idxPara; i++) {
            StatusPedido s = ordem.get(i);
            StatusPedido anterior = i == idxDe + 1 ? de : ordem.get(i - 1);
            List<StatusPedido> validos = FLUXO.getOrDefault(anterior, List.of());
            if (validos.contains(s)) {
                caminho.add(s);
            } else {
                break;
            }
        }
        return caminho;
    }

    private String getLabel(StatusPedido status) {
        if (status == null) return "NULO";
        return switch (status) {
            case AGUARDANDO_PAGAMENTO -> "Aguardando Pagamento";
            case RECEBIDO -> "Recebido";
            case EM_PREPARO -> "Em Preparo";
            case PRONTO -> "Pronto";
            case SAIU_PARA_ENTREGA -> "Saiu para Entrega";
            case ENTREGUE -> "Entregue";
            case RETIRADO -> "Retirado";
            case AGUARDANDO_RETIRADA -> "Aguardando Retirada";
            case CANCELADO -> "Cancelado";
            default -> status.name();
        };
    }

    public static class TransicaoInfo {
        private final StatusPedido atual;
        private final StatusPedido desejado;
        private final List<StatusPedido> caminho;
        private final boolean possivel;

        public TransicaoInfo(StatusPedido atual, StatusPedido desejado, List<StatusPedido> caminho, boolean possivel) {
            this.atual = atual;
            this.desejado = desejado;
            this.caminho = caminho;
            this.possivel = possivel;
        }

        public StatusPedido getAtual() { return atual; }
        public StatusPedido getDesejado() { return desejado; }
        public List<StatusPedido> getCaminho() { return caminho; }
        public boolean isPossivel() { return possivel; }
    }
}
