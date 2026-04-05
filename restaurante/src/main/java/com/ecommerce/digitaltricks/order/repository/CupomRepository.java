package com.ecommerce.digitaltricks.order.repository;

import com.ecommerce.digitaltricks.order.model.Cupom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface CupomRepository extends JpaRepository<Cupom, Long> {

    Optional<Cupom> findByEmpresaIdAndCodigoIgnoreCase(Long empresaId, String codigo);

    boolean existsByEmpresaIdAndCodigoIgnoreCase(Long empresaId, String codigo);

    List<Cupom> findByEmpresaIdOrderByIdDesc(Long empresaId);

    Optional<Cupom> findByIdAndEmpresaId(Long id, Long empresaId);

    Collection<Object> findByEmpresaId(Long id);
}