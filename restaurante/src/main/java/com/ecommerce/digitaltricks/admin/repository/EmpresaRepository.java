package com.ecommerce.digitaltricks.admin.repository;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Long> {

    Optional<Empresa> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

    Optional<Empresa> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    Empresa getEmpresaBySlug(String slug);

    Empresa getEmpresaById(Long id);
}