package com.ecommerce.digitaltricks.bot.model;

import com.ecommerce.digitaltricks.bot.enums.EstadoBot;
import jakarta.persistence.*;

@Entity
public class Conversa {

    @Id
    @GeneratedValue
    private Long id;

    private String telefone;

    private Long empresaId; // MULTI-TENANT

    @Enumerated(EnumType.STRING)
    private EstadoBot estado;

    private Long produtoSelecionadoId;

    private Long pedidoRascunhoId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Long getEmpresaId() {
        return empresaId;
    }

    public void setEmpresaId(Long empresaId) {
        this.empresaId = empresaId;
    }

    public EstadoBot getEstado() {
        return estado;
    }

    public void setEstado(EstadoBot estado) {
        this.estado = estado;
    }

    public Long getProdutoSelecionadoId() {
        return produtoSelecionadoId;
    }

    public void setProdutoSelecionadoId(Long produtoSelecionadoId) {
        this.produtoSelecionadoId = produtoSelecionadoId;
    }

    public Long getPedidoRascunhoId() {
        return pedidoRascunhoId;
    }

    public void setPedidoRascunhoId(Long pedidoRascunhoId) {
        this.pedidoRascunhoId = pedidoRascunhoId;
    }
}