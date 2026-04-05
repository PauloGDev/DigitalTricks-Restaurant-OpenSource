package com.ecommerce.digitaltricks.admin.service;

import com.ecommerce.digitaltricks.admin.dto.UsuarioDTO;
import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import com.ecommerce.digitaltricks.shared.exception.BadRequestException;
import com.ecommerce.digitaltricks.shared.exception.NotFoundException;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioDTO toDTO(Usuario usuario) {
        return new UsuarioDTO(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getStatus(),
                usuario.getRoles()
        );
    }

    public Page<UsuarioDTO> listarTodos(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Usuario> usuarios;
        if (status != null && !status.isBlank()) {
            StatusUsuario statusEnum;
            try {
                statusEnum = StatusUsuario.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Status inválido: " + status);
            }

            usuarios = usuarioRepository.findByStatus(statusEnum, pageable);
        } else {
            usuarios = usuarioRepository.findAll(pageable);
        }

        return usuarios.map(this::toDTO);
    }

    public Usuario criar(Usuario usuario) {
        if (usuario.getUsername() == null || usuario.getUsername().isBlank()) {
            throw new BadRequestException("Username é obrigatório");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new BadRequestException("Email é obrigatório");
        }

        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new BadRequestException("Já existe um usuário com este username");
        }

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new BadRequestException("Já existe um usuário com este email");
        }

        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new BadRequestException("Senha é obrigatória");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            usuario.setRoles(
                    usuario.getRoles().stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
                            .collect(Collectors.toSet())
            );
        } else {
            usuario.setRoles(Set.of("ROLE_USER"));
        }

        if (usuario.getStatus() == null) {
            usuario.setStatus(StatusUsuario.ATIVO);
        }

        return usuarioRepository.save(usuario);
    }

    public Usuario atualizar(Long id, Usuario usuario) {
        Usuario existente = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        if (usuario.getUsername() == null || usuario.getUsername().isBlank()) {
            throw new BadRequestException("Username é obrigatório");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new BadRequestException("Email é obrigatório");
        }

        if (!existente.getUsername().equals(usuario.getUsername())
                && usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new BadRequestException("Já existe um usuário com este username");
        }

        if (!existente.getEmail().equals(usuario.getEmail())
                && usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new BadRequestException("Já existe um usuário com este email");
        }

        existente.setUsername(usuario.getUsername());
        existente.setNome(usuario.getNome());
        existente.setEmail(usuario.getEmail());
        existente.setStatus(usuario.getStatus());

        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            existente.setRoles(
                    usuario.getRoles().stream()
                            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r.toUpperCase())
                            .collect(Collectors.toSet())
            );
        }

        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(existente);
    }

    public UsuarioDTO buscarPorUsername(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));
        return toDTO(usuario);
    }

    public void excluir(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new NotFoundException("Usuário não encontrado");
        }

        usuarioRepository.deleteById(id);
    }
}