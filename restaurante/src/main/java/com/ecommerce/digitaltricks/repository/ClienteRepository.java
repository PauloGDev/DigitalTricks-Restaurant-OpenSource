package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByTelefone(String telefone);
    boolean existsByTelefone(String telefone);
    Optional<Cliente> findByResetToken(String resetToken);
}
