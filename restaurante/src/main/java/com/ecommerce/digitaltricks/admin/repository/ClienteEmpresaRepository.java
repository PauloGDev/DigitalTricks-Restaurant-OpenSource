package com.ecommerce.digitaltricks.admin.repository;

import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClienteEmpresaRepository extends JpaRepository<ClienteEmpresa, Long> {

    @Query("""
    select ce
    from ClienteEmpresa ce
    join fetch ce.cliente c
    left join fetch c.perfil
    join fetch ce.empresa e
    where e.id = :empresaId
""")
    List<ClienteEmpresa> buscarComPerfil(@Param("empresaId") Long empresaId);

    Optional<ClienteEmpresa> findByClienteIdAndEmpresaId(Long clienteId, Long empresaId);

    boolean existsByClienteIdAndEmpresaId(Long clienteId, Long empresaId);

    List<ClienteEmpresa> findByEmpresaIdAndAtivoTrue(Long empresaId);

    List<ClienteEmpresa> findByClienteId(Long clienteId);
}