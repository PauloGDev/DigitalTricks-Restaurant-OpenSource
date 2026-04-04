package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.Carrinho;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarrinhoRepository extends JpaRepository<Carrinho, Long> {

    Optional<Carrinho> findByClienteIdAndEmpresaId(Long clienteId, Long empresaId);

    Optional<Carrinho> findBySessionId(String sessionId);
}