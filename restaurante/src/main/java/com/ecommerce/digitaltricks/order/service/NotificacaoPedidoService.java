package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.order.dto.pedido.PedidoNotificacaoDTO;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificacaoPedidoService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public NotificacaoPedidoService(
            SimpMessagingTemplate messagingTemplate,
            UsuarioEmpresaRepository usuarioEmpresaRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    public void notificarNovoPedido(Pedido pedido) {
        PedidoNotificacaoDTO dto = new PedidoNotificacaoDTO(
                UUID.randomUUID(),
                pedido.getId(),
                pedido.getEmpresa().getId(),
                pedido.getNomeCompleto(),
                pedido.getTotal(),
                pedido.getStatus(),
                "Novo pedido recebido!",
                Instant.now()
        );

        List<UsuarioEmpresa> vinculados = usuarioEmpresaRepository
                .findAllByEmpresaIdAndAtivoTrue(pedido.getEmpresa().getId());

        System.out.println("=== WS NOVO PEDIDO ===");
        System.out.println("Pedido: " + pedido.getId());
        System.out.println("Empresa: " + pedido.getEmpresa().getId());
        System.out.println("Vinculados ativos: " + vinculados.size());

        for (UsuarioEmpresa ue : vinculados) {
            if (ue.getUsuario() == null || ue.getUsuario().getUsername() == null) {
                System.out.println("Usuário inválido no vínculo");
                continue;
            }

            System.out.println("Enviando para username: " + ue.getUsuario().getUsername());

            messagingTemplate.convertAndSend(
                    "/topic/pedidos",
                    dto
            );
        }
    }
}