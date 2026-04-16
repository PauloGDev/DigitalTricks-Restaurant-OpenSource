package com.ecommerce.digitaltricks.bot.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import jakarta.persistence.*;

@Entity
public class NumeroWhatsapp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phoneNumberId; // Meta

    private String numero; // +558599999999

    private String tokenCriptografado;

    private Boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPhoneNumberId() {
        return phoneNumberId;
    }

    public void setPhoneNumberId(String phoneNumberId) {
        this.phoneNumberId = phoneNumberId;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getToken() {
        return tokenCriptografado;
    }

    public void setToken(String tokenCriptografado) {
        this.tokenCriptografado = tokenCriptografado;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }
}