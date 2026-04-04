package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.cliente.EnderecoDTO;
import com.ecommerce.digitaltricks.model.Cliente;
import com.ecommerce.digitaltricks.model.ClientePerfil;
import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.repository.ClientePerfilRepository;
import com.ecommerce.digitaltricks.repository.ClienteRepository;
import com.ecommerce.digitaltricks.repository.EnderecoRepository;
import com.ecommerce.digitaltricks.service.EnderecoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enderecos")
@CrossOrigin(origins = "*")
public class EnderecoController {

    private final EnderecoService enderecoService;
    private final ClienteRepository clienteRepository;
    private final ClientePerfilRepository clientePerfilRepository;
    private final EnderecoRepository enderecoRepository;

    public EnderecoController(
            EnderecoService enderecoService,
            ClienteRepository clienteRepository,
            ClientePerfilRepository clientePerfilRepository,
            EnderecoRepository enderecoRepository) {
        this.enderecoService = enderecoService;
        this.clienteRepository = clienteRepository;
        this.clientePerfilRepository = clientePerfilRepository;
        this.enderecoRepository = enderecoRepository;
    }

    private Long getClienteId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new RuntimeException("Cliente não autenticado");
        }

        String telefone = authentication.getName();

        Cliente cliente = clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        return cliente.getId();
    }

    private ClientePerfil getClientePerfil(Authentication authentication) {
        Long clienteId = getClienteId(authentication);

        return clientePerfilRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new RuntimeException("Perfil do cliente não encontrado"));
    }

    @PutMapping("/{id}")
    public EnderecoDTO editarEndereco(
            @PathVariable Long id,
            @RequestBody Endereco endereco,
            Authentication authentication
    ) {
        Endereco atualizado = enderecoService.editarEndereco(getClienteId(authentication), id, endereco);
        return toDTO(atualizado);
    }

    @DeleteMapping("/{id}")
    public void excluirEndereco(@PathVariable Long id, Authentication authentication) {
        enderecoService.excluirEndereco(getClienteId(authentication), id);
    }

    @GetMapping("/me")
    public List<EnderecoDTO> meusEnderecos(Authentication authentication) {
        Long clienteId = getClienteId(authentication);

        return enderecoRepository.findByPerfilClienteIdAndAtivoTrue(clienteId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @GetMapping("/me/padrao")
    public EnderecoDTO meuEnderecoPadrao(Authentication authentication) {
        Long clienteId = getClienteId(authentication);

        List<Endereco> enderecos = enderecoRepository
                .findByPerfilClienteIdAndAtivoTrue(clienteId);

        return enderecos.stream()
                .filter(Endereco::isPadrao)
                .findFirst()
                .map(this::toDTO)
                .orElseGet(() ->
                        enderecos.stream()
                                .findFirst()
                                .map(this::toDTO)
                                .orElse(null)
                );
    }

    @PostMapping
    public EnderecoDTO adicionarEndereco(@RequestBody Endereco endereco, Authentication authentication) {
        Endereco salvo = enderecoService.adicionarEndereco(getClienteId(authentication), endereco);
        return toDTO(salvo);
    }

    @PutMapping("/{id}/padrao")
    public EnderecoDTO definirPadrao(@PathVariable Long id, Authentication authentication) {
        Endereco atualizado = enderecoService.definirEnderecoPadrao(getClienteId(authentication), id);
        return toDTO(atualizado);
    }

    private EnderecoDTO toDTO(Endereco e) {
        return new EnderecoDTO(
                e.getId(),
                e.getLogradouro(),
                e.getNumero(),
                e.getBairro(),
                e.getCidade(),
                e.getUf(),
                e.getCep(),
                e.getComplemento(),
                e.isPadrao()
        );
    }
}