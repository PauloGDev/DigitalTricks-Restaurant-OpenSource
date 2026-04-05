package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.model.Variacao;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "carrinho_item")
public class CarrinhoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @ManyToOne
    @JoinColumn(name = "variacao_id")
    private Variacao variacao;

    private String nomeProduto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrinho_id")
    private Carrinho carrinho;

    private String variacaoNome;
    private BigDecimal precoUnitario;
    private int quantidade;
    private String imagemUrl;

    @Column(columnDefinition = "TEXT")
    private String opcionaisJson;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(length = 64)
    private String signature;

    public CarrinhoItem() {
    }

    public CarrinhoItem(Produto produto, int quantidade, String imagemUrl) {
        this.produto = produto;
        this.quantidade = quantidade;
        this.imagemUrl = imagemUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Variacao getVariacao() {
        return variacao;
    }

    public void setVariacao(Variacao variacao) {
        this.variacao = variacao;
    }

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public Carrinho getCarrinho() {
        return carrinho;
    }

    public void setCarrinho(Carrinho carrinho) {
        this.carrinho = carrinho;
    }

    public String getVariacaoNome() {
        return variacaoNome;
    }

    public void setVariacaoNome(String variacaoNome) {
        this.variacaoNome = variacaoNome;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getOpcionaisJson() {
        return opcionaisJson;
    }

    public void setOpcionaisJson(String opcionaisJson) {
        this.opcionaisJson = opcionaisJson;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}