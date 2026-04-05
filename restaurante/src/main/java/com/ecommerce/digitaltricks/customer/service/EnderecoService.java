package com.ecommerce.digitaltricks.costumer.service;

import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.model.ClientePerfil;
import com.ecommerce.digitaltricks.costumer.model.Endereco;
import com.ecommerce.digitaltricks.costumer.repository.ClientePerfilRepository;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.costumer.repository.EnderecoRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final ClienteRepository clienteRepository;
    private final ClientePerfilRepository clientePerfilRepository;
    private final EnderecoGeocodingService enderecoGeocodingService;
    private final PedidoRepository pedidoRepository;

    public EnderecoService(
            EnderecoRepository enderecoRepository,
            ClienteRepository clienteRepository,
            ClientePerfilRepository clientePerfilRepository,
            EnderecoGeocodingService enderecoGeocodingService,
            PedidoRepository pedidoRepository
    ) {
        this.enderecoRepository = enderecoRepository;
        this.clienteRepository = clienteRepository;
        this.clientePerfilRepository = clientePerfilRepository;
        this.enderecoGeocodingService = enderecoGeocodingService;
        this.pedidoRepository = pedidoRepository;
    }

    public Endereco editarEndereco(Long clienteId, Long enderecoId, Endereco novo) {
        Endereco existente = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        validarPertencimento(clienteId, existente);

        existente.setLogradouro(novo.getLogradouro());
        existente.setNumero(novo.getNumero());
        existente.setComplemento(novo.getComplemento());
        existente.setBairro(novo.getBairro());
        existente.setCidade(novo.getCidade());
        existente.setCep(novo.getCep());
        existente.setUf(novo.getUf());

        enderecoGeocodingService.enriquecerEndereco(existente);

        return enderecoRepository.save(existente);
    }

    public void excluirEndereco(Long clienteId, Long enderecoId) {
        Endereco existente = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        validarPertencimento(clienteId, existente);

        boolean eraPadrao = existente.isPadrao();

        //  SOFT DELETE
        existente.setAtivo(false);
        existente.setPadrao(false);
        enderecoRepository.save(existente);

        // redefine padrão se necessário
        if (eraPadrao) {
            List<Endereco> restantes = enderecoRepository.findByPerfilClienteId(clienteId)
                    .stream()
                    .filter(Endereco::isAtivo)
                    .toList();

            if (!restantes.isEmpty()) {
                Endereco novoPadrao = restantes.get(0);
                novoPadrao.setPadrao(true);
                enderecoRepository.save(novoPadrao);
            }
        }
    }

    public Endereco adicionarEndereco(Long clienteId, Endereco endereco) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        ClientePerfil perfil = clientePerfilRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new RuntimeException("Perfil do cliente não encontrado"));

        endereco.setPerfil(perfil);

        if (perfil.getEnderecos() == null || perfil.getEnderecos().isEmpty()) {
            endereco.setPadrao(true);
        }

        enderecoGeocodingService.enriquecerEndereco(endereco);

        Endereco salvo = enderecoRepository.save(endereco);

        if (cliente.getPerfil() == null) {
            cliente.setPerfil(perfil);
        }

        return salvo;
    }

    public Endereco definirEnderecoPadrao(Long clienteId, Long enderecoId) {
        ClientePerfil perfil = clientePerfilRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new RuntimeException("Perfil do cliente não encontrado"));

        List<Endereco> enderecos = perfil.getEnderecos();

        if (enderecos == null || enderecos.isEmpty()) {
            throw new RuntimeException("Nenhum endereço encontrado");
        }

        Endereco enderecoSelecionado = enderecos.stream()
                .filter(e -> e.getId().equals(enderecoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        for (Endereco e : enderecos) {
            boolean deveSerPadrao = e.getId().equals(enderecoId);
            if (e.isPadrao() != deveSerPadrao) {
                e.setPadrao(deveSerPadrao);
                enderecoRepository.save(e);
            }
        }

        return enderecoSelecionado;
    }

    private void validarPertencimento(Long clienteId, Endereco endereco) {
        if (endereco.getPerfil() == null
                || endereco.getPerfil().getCliente() == null
                || !endereco.getPerfil().getCliente().getId().equals(clienteId)) {
            throw new RuntimeException("Acesso negado");
        }
    }
}