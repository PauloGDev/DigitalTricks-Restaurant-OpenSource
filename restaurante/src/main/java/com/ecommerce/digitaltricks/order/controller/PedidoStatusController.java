package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.order.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.service.PedidoFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoStatusController {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoFacadeService pedidoFacadeService;

    public PedidoStatusController(
            PedidoRepository pedidoRepository,
            ClienteRepository clienteRepository,
            PedidoFacadeService pedidoFacadeService
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.pedidoFacadeService = pedidoFacadeService;
    }

    private Cliente getCliente(Authentication auth) {
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new RuntimeException("Cliente não autenticado");
        }
        String telefone = auth.getName();
        return clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> buscarPorId(
            @PathVariable Long id,
            Authentication auth
    ) {
        Cliente cliente = getCliente(auth);

        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        if (!pedido.getCliente().getId().equals(cliente.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(pedidoFacadeService.toDTO(pedido));
    }
}
