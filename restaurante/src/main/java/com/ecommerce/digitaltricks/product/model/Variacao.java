package com.ecommerce.digitaltricks.product.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
public class Variacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; // Ex: "Tamanho M", "Cor Azul"
    private BigDecimal preco; // preço da variação
    private BigDecimal precoPromocional; // preço da variação
    private Integer estoque; // estoque da variação

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id")
    private Produto produto;

    public Variacao() {}

    public Variacao(String nome, BigDecimal preco, Integer estoque, Produto produto) {
        this.nome = nome;
        this.preco = preco;
        this.estoque = estoque;
        this.produto = produto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public void setPrecoPromocional(BigDecimal precoPromocional) {
    }

    public BigDecimal getPrecoPromocional() {
        return precoPromocional;
    }
}
