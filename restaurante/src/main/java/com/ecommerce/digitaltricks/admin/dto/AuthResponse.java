package com.ecommerce.digitaltricks.dto;

public class AuthResponse {
    private String token;
    private Long usuarioId;
    private String username;
    private Long empresaId;

    public AuthResponse(String token, Long usuarioId, String username, Long empresaId) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.username = username;
        this.empresaId = empresaId;
    }

    public String getToken() {
        return token;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getUsername() {
        return username;
    }

    public Long getEmpresaId() {
        return empresaId;
    }
}