package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.enums.usuarios.StatusUsuario;
import com.ecommerce.digitaltricks.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Page<Usuario> findByStatus(StatusUsuario status, Pageable pageable);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Optional<? extends Usuario> findByEmail(String login);

    Optional<Usuario> findByResetToken(String token);
}