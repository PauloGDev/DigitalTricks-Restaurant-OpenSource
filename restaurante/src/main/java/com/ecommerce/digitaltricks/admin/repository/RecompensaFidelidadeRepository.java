package com.ecommerce.digitaltricks.admin.repository;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.RecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecompensaFidelidadeRepository extends JpaRepository<RecompensaFidelidade, Long> {

    List<RecompensaFidelidade> findByEmpresaAndAtivoTrueOrderByValorPontosAsc(Empresa empresa);

    List<RecompensaFidelidade> findByEmpresaOrderByValorPontosAsc(Empresa empresa);

    List<RecompensaFidelidade> findByEmpresaAndTipoOrderByValorPontosAsc(Empresa empresa, TipoRecompensaFidelidade tipo);

    @Query("SELECT r FROM RecompensaFidelidade r WHERE r.empresa = :empresa AND r.ativo = true AND " +
           "(r.estoque = 0 OR r.estoque > r.estoqueUtilizado) AND " +
           "(r.dataInicio IS NULL OR r.dataInicio <= :agora) AND " +
           "(r.dataFim IS NULL OR r.dataFim >= :agora) " +
           "ORDER BY r.valorPontos ASC")
    List<RecompensaFidelidade> findDisponiveis(@Param("empresa") Empresa empresa, @Param("agora") LocalDateTime agora);

    @Query("SELECT r FROM RecompensaFidelidade r WHERE r.empresa = :empresa AND r.ativo = true AND r.valorPontos <= :pontos AND " +
           "(r.estoque = 0 OR r.estoque > r.estoqueUtilizado) AND " +
           "(r.dataInicio IS NULL OR r.dataInicio <= :agora) AND " +
           "(r.dataFim IS NULL OR r.dataFim >= :agora) " +
           "ORDER BY r.valorPontos ASC")
    List<RecompensaFidelidade> findDisponiveisPorPontos(
            @Param("empresa") Empresa empresa,
            @Param("pontos") Integer pontos,
            @Param("agora") LocalDateTime agora);

    Optional<RecompensaFidelidade> findByEmpresaAndId(Empresa empresa, Long id);

    long countByEmpresa(Empresa empresa);
}