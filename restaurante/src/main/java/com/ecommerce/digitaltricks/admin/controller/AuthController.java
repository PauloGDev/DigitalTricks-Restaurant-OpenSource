package com.ecommerce.digitaltricks.admin.controller;

import com.ecommerce.digitaltricks.admin.dto.AuthResponse;
import com.ecommerce.digitaltricks.admin.dto.LoginRequest;
import com.ecommerce.digitaltricks.admin.dto.RegisterRequest;
import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;
import com.ecommerce.digitaltricks.admin.enums.StatusEmpresa;
import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.shared.security.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final EmpresaRepository empresaRepository;

    public AuthController(AuthenticationManager authManager,
                          UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil, UsuarioEmpresaRepository usuarioEmpresaRepository,
                          EmpresaRepository empresaRepository) {
        this.authManager = authManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
        this.empresaRepository = empresaRepository;
    }

    // ============================================================
    // =============== Autenticação e Cadastro ====================
    // ============================================================

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }

        return ResponseEntity.ok(jwtUtil.extractAllClaims(token));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        request.setEmail(request.getEmail().toLowerCase());

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Nome de usuário já está em uso!");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email já registrado!");
        }

        if (request.getNomeRestaurante() == null || request.getNomeRestaurante().isBlank()) {
            return ResponseEntity.badRequest().body("Nome do restaurante é obrigatório!");
        }

        // Criar usuário
        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setEmail(request.getEmail());
        usuario.setRoles(Set.of("ROLE_ADMIN"));
        usuario.setStatus(StatusUsuario.ATIVO);
        usuario.setNome(request.getNomeCompleto());
        usuario = usuarioRepository.save(usuario);

        // Criar empresa
        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(request.getNomeRestaurante());
        empresa.setEmail(request.getEmail());
        empresa.setTelefone(request.getTelefone());

        if (request.getCep() != null && !request.getCep().isBlank()) {
            empresa.setCep(request.getCep());
        }
        if (request.getLogradouro() != null) {
            empresa.setLogradouro(request.getLogradouro());
        }
        if (request.getNumero() != null) {
            empresa.setNumero(request.getNumero());
        }
        if (request.getBairro() != null) {
            empresa.setBairro(request.getBairro());
        }
        if (request.getCidade() != null) {
            empresa.setCidade(request.getCidade());
        }
        if (request.getComplemento() != null) {
            empresa.setComplemento(request.getComplemento());
        }
        if (request.getUf() != null) {
            empresa.setUf(request.getUf());
        }
        if (request.getLatitude() != null) {
            empresa.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            empresa.setLongitude(request.getLongitude());
        }

        empresa.setCnpj(request.getCnpj() != null ? request.getCnpj().replaceAll("\\D", "") : "00." + usuario.getId() + "/0001-00".replaceAll("\\D", ""));
        empresa.setAceitaRetirada(request.getAceitaRetirada() != null ? request.getAceitaRetirada() : true);
        empresa.setAceitaDelivery(request.getAceitaDelivery() != null ? request.getAceitaDelivery() : true);

        // Gerar slug único
        String slugBase = request.getNomeRestaurante().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        String slug = gerarSlugUnico(slugBase);
        empresa.setSlug(slug);

        empresa = empresaRepository.save(empresa);

        // Vincular usuário como DONO
        UsuarioEmpresa vinculo = new UsuarioEmpresa();
        vinculo.setUsuario(usuario);
        vinculo.setEmpresa(empresa);
        vinculo.setPapel(PapelEmpresa.DONO);
        vinculo.setAtivo(true);
        usuarioEmpresaRepository.save(vinculo);

        // Gerar token
        String token = jwtUtil.generateToken(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRoles(),
                empresa.getId()
        );

        return ResponseEntity.ok(new AuthResponse(
                token,
                usuario.getId(),
                usuario.getUsername(),
                empresa.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String login = request.getUsername();
        String senha = request.getPassword();

        Usuario usuario = usuarioRepository.findByUsername(login)
                .or(() -> usuarioRepository.findByEmail(login))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(usuario.getUsername(), senha)
        );

        Long empresaId = usuarioEmpresaRepository
                .findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(usuario.getId())
                .map(ue -> ue.getEmpresa().getId())
                .orElse(null);

        String token = jwtUtil.generateToken(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRoles(),
                empresaId
        );

        return ResponseEntity.ok(new AuthResponse(
                token,
                usuario.getId(),
                usuario.getUsername(),
                empresaId
        ));
    }

    // ============================================================
    // =============== Recuperação de Senha =======================
    // ============================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) throws MessagingException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        String token = UUID.randomUUID().toString();
        usuario.setResetToken(token);
        usuarioRepository.save(usuario);

        String resetLink = "https://sublimeperfumes.com.br/reset-password?token=" + token;

        return ResponseEntity.ok("Email de recuperação enviado!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
                                           @RequestParam String novaSenha) {
        Optional<Usuario> optionalUsuario = usuarioRepository.findByResetToken(token);

        if (optionalUsuario.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Token inválido ou expirado.");
        }

        Usuario usuario = optionalUsuario.get();
        usuario.setPassword(passwordEncoder.encode(novaSenha));
        usuario.setResetToken(null);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok("Senha alterada com sucesso!");
    }

    // ============================================================
    // =============== Helpers =====================================
    // ============================================================

    private String gerarSlugUnico(String baseSlug) {
        String slug = baseSlug;
        int contador = 2;

        while (empresaRepository.findBySlugIgnoreCase(slug).isPresent()) {
            slug = baseSlug + "-" + contador;
            contador++;
        }

        return slug;
    }

}
