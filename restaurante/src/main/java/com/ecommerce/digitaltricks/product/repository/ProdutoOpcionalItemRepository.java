package com.ecommerce.digitaltricks.product.repository;

import com.ecommerce.digitaltricks.product.model.ProdutoOpcionalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ProdutoOpcionalItemRepository extends JpaRepository<ProdutoOpcionalItem, Long> {

    @Query("""
        select i from ProdutoOpcionalItem i
        join fetch i.grupo g
        where i.id in :ids
    """)
    List<ProdutoOpcionalItem> findAllByIdInWithGrupo(@Param("ids") Collection<Long> ids);
}