package com.ecommerce.digitaltricks.dto.empresa;

import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;

public record UsuarioEmpresaDTO(
        Long usuarioEmpresaId,
        Long usuarioId,
        String username,
        String nome,
        String email,
        Long empresaId,
        String empresaNome,
        PapelEmpresa papel,
        Boolean ativo
) {}