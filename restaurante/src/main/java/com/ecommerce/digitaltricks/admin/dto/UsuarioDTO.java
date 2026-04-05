package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import java.util.Set;

public record UsuarioDTO(
        Long id,
        String username,
        String nome,
        String email,
        StatusUsuario status,
        Set<String> roles
) {}
