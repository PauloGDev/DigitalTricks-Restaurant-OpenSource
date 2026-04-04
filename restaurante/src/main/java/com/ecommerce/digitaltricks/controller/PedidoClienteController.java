package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.model.Cliente;
import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.repository.ClienteRepository;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.service.PedidoFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes/pedidos")
@CrossOrigin(origins = "*")
public class PedidoClienteController {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoFacadeService pedidoFacadeService;

    public PedidoClienteController(
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

        return clienteRepository.findByTelefone(auth.getName())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PedidoDTO>> meusPedidos(Authentication auth) {
        Cliente cliente = getCliente(auth);

        return ResponseEntity.ok(
                pedidoRepository.findByClienteIdOrderByDataDesc(cliente.getId())
                        .stream()
                        .map(pedidoFacadeService::toDTO)
                        .toList()
        );
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