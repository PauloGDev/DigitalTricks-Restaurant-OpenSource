package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import jakarta.persistence.*;

@Entity
@Table(
        name = "usuario_empresa",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"usuario_id", "empresa_id"})
        }
)
public class UsuarioEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelEmpresa papel;

    @Column(nullable = false)
    private Boolean ativo = true;

    public UsuarioEmpresa() {
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public PapelEmpresa getPapel() {
        return papel;
    }

    public void setPapel(PapelEmpresa papel) {
        this.papel = papel;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}