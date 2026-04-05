package com.ecommerce.digitaltricks.product.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "produto_opcional_item")
public class ProdutoOpcionalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoExtra = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean ativo = true;

    private Integer estoque;

    @Column(nullable = false)
    private int ordem = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", nullable = false)
    private ProdutoOpcionalGrupo grupo;

    @PrePersist
    @PreUpdate
    public void normalize() {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do item opcional é obrigatório.");
        }

        if (precoExtra == null) {
            precoExtra = BigDecimal.ZERO;
        }

        if (precoExtra.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Preço extra não pode ser negativo.");
        }

        if (estoque != null && estoque < 0) {
            throw new IllegalArgumentException("Estoque do item opcional não pode ser negativo.");
        }

        if (ordem < 0) {
            ordem = 0;
        }
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public BigDecimal getPrecoExtra() { return precoExtra; }

    public void setPrecoExtra(BigDecimal precoExtra) {
        this.precoExtra = (precoExtra != null) ? precoExtra : BigDecimal.ZERO;
    }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }
    public int getOrdem() { return ordem; }

    public void setOrdem(int ordem) {
        this.ordem = Math.max(0, ordem);
    }

    public ProdutoOpcionalGrupo getGrupo() { return grupo; }
    public void setGrupo(ProdutoOpcionalGrupo grupo) { this.grupo = grupo; }
}