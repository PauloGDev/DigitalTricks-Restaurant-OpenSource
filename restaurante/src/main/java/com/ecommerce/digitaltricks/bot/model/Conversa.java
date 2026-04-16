package com.ecommerce.digitaltricks.bot.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.bot.enums.EstadoBot;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        uniqueConstraints = @UniqueConstraint(columnNames = {"telefone", "empresaId"})
)
public class Conversa {

    @Id
    @GeneratedValue
    private Long id;

    private String telefone; // SEMPRE formato internacional

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    private EstadoBot estado;

    private Long produtoSelecionadoId;

    private Long pedidoRascunhoId;

    private LocalDateTime ultimaInteracao;

    private Boolean ativo = true;

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

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
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

    public LocalDateTime getUltimaInteracao() {
        return ultimaInteracao;
    }

    public void setUltimaInteracao(LocalDateTime ultimaInteracao) {
        this.ultimaInteracao = ultimaInteracao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}