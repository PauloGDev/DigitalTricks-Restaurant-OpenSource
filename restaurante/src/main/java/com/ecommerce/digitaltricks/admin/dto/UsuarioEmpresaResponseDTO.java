package com.ecommerce.digitaltricks.dto.empresa;

import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import com.ecommerce.digitaltricks.enums.usuarios.StatusUsuario;

import java.util.Set;

public class UsuarioEmpresaResponseDTO {
    private Long usuarioId;
    private Long usuarioEmpresaId;
    private String username;
    private String nome;
    private String email;
    private StatusUsuario status;
    private Set<String> roles;
    private PapelEmpresa papel;

    public UsuarioEmpresaResponseDTO(
            Long usuarioId,
            Long usuarioEmpresaId,
            String username,
            String nome,
            String email,
            StatusUsuario status,
            Set<String> roles,
            PapelEmpresa papel
    ) {
        this.usuarioId = usuarioId;
        this.usuarioEmpresaId = usuarioEmpresaId;
        this.username = username;
        this.nome = nome;
        this.email = email;
        this.status = status;
        this.roles = roles;
        this.papel = papel;
    }

    public Long getUsuarioId() { return usuarioId; }
    public Long getUsuarioEmpresaId() { return usuarioEmpresaId; }
    public String getUsername() { return username; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public StatusUsuario getStatus() { return status; }
    public Set<String> getRoles() { return roles; }
    public PapelEmpresa getPapel() { return papel; }
}