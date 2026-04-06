package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import com.ecommerce.digitaltricks.admin.repository.ClienteEmpresaRepository;
import com.ecommerce.digitaltricks.order.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.order.dto.pedido.PedidoRequestDTO;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.order.service.PedidoFacadeService;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurantes/{slug}/pedidos")
public class PedidoPublicoController {

    private final EmpresaRepository empresaRepository;
    private final PedidoFacadeService pedidoFacadeService;
    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final ClienteEmpresaRepository clienteEmpresaRepository;

    public PedidoPublicoController(
            EmpresaRepository empresaRepository,
            PedidoFacadeService pedidoFacadeService,
            ClienteRepository clienteRepository,
            PedidoRepository pedidoRepository,
            ClienteEmpresaRepository clienteEmpresaRepository
    ) {
        this.empresaRepository = empresaRepository;
        this.pedidoFacadeService = pedidoFacadeService;
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
        this.clienteEmpresaRepository = clienteEmpresaRepository;
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

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PedidoDTO>> listarMeusPedidos(
            @PathVariable String slug,
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

        List<PedidoDTO> pedidos = pedidoRepository.findByClienteIdAndEmpresaIdOrderByDataDesc(
                cliente.getId(), empresa.getId()
        ).stream()
         .map(p -> pedidoFacadeService.toDTO(p))
         .toList();

        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/fidelidade")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> consultarPontosFidelidade(
            @PathVariable String slug,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return ResponseEntity.ok(Map.of(
                    "pontos", 0,
                    "totalPedidos", 0,
                    "totalGasto", 0
            ));
        }

        String telefone = authentication.getName();

        Cliente cliente = clienteRepository.findByTelefone(telefone)
                .orElse(null);

        if (cliente == null) {
            return ResponseEntity.ok(Map.of(
                    "pontos", 0,
                    "totalPedidos", 0,
                    "totalGasto", 0
            ));
        }

        Empresa empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        ClienteEmpresa ce = clienteEmpresaRepository
                .findByClienteIdAndEmpresaId(cliente.getId(), empresa.getId())
                .orElse(null);

        if (ce == null) {
            return ResponseEntity.ok(Map.of(
                    "pontos", 0,
                    "totalPedidos", 0,
                    "totalGasto", 0
            ));
        }

        return ResponseEntity.ok(Map.of(
                "pontos", ce.getPontosFidelidade(),
                "totalPedidos", ce.getTotalPedidos(),
                "totalGasto", ce.getTotalGasto()
        ));
    }
}