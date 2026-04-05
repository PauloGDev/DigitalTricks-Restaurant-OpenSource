package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.CategoriaDTO;
import com.ecommerce.digitaltricks.admin.dto.EmpresaDTO;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/restaurantes")
@CrossOrigin(origins = "*")
public class RestaurantePublicoController {

    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;

    public RestaurantePublicoController(EmpresaRepository empresaRepository,
                                        CategoriaRepository categoriaRepository) {
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<EmpresaDTO> buscarPorSlug(@PathVariable String slug) {
        Empresa empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        EmpresaDTO dto = new EmpresaDTO(
                empresa.getId(),
                empresa.getNomeFantasia(),
                empresa.getRazaoSocial(),
                empresa.getCnpj(),
                empresa.getEmail(),
                empresa.getTelefone(),
                empresa.getStatus(),
                empresa.getMpContaConectada(),

                empresa.getLogoUrl(),
                empresa.getCategoriaPreview(),
                empresa.getHorariosFuncionamento(),

                empresa.getCep(),
                empresa.getLogradouro(),
                empresa.getNumero(),
                empresa.getBairro(),
                empresa.getCidade(),
                empresa.getComplemento(),
                empresa.getUf(),

                empresa.getAceitaRetirada(),
                empresa.getAceitaDelivery(),

                empresa.getRaioEntregaKm(),
                empresa.getTaxaEntregaFixa(),
                empresa.getValorPorKm(),
                empresa.getPedidoMinimoDelivery(),
                empresa.getValorFreteGratis(),

                empresa.isAbertoAgora()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{slug}/categorias")
    public ResponseEntity<List<CategoriaDTO>> listarCategorias(@PathVariable String slug) {
        Empresa empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        List<CategoriaDTO> categorias = categoriaRepository.findByEmpresaIdOrderByNomeAsc(empresa.getId())
                .stream()
                .map(c -> new CategoriaDTO(c.getId(), c.getNome()))
                .toList();

        return ResponseEntity.ok(categorias);
    }
}