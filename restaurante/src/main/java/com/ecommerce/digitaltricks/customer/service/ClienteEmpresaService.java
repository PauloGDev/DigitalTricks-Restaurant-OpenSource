package com.ecommerce.digitaltricks.customer.service;

import com.ecommerce.digitaltricks.admin.dto.ClienteEmpresaDTO;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import com.ecommerce.digitaltricks.customer.model.ClientePerfil;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.admin.repository.ClienteEmpresaRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteEmpresaService {

    private final ClienteEmpresaRepository clienteEmpresaRepository;
    private final PedidoRepository pedidoRepository;

    public ClienteEmpresaService(ClienteEmpresaRepository clienteEmpresaRepository,
                                 PedidoRepository pedidoRepository) {
        this.clienteEmpresaRepository = clienteEmpresaRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public void registrarPedido(Pedido pedido) {
        Cliente cliente = pedido.getCliente();
        Empresa empresa = pedido.getEmpresa();

        if (cliente == null || empresa == null) {
            return;
        }

        ClienteEmpresa clienteEmpresa = clienteEmpresaRepository
                .findByClienteIdAndEmpresaId(cliente.getId(), empresa.getId())
                .orElseGet(() -> {
                    ClienteEmpresa novo = new ClienteEmpresa();
                    novo.setCliente(cliente);
                    novo.setEmpresa(empresa);
                    novo.setAtivo(true);
                    novo.setBloqueado(false);
                    novo.setTotalPedidos(0);
                    novo.setTotalGasto(BigDecimal.ZERO);
                    return novo;
                });

        Integer totalPedidosAtual = clienteEmpresa.getTotalPedidos() != null
                ? clienteEmpresa.getTotalPedidos()
                : 0;

        BigDecimal totalGastoAtual = clienteEmpresa.getTotalGasto() != null
                ? clienteEmpresa.getTotalGasto()
                : BigDecimal.ZERO;

        clienteEmpresa.setTotalPedidos(totalPedidosAtual + 1);
        clienteEmpresa.setTotalGasto(
                totalGastoAtual.add(
                        pedido.getTotal() != null ? pedido.getTotal() : BigDecimal.ZERO
                )
        );
        clienteEmpresa.setUltimoPedidoEm(pedido.getData());

        clienteEmpresaRepository.save(clienteEmpresa);
    }

    @Transactional
    public int migrarPedidosParaClientes(Long empresaId) {
        List<Pedido> pedidos = pedidoRepository.findByEmpresaId(empresaId);
        int criados = 0;

        for (Pedido pedido : pedidos) {
            if (pedido.getCliente() == null) continue;

            boolean exists = clienteEmpresaRepository
                    .existsByClienteIdAndEmpresaId(pedido.getCliente().getId(), empresaId);

            if (!exists) {
                ClienteEmpresa novo = new ClienteEmpresa();
                novo.setCliente(pedido.getCliente());
                novo.setEmpresa(pedido.getEmpresa());
                novo.setAtivo(true);
                novo.setBloqueado(false);
                novo.setTotalPedidos(0);
                novo.setTotalGasto(BigDecimal.ZERO);
                clienteEmpresaRepository.save(novo);
                criados++;
            }
        }

        return criados;
    }

    public List<ClienteEmpresaDTO> listarClientesDaEmpresa(Long empresaId) {
        return clienteEmpresaRepository.buscarComPerfil(empresaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ClienteEmpresaDTO toDTO(ClienteEmpresa ce) {
        Cliente cliente = ce.getCliente();
        ClientePerfil perfil = cliente != null ? cliente.getPerfil() : null;

        String nomeCompleto = perfil != null ? perfil.getNomeCompleto() : null;
        String telefone = perfil != null ? perfil.getTelefone() : null;
        String email = perfil != null ? perfil.getEmail() : null;

        return new ClienteEmpresaDTO(
                ce.getId(),
                cliente != null ? cliente.getId() : null,
                telefone,
                nomeCompleto,
                email,
                ce.getEmpresa().getId(),
                ce.getEmpresa().getNomeFantasia(),
                ce.getAtivo(),
                ce.getBloqueado(),
                ce.getTotalPedidos(),
                ce.getTotalGasto(),
                ce.getUltimoPedidoEm(),
                ce.getObservacoesInternas()
        );
    }
}