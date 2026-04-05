package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.product.model.Variacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VariacaoRepository extends JpaRepository<Variacao, Long> {
    @Override
    Optional<Variacao> findById(Long aLong);
}
