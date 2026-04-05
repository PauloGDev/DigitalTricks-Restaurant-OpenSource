package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.dto.pedido.PedidoRequestDTO;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.service.PedidoFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/restaurantes/{slug}/pedidos")
public class PedidoPublicoController {

    private final EmpresaRepository empresaRepository;
    private final PedidoFacadeService pedidoFacadeService;
    private final ClienteRepository clienteRepository;

    public PedidoPublicoController(
            EmpresaRepository empresaRepository,
            PedidoFacadeService pedidoFacadeService,
            ClienteRepository clienteRepository
    ) {
        this.empresaRepository = empresaRepository;
        this.pedidoFacadeService = pedidoFacadeService;
        this.clienteRepository = clienteRepository;
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> criarPedido(
            @PathVariable String slug,
            @RequestBody PedidoRequestDTO pedidoRequest,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new RuntimeException("Cliente não autenticado");
        }

        String telefone = authentication.getName();

        Cliente cliente = clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        Empresa empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        return ResponseEntity.ok(
                pedidoFacadeService.criarPedidoCliente(cliente, empresa, pedidoRequest)
        );
    }
}