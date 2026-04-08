package com.ecommerce.digitaltricks.admin.repository;

import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioEmpresaRepository extends JpaRepository<UsuarioEmpresa, Long> {

    Optional<UsuarioEmpresa> findByUsuarioIdAndEmpresaId(Long usuarioId, Long empresaId);

    Optional<UsuarioEmpresa> findByUsuarioIdAndEmpresaIdAndAtivoTrue(Long usuarioId, Long empresaId);

    boolean existsByUsuarioIdAndEmpresaId(Long usuarioId, Long empresaId);

    boolean existsByUsuarioIdAndEmpresaIdAndAtivoTrue(Long usuarioId, Long empresaId);

    List<UsuarioEmpresa> findByUsuarioIdAndAtivoTrue(Long usuarioId);

    List<UsuarioEmpresa> findByEmpresaIdAndAtivoTrue(Long empresaId);

    Page<UsuarioEmpresa> findByEmpresaIdAndAtivoTrueAndPapelIn(
            Long empresaId,
            List<PapelEmpresa> papeis,
            Pageable pageable
    );

    Page<UsuarioEmpresa> findByEmpresaIdAndAtivoTrueAndPapelInAndUsuarioStatus(
            Long empresaId,
            List<PapelEmpresa> papeis,
            StatusUsuario status,
            Pageable pageable
    );

    List<UsuarioEmpresa> findAllByEmpresaIdAndAtivoTrue(Long id);

    Optional<UsuarioEmpresa> findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(Long id);

    List<UsuarioEmpresa> findByUsuarioUsernameAndAtivoTrue(String username);
}