package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "cliente_empresa",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"cliente_id", "empresa_id"})
        }
)
public class ClienteEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(nullable = false)
    private Boolean bloqueado = false;

    @Column(nullable = false)
    private Integer totalPedidos = 0;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalGasto = BigDecimal.ZERO;

    private LocalDateTime ultimoPedidoEm;

    @Column(length = 500)
    private String observacoesInternas;

    public ClienteEmpresa() {
    }

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

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public Integer getTotalPedidos() {
        return totalPedidos;
    }

    public void setTotalPedidos(Integer totalPedidos) {
        this.totalPedidos = totalPedidos;
    }

    public BigDecimal getTotalGasto() {
        return totalGasto;
    }

    public void setTotalGasto(BigDecimal totalGasto) {
        this.totalGasto = totalGasto;
    }

    public LocalDateTime getUltimoPedidoEm() {
        return ultimoPedidoEm;
    }

    public void setUltimoPedidoEm(LocalDateTime ultimoPedidoEm) {
        this.ultimoPedidoEm = ultimoPedidoEm;
    }

    public String getObservacoesInternas() {
        return observacoesInternas;
    }

    public void setObservacoesInternas(String observacoesInternas) {
        this.observacoesInternas = observacoesInternas;
    }
}