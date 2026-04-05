package com.ecommerce.digitaltricks.product.repository;

import com.ecommerce.digitaltricks.product.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    Optional<Categoria> findByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCase(String nome);
    List<Categoria> findByEmpresaIdOrderByNomeAsc(Long empresaId);

    Optional<Categoria> findByIdAndEmpresaId(Long id, Long empresaId);

    Optional<Categoria> findByEmpresaIdAndNomeIgnoreCase(Long empresaId, String nome);

    boolean existsByEmpresaIdAndNomeIgnoreCase(Long empresaId, String nome);

    List<Categoria> findByEmpresaId(Long id);
}
