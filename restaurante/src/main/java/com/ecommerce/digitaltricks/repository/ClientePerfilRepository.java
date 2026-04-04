package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.ClientePerfil;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientePerfilRepository extends JpaRepository<ClientePerfil, Long> {
    Optional<ClientePerfil> findByClienteId(Long clienteId);
}
