package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.order.model.CupomUso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CupomUsoRepository extends JpaRepository<CupomUso, Long> {

    long countByCupomIdAndClienteId(Long cupomId, Long clienteId);

}