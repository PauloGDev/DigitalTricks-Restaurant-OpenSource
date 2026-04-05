package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.enums.pedido.TipoItemPedidoOpcional;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "item_pedido_opcional")
public class ItemPedidoOpcional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long opcionalItemId;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precoExtra = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer quantidade = 1;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column
    private Long grupoId;

    @Column
    private String grupoNome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TipoItemPedidoOpcional tipo = TipoItemPedidoOpcional.OPCIONAL_SELECAO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_pedido_id", nullable = false)
    private ItemPedido itemPedido;

    public ItemPedidoOpcional() {}

    public ItemPedidoOpcional(
            Long opcionalItemId,
            String nome,
            BigDecimal precoExtra,
            Integer quantidade,
            TipoItemPedidoOpcional tipo,
            Long grupoId,
            String grupoNome,
            ItemPedido itemPedido
    ) {
        this.opcionalItemId = opcionalItemId;
        this.nome = nome;
        this.precoExtra = precoExtra != null ? precoExtra : BigDecimal.ZERO;
        this.quantidade = quantidade != null && quantidade > 0 ? quantidade : 1;
        this.tipo = tipo != null ? tipo : TipoItemPedidoOpcional.OPCIONAL_SELECAO;
        this.grupoId = grupoId;
        this.grupoNome = grupoNome;
        this.itemPedido = itemPedido;
        recalcularSubtotal();
    }

    @PrePersist
    @PreUpdate
    public void normalize() {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do opcional do pedido é obrigatório.");
        }

        if (precoExtra == null) {
            precoExtra = BigDecimal.ZERO;
        }

        if (precoExtra.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Preço extra do opcional não pode ser negativo.");
        }

        if (quantidade == null || quantidade <= 0) {
            quantidade = 1;
        }

        if (tipo == null) {
            tipo = TipoItemPedidoOpcional.OPCIONAL_SELECAO;
        }

        recalcularSubtotal();
    }

    public Long getGrupoId() {
        return grupoId;
    }

    public void setGrupoId(Long grupoId) {
        this.grupoId = grupoId;
    }

    public String getGrupoNome() {
        return grupoNome;
    }

    public void setGrupoNome(String grupoNome) {
        this.grupoNome = grupoNome;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOpcionalItemId() {
        return opcionalItemId;
    }

    public void setOpcionalItemId(Long opcionalItemId) {
        this.opcionalItemId = opcionalItemId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public BigDecimal getPrecoExtra() {
        return precoExtra;
    }

    public void setPrecoExtra(BigDecimal precoExtra) {
        this.precoExtra = precoExtra != null ? precoExtra : BigDecimal.ZERO;
        recalcularSubtotal();
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = (quantidade != null && quantidade > 0) ? quantidade : 1;
        recalcularSubtotal();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
    }

    public TipoItemPedidoOpcional getTipo() {
        return tipo;
    }

    public void setTipo(TipoItemPedidoOpcional tipo) {
        this.tipo = tipo != null ? tipo : TipoItemPedidoOpcional.OPCIONAL_SELECAO;
    }

    public ItemPedido getItemPedido() {
        return itemPedido;
    }

    public void setItemPedido(ItemPedido itemPedido) {
        this.itemPedido = itemPedido;
    }

    public void recalcularSubtotal() {
        this.subtotal = (this.precoExtra != null ? this.precoExtra : BigDecimal.ZERO)
                .multiply(BigDecimal.valueOf(this.quantidade != null ? this.quantidade : 1));
    }
}