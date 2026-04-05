package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;

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