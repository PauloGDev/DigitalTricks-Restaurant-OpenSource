package com.ecommerce.digitaltricks.product.repository;

import com.ecommerce.digitaltricks.product.model.Produto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    Page<Produto> findByEmpresaId(Long empresaId, Pageable pageable);

    Page<Produto> findByEmpresaIdAndNomeContainingIgnoreCase(Long empresaId, String nome, Pageable pageable);

    Page<Produto> findByEmpresaIdAndCategorias_NomeInIgnoreCase(Long empresaId, List<String> categorias, Pageable pageable);

    Optional<Produto> findByIdAndEmpresaId(Long id, Long empresaId);

    Optional<Produto> findByEmpresaIdAndSlug(Long empresaId, String slug);

    List<Produto> findByEmpresaIdAndCategorias_Id(Long empresaId, Long categoriaId);

    @Query("""
        select distinct p
        from Produto p
        join p.categorias c
        where p.empresa.id = :empresaId
          and lower(c.nome) = lower(:categoria)
          and p.ativo = true
        order by p.pedidos desc, p.id desc
    """)
    List<Produto> findMaisVendidosPorCategoriaEEmpresa(
            @Param("empresaId") Long empresaId,
            @Param("categoria") String categoria,
            Pageable pageable
    );

    @Query("""
        select distinct p
        from Produto p
        join p.categorias c
        where p.empresa.id = :empresaId
          and lower(c.nome) = lower(:categoria)
          and p.ativo = true
          and p.pedidos = 0
        order by p.id desc
    """)
    List<Produto> findNaoVendidosPorCategoriaEEmpresa(
            @Param("empresaId") Long empresaId,
            @Param("categoria") String categoria,
            Pageable pageable
    );
}