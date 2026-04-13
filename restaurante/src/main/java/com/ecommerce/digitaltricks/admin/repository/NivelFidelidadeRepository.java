package com.ecommerce.digitaltricks.admin.repository;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.NivelFidelidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NivelFidelidadeRepository extends JpaRepository<NivelFidelidade, Long> {
    List<NivelFidelidade> findByEmpresaOrderByMinPontosAscOrdemExibicaoAsc(Empresa empresa);
    void deleteByEmpresa(Empresa empresa);
}
