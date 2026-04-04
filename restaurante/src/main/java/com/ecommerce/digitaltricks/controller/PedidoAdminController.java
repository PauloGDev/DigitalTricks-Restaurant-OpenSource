package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.exception.ForbiddenException;
import com.ecommerce.digitaltricks.exception.NotFoundException;
import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.service.PedidoFacadeService;
import com.ecommerce.digitaltricks.service.PedidoStatusService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos/admin")
// Usa o CorsConfig global
public class PedidoAdminController {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final PedidoFacadeService pedidoFacadeService;
    private final PedidoRepository pedidoRepository;
    private final PedidoStatusService pedidoStatusService;

    public PedidoAdminController(
            UsuarioRepository usuarioRepository,
            UsuarioEmpresaRepository usuarioEmpresaRepository,
            PedidoFacadeService pedidoFacadeService,
            PedidoRepository pedidoRepository,
            PedidoStatusService pedidoStatusService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
        this.pedidoFacadeService = pedidoFacadeService;
        this.pedidoRepository = pedidoRepository;
        this.pedidoStatusService = pedidoStatusService;
    }

    @GetMapping
    public Page<PedidoDTO> listar(
            @RequestParam int page,
            @RequestParam int size,
            Authentication authentication
    ) {
        String username = authentication.getName();

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Long empresaId = usuarioEmpresaRepository
                .findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(usuario.getId())
                .map(ue -> ue.getEmpresa().getId())
                .orElseThrow(() -> new ForbiddenException("Usuário não possui empresa"));

        Pageable pageable = PageRequest.of(page, size);

        return pedidoFacadeService.buscarPedidosEmpresa(empresaId, pageable);
    }

    /**
     * Retorna os status válidos para o pedido.
     */
    @GetMapping("/{pedidoId}/proximos-status")
    public ResponseEntity<Map<String, Object>> proximosStatus(
            @PathVariable Long pedidoId
    ) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        StatusPedido atual = pedido.getStatus();
        List<StatusPedido> proximos = pedidoStatusService.getProximosStatus(atual);

        return ResponseEntity.ok(Map.of(
                "atual", atual != null ? atual.name() : null,
                "proximos", proximos.stream().map(Enum::name).toList()
        ));
    }

    /**
     * Analisa a transição de status sem alterar o pedido.
     */
    @PostMapping("/{pedidoId}/analisar-transicao")
    public ResponseEntity<Map<String, Object>> analisarTransicao(
            @PathVariable Long pedidoId,
            @RequestBody Map<String, String> body
    ) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        StatusPedido atual = pedido.getStatus();
        String nomeDesejado = body.get("novoStatus");
        StatusPedido desejado;
        try {
            desejado = StatusPedido.valueOf(nomeDesejado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "possivel", false,
                    "erro", "Status inválido: " + nomeDesejado
            ));
        }

        PedidoStatusService.TransicaoInfo info = pedidoStatusService.analisarTransicao(atual, desejado);

        return ResponseEntity.ok(Map.of(
                "atual", info.getAtual() != null ? info.getAtual().name() : null,
                "desejado", info.getDesejado() != null ? info.getDesejado().name() : null,
                "possivel", info.isPossivel(),
                "caminho", info.getCaminho().stream().map(Enum::name).toList()
        ));
    }

    /**
     * Muda o status do pedido.
     * Se for avanço direto (ex: RECEBIDO → RECEBIDO) → usa alterarStatus.
     * Se precisar passar por etapas intermediárias (ex: RECEBIDO → PRONTO) → usa avancarPara.
     */
    @PatchMapping("/{pedidoId}/status")
    public ResponseEntity<Map<String, Object>> alterarStatus(
            @PathVariable Long pedidoId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        // Autorizacao
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Long empresaId = usuarioEmpresaRepository
                .findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(usuario.getId())
                .map(ue -> ue.getEmpresa().getId())
                .orElseThrow(() -> new ForbiddenException("Usuário não possui empresa"));

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        if (!pedido.getEmpresa().getId().equals(empresaId)) {
            throw new ForbiddenException("Pedido não pertence à sua empresa");
        }

        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(body.get("novoStatus"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "sucesso", false,
                    "erro", "Status inválido: " + body.get("novoStatus")
            ));
        }

        StatusPedido statusAtual = pedido.getStatus();

        try {
            Pedido atualizado;

            // Se é transição direta no fluxo
            List<StatusPedido> proximos = pedidoStatusService.getProximosStatus(statusAtual);
            if (proximos.contains(novoStatus)) {
                atualizado = pedidoStatusService.alterarStatus(pedido, novoStatus);
            } else {
                // Precisa passar por etapas intermediárias
                atualizado = pedidoStatusService.avancarPara(pedido, novoStatus);
            }

            return ResponseEntity.ok(Map.of(
                    "sucesso", true,
                    "pedidoId", atualizado.getId(),
                    "novoStatus", atualizado.getStatus().name(),
                    "mensagem", "Pedido #" + atualizado.getId() + " movido para " + getLabel(atualizado.getStatus())
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "sucesso", false,
                    "erro", e.getMessage()
            ));
        }
    }

    /**
     * Envio direto para entrega (ignora intermediários, avança por etapas)
     */
    @PatchMapping("/{pedidoId}/enviar-entrega")
    public ResponseEntity<Map<String, Object>> enviarEntrega(
            @PathVariable Long pedidoId,
            Authentication authentication
    ) {
        // Autorizacao
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        Long empresaId = usuarioEmpresaRepository
                .findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(usuario.getId())
                .map(ue -> ue.getEmpresa().getId())
                .orElseThrow(() -> new ForbiddenException("Usuário não possui empresa"));

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido não encontrado"));

        if (!pedido.getEmpresa().getId().equals(empresaId)) {
            throw new ForbiddenException("Pedido não pertence à sua empresa");
        }

        try {
            Pedido atualizado = pedidoStatusService.enviarParaEntrega(pedido);
            return ResponseEntity.ok(Map.of(
                    "sucesso", true,
                    "pedidoId", atualizado.getId(),
                    "novoStatus", atualizado.getStatus().name(),
                    "mensagem", "Pedido #" + atualizado.getId() + " enviado para entrega"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "sucesso", false,
                    "erro", e.getMessage()
            ));
        }
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
}