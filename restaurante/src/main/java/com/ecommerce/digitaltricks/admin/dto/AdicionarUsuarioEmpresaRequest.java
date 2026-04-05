package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;
import jakarta.validation.constraints.NotNull;

public record AdicionarUsuarioEmpresaRequest(
        @NotNull(message = "Usuário é obrigatório")
        Long usuarioId,

        @NotNull(message = "Papel é obrigatório")
        PapelEmpresa papel
) {}