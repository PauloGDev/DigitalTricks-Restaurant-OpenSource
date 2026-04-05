package com.ecommerce.digitaltricks.costumer.controller;

import com.ecommerce.digitaltricks.costumer.dto.ClienteAuthResponse;
import com.ecommerce.digitaltricks.costumer.dto.ClienteLoginRequest;
import com.ecommerce.digitaltricks.costumer.dto.ClienteRegisterRequest;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.model.ClientePerfil;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.shared.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes/auth")
@CrossOrigin(origins = "*")
public class ClienteAuthController {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public ClienteAuthController(
            ClienteRepository clienteRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authManager,
            JwtUtil jwtUtil
    ) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    private String normalizarTelefone(String telefone) {
        return telefone == null ? null : telefone.replaceAll("\\D", "");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody ClienteRegisterRequest req) {
        String telefone = normalizarTelefone(req.telefone());

        if (telefone == null || telefone.isBlank()) {
            throw new RuntimeException("Telefone é obrigatório");
        }

        if (req.password() == null || req.password().isBlank()) {
            throw new RuntimeException("Senha é obrigatória");
        }

        if (req.nomeCompleto() == null || req.nomeCompleto().isBlank()) {
            throw new RuntimeException("Nome completo é obrigatório");
        }

        if (clienteRepository.existsByTelefone(telefone)) {
            throw new RuntimeException("Telefone já cadastrado");
        }

        Cliente cliente = new Cliente();
        cliente.setTelefone(telefone);
        cliente.setPassword(passwordEncoder.encode(req.password()));

        ClientePerfil perfil = new ClientePerfil();
        perfil.setCliente(cliente);
        perfil.setNomeCompleto(req.nomeCompleto());
        perfil.setTelefone(telefone);
        perfil.setEmail(req.email());
        perfil.setDataNascimento(req.dataNascimento());
        perfil.setGenero(req.genero());

        cliente.setPerfil(perfil);

        cliente = clienteRepository.save(cliente);

        String token = jwtUtil.generateClienteToken(cliente.getId(), cliente.getTelefone());

        return ResponseEntity.ok(
                new ClienteAuthResponse(
                        token,
                        cliente.getId(),
                        cliente.getTelefone()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ClienteLoginRequest req) {
        String telefone = normalizarTelefone(req.telefone());

        if (telefone == null || telefone.isBlank()) {
            throw new RuntimeException("Telefone é obrigatório");
        }

        if (req.password() == null || req.password().isBlank()) {
            throw new RuntimeException("Senha é obrigatória");
        }

        Cliente cliente = clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(telefone, req.password())
        );

        String token = jwtUtil.generateClienteToken(cliente.getId(), cliente.getTelefone());

        return ResponseEntity.ok(
                new ClienteAuthResponse(
                        token,
                        cliente.getId(),
                        cliente.getTelefone()
                )
        );
    }
}