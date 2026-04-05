package com.ecommerce.digitaltricks.costumer.controller;

import com.ecommerce.digitaltricks.costumer.enums.Genero;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.model.ClientePerfil;
import com.ecommerce.digitaltricks.costumer.repository.ClientePerfilRepository;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClientePerfilController {

    private final ClienteRepository clienteRepository;
    private final ClientePerfilRepository clientePerfilRepository;

    public ClientePerfilController(
            ClienteRepository clienteRepository,
            ClientePerfilRepository clientePerfilRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.clientePerfilRepository = clientePerfilRepository;
    }

    private Long getAuthenticatedClienteId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new RuntimeException("Cliente não autenticado");
        }

        String telefone = authentication.getName();
        Cliente cliente = clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        return cliente.getId();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMeuPerfil(Authentication authentication) {
        Long clienteId = getAuthenticatedClienteId(authentication);

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        ClientePerfil perfil = cliente.getPerfil();

        Map<String, Object> perfilMap = new HashMap<>();
        if (perfil != null) {
            perfilMap.put("id", perfil.getId());
            perfilMap.put("nomeCompleto", perfil.getNomeCompleto());
            perfilMap.put("telefone", perfil.getTelefone());
            perfilMap.put("email", perfil.getEmail());
            perfilMap.put("dataNascimento", perfil.getDataNascimento());
            perfilMap.put("genero", perfil.getGenero() != null ? perfil.getGenero().name() : null);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", clienteId);
        result.put("telefone", cliente.getTelefone());
        result.put("perfil", perfilMap);

        return ResponseEntity.ok(result);
    }

    @PutMapping("/me")
    public ResponseEntity<?> atualizarMeuPerfil(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long clienteId = getAuthenticatedClienteId(authentication);

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        ClientePerfil perfil = cliente.getPerfil();
        if (perfil == null) {
            perfil = new ClientePerfil();
            perfil.setCliente(cliente);
            cliente.setPerfil(perfil);
        }

        if (body.containsKey("nomeCompleto") && body.get("nomeCompleto") != null) {
            perfil.setNomeCompleto((String) body.get("nomeCompleto"));
        }
        if (body.containsKey("email") && body.get("email") != null) {
            perfil.setEmail((String) body.get("email"));
        }
        if (body.containsKey("telefone") && body.get("telefone") != null) {
            String t = ((String) body.get("telefone")).replaceAll("\\D", "");
            perfil.setTelefone(t);
        }
        if (body.containsKey("dataNascimento") && body.get("dataNascimento") != null) {
            perfil.setDataNascimento(LocalDate.parse((String) body.get("dataNascimento")));
        }
        if (body.containsKey("genero") && body.get("genero") != null) {
            try {
                perfil.setGenero(
                        Genero.valueOf(
                                (String) body.get("genero")));
            } catch (Exception ignored) {
            }
        }

        clientePerfilRepository.save(perfil);
        clienteRepository.save(cliente);

        return ResponseEntity.ok(Map.of("message", "Perfil atualizado com sucesso!"));
    }
}
