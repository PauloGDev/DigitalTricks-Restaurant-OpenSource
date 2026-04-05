package com.ecommerce.digitaltricks.model;

import jakarta.persistence.*;

@Entity
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String nome; // Ex: ROLE_USER, ROLE_ADMIN

    public Role() {}

    public Role(String nome) {
        this.nome = nome;
    }

    // getters e setters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
