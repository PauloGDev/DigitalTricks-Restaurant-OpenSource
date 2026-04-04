package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
public class ItemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    private String nomeProduto;
    private int quantidade;

    @Column(precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    private String imagemUrl;

    @ManyToOne
    @JoinColumn(name = "variacao_id")
    private Variacao variacao;

    @OneToMany(mappedBy = "itemPedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedidoOpcional> opcionais = new ArrayList<>();

    @Column(columnDefinition = "varchar(140)")
    private String observacao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalOpcionais = BigDecimal.ZERO;

    public ItemPedido() {}

    public ItemPedido(
            Produto produto,
            String nomeProduto,
            int quantidade,
            BigDecimal precoUnitario,
            String imagemUrl
    ) {
        this.produto = produto;
        this.nomeProduto = nomeProduto;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
        this.imagemUrl = imagemUrl;
    }

    @PrePersist
    @PreUpdate
    public void normalizeAndRecalculate() {
        if (quantidade <= 0) {
            quantidade = 1;
        }

        if (precoUnitario == null) {
            precoUnitario = BigDecimal.ZERO;
        }

        if (observacao != null && observacao.isBlank()) {
            observacao = null;
        }

        vincularOpcionais();
        recalcularTotalOpcionais();
    }

    public void vincularOpcionais() {
        if (opcionais == null) {
            opcionais = new ArrayList<>();
            return;
        }

        for (ItemPedidoOpcional opcional : opcionais) {
            if (opcional != null) {
                opcional.setItemPedido(this);
                opcional.recalcularSubtotal();
            }
        }
    }

    public void recalcularTotalOpcionais() {
        BigDecimal total = BigDecimal.ZERO;

        if (opcionais != null) {
            for (ItemPedidoOpcional opcional : opcionais) {
                if (opcional != null && opcional.getSubtotal() != null) {
                    total = total.add(opcional.getSubtotal());
                }
            }
        }

        this.totalOpcionais = total;
    }

    @Transient
    public BigDecimal getTotalUnitarioComOpcionais() {
        BigDecimal base = precoUnitario != null ? precoUnitario : BigDecimal.ZERO;
        BigDecimal extras = totalOpcionais != null ? totalOpcionais : BigDecimal.ZERO;
        return base.add(extras);
    }

    @Transient
    public BigDecimal getTotalItem() {
        return getTotalUnitarioComOpcionais().multiply(BigDecimal.valueOf(Math.max(quantidade, 1)));
    }

    public void addOpcional(ItemPedidoOpcional opcional) {
        if (opcional == null) return;
        opcional.setItemPedido(this);
        opcional.recalcularSubtotal();
        this.opcionais.add(opcional);
        recalcularTotalOpcionais();
    }

    public Variacao getVariacao() {
        return variacao;
    }

    public void setVariacao(Variacao variacao) {
        this.variacao = variacao;
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

    public String getNomeProduto() {
        return nomeProduto;
    }

    public void setNomeProduto(String nomeProduto) {
        this.nomeProduto = nomeProduto;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade > 0 ? quantidade : 1;
    }

    public BigDecimal getPrecoUnitario() {
        return precoUnitario;
    }

    public void setPrecoUnitario(BigDecimal precoUnitario) {
        this.precoUnitario = precoUnitario != null ? precoUnitario : BigDecimal.ZERO;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public List<ItemPedidoOpcional> getOpcionais() {
        return opcionais;
    }

    public void setOpcionais(List<ItemPedidoOpcional> opcionais) {
        this.opcionais = new ArrayList<>();
        if (opcionais != null) {
            for (ItemPedidoOpcional opcional : opcionais) {
                addOpcional(opcional);
            }
        } else {
            recalcularTotalOpcionais();
        }
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public BigDecimal getTotalOpcionais() {
        return totalOpcionais;
    }

    public void setTotalOpcionais(BigDecimal totalOpcionais) {
        this.totalOpcionais = totalOpcionais != null ? totalOpcionais : BigDecimal.ZERO;
    }

    public Long getProdutoId() {
        return this.produto != null ? this.produto.getId() : null;
    }
}