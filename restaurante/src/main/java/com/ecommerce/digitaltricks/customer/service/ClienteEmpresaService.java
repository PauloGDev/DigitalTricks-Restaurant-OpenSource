package com.ecommerce.digitaltricks.costumer.service;

import com.ecommerce.digitaltricks.admin.dto.ClienteEmpresaDTO;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import com.ecommerce.digitaltricks.costumer.model.ClientePerfil;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.admin.repository.ClienteEmpresaRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClienteEmpresaService {

    private final ClienteEmpresaRepository clienteEmpresaRepository;

    public ClienteEmpresaService(ClienteEmpresaRepository clienteEmpresaRepository) {
        this.clienteEmpresaRepository = clienteEmpresaRepository;
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