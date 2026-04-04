package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.model.PedidoStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoStatusLogRepository extends JpaRepository<PedidoStatusLog, Long> {
    List<PedidoStatusLog> findByPedidoIdOrderByDataAsc(Long pedidoId);
    boolean existsByPedidoId(Long pedidoId);
}