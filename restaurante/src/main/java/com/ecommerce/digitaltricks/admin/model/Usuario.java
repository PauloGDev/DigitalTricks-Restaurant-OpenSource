package com.ecommerce.digitaltricks.admin.model;

import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    private String resetToken;

    @Enumerated(EnumType.STRING)
    private StatusUsuario status = StatusUsuario.ATIVO;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_roles", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "role")
    private Set<String> roles;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UsuarioEmpresa> empresas = new ArrayList<>();

    public Usuario() {}

    public Usuario(Long id, String username, String nome, String email, StatusUsuario status, Set<String> roles) {
        this.id = id;
        this.username = username;
        this.nome = nome;
        this.email = email;
        this.status = status;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public StatusUsuario getStatus() {
        return status;
    }

    public void setStatus(StatusUsuario status) {
        this.status = status;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public List<UsuarioEmpresa> getEmpresas() {
        return empresas;
    }

    public void setEmpresas(List<UsuarioEmpresa> empresas) {
        this.empresas = empresas;
    }

}