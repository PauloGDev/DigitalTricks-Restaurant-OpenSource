package com.ecommerce.digitaltricks.customer.controller;

import com.ecommerce.digitaltricks.order.dto.pedido.PedidoDTO;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.order.service.PedidoFacadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoint legado para pedidos do cliente.
 * Mapeia GET /api/pedidos/me (o que o frontend chama).
 */
@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class ClientePedidoController {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoFacadeService pedidoFacadeService;

    public ClientePedidoController(
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

    @GetMapping("/me")
    public ResponseEntity<List<Map<String, Object>>> meusPedidos(Authentication auth) {
        Cliente cliente = getCliente(auth);

        List<PedidoDTO> dtos = pedidoRepository
                .findByClienteIdOrderByDataDesc(cliente.getId())
                .stream()
                .map(pedidoFacadeService::toDTO)
                .toList();

        // Converte para formato simples esperado pelo frontend
        List<Map<String, Object>> result = dtos.stream().map(dto -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", dto.id());
            map.put("data", dto.data());
            map.put("status", dto.status() != null ? dto.status() : "AGUARDANDO_PAGAMENTO");
            map.put("statusPagamento", dto.statusPagamento());
            map.put("total", dto.total());
            map.put("subtotal", dto.subTotal());
            map.put("nomeCompleto", dto.nomeCompleto());
            map.put("tipoEntrega", dto.tipoEntrega());
            map.put("itens", dto.itens() != null ? dto.itens().stream().map(item -> {
                Map<String, Object> itemMap = new java.util.HashMap<>();
                itemMap.put("nomeProduto", item.nomeProduto());
                itemMap.put("quantidade", item.quantidade());
                itemMap.put("precoUnitario", item.precoUnitario());
                itemMap.put("totalItem", item.totalItem());
                return itemMap;
            }).collect(Collectors.toList()) : List.of());
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }
}
