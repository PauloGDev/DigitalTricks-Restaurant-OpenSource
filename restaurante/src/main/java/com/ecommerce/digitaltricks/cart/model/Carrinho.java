package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.order.model.Cupom;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
@Table(
        name = "carrinho",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"cliente_id", "empresa_id"})
        }
)
public class Carrinho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @OneToMany(mappedBy = "carrinho", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CarrinhoItem> itens = new ArrayList<>();

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cupom_id")
    private Cupom cupom;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal descontoCupom = BigDecimal.ZERO;

    @Column(length = 500)
    private String motivoCupomInvalido;

    @Column(length = 100)
    private String codigoErroCupom;

    public String getMotivoCupomInvalido() {
        return motivoCupomInvalido;
    }

    public void setMotivoCupomInvalido(String motivoCupomInvalido) {
        this.motivoCupomInvalido = motivoCupomInvalido;
    }

    public String getCodigoErroCupom() {
        return codigoErroCupom;
    }

    public void setCodigoErroCupom(String codigoErroCupom) {
        this.codigoErroCupom = codigoErroCupom;
    }

    public Carrinho() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public List<CarrinhoItem> getItens() {
        return itens;
    }

    public void setItens(List<CarrinhoItem> itens) {
        this.itens = itens != null ? itens : new ArrayList<>();
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total != null ? total : BigDecimal.ZERO;
    }

    public Cupom getCupom() {
        return cupom;
    }

    public void setCupom(Cupom cupom) {
        this.cupom = cupom;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
    }

    public BigDecimal getDescontoCupom() {
        return descontoCupom;
    }

    public void setDescontoCupom(BigDecimal descontoCupom) {
        this.descontoCupom = descontoCupom != null ? descontoCupom : BigDecimal.ZERO;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public void limparCarrinho() {
        itens.clear();
        subtotal = BigDecimal.ZERO;
        descontoCupom = BigDecimal.ZERO;
        total = BigDecimal.ZERO;
        cupom = null;
    }

    public void removerItem(Long produtoId) {
        itens.removeIf(item ->
                item.getProduto() != null &&
                        item.getProduto().getId().equals(produtoId)
        );
        calcularTotal();
    }

    public void calcularTotal() {
        this.subtotal = itens.stream()
                .map(item -> {
                    BigDecimal pu = Optional.ofNullable(item.getPrecoUnitario()).orElse(BigDecimal.ZERO);
                    int qtd = Math.max(1, item.getQuantidade());
                    return pu.multiply(BigDecimal.valueOf(qtd));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal desconto = Optional.ofNullable(this.descontoCupom).orElse(BigDecimal.ZERO);

        if (desconto.compareTo(this.subtotal) > 0) {
            desconto = this.subtotal;
        }

        this.total = this.subtotal.subtract(desconto);
    }
}