package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.costumer.model.Cliente;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cupom_uso")
public class CupomUso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cupom_id")
    private Cupom cupom;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Column(nullable = false)
    private LocalDateTime dataUso = LocalDateTime.now();

    public CupomUso() {}

    public CupomUso(Cupom cupom, Cliente cliente, Pedido pedido) {
        this.cupom = cupom;
        this.cliente = cliente;
        this.pedido = pedido;
    }


    public Long getId() { return id; }

    public Cupom getCupom() { return cupom; }
    public void setCupom(Cupom cupom) { this.cupom = cupom; }

    public void setId(Long id) {
        this.id = id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public LocalDateTime getDataUso() { return dataUso; }
    public void setDataUso(LocalDateTime dataUso) { this.dataUso = dataUso; }
}