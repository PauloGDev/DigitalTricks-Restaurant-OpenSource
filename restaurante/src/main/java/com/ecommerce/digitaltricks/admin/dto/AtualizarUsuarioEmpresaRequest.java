package com.ecommerce.digitaltricks.dto.empresa;

import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;

public record AtualizarUsuarioEmpresaRequest(
        PapelEmpresa papel,
        Boolean ativo
) {}