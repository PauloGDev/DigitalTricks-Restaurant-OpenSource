package com.ecommerce.digitaltricks.dto.empresa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record AtualizarEmpresaRequest(
        @Size(max = 150, message = "Nome fantasia deve ter no máximo 150 caracteres")
        String nomeFantasia,

        @Size(max = 150, message = "Razão social deve ter no máximo 150 caracteres")
        String razaoSocial,

        String cnpj,

        @Size(max = 180, message = "Slug deve ter no máximo 180 caracteres")
        String slug,

        @Email(message = "Email inválido")
        @Size(max = 150, message = "Email deve ter no máximo 150 caracteres")
        String email,

        @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
        String telefone,

        @Size(max = 20, message = "CEP deve ter no máximo 20 caracteres")
        String cep,

        @Size(max = 255, message = "Logradouro deve ter no máximo 255 caracteres")
        String logradouro,

        @Size(max = 20, message = "Número deve ter no máximo 20 caracteres")
        String numero,

        @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
        String bairro,

        @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
        String cidade,

        @Size(max = 255, message = "Complemento deve ter no máximo 255 caracteres")
        String complemento,

        @Size(max = 2, message = "UF deve ter no máximo 2 caracteres")
        String uf,

        Boolean aceitaRetirada,
        Boolean aceitaDelivery,
        Double raioEntregaKm,
        Double taxaEntregaFixa,
        Double valorPorKm,
        Double pedidoMinimoDelivery,
        Double valorFreteGratis,

        String logoUrl,
        String categoriaPreview,
        Object horariosFuncionamento
) {}