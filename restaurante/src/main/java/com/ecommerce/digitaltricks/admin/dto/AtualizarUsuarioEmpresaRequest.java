package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;

public record AtualizarUsuarioEmpresaRequest(
        PapelEmpresa papel,
        Boolean ativo
) {}