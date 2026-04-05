package com.ecommerce.digitaltricks.dto.empresa;

import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import jakarta.validation.constraints.NotNull;

public record AdicionarUsuarioEmpresaRequest(
        @NotNull(message = "Usuário é obrigatório")
        Long usuarioId,

        @NotNull(message = "Papel é obrigatório")
        PapelEmpresa papel
) {}