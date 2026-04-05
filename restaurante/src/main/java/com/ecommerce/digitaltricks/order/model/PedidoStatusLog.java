package com.ecommerce.digitaltricks.order.model;

import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pedido_status_log")
public class PedidoStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status;

    @Column(nullable = false)
    private LocalDateTime data;

    public PedidoStatusLog() {}

    public PedidoStatusLog(Pedido pedido, StatusPedido status, LocalDateTime data) {
        this.pedido = pedido;
        this.status = status;
        this.data = data;
    }

    public Long getId() {
        return id;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }
}