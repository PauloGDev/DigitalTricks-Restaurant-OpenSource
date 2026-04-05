package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.StatusEmpresa;

public record EmpresaDTO(
        Long id,
        String nomeFantasia,
        String razaoSocial,
        String cnpj,
        String email,
        String telefone,
        StatusEmpresa status,
        Boolean mpContaConectada,

        String logoUrl,
        String categoriaPreview,
        String horariosFuncionamento,

        String cep,
        String logradouro,
        String numero,
        String bairro,
        String cidade,
        String complemento,
        String uf,

        Boolean aceitaRetirada,
        Boolean aceitaDelivery,

        Double raioEntregaKm,
        Double taxaEntregaFixa,
        Double valorPorKm,
        Double pedidoMinimoDelivery,
        Double valorFreteGratis,

        boolean abertoAgora
) {}