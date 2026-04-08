package com.ecommerce.digitaltricks.product.controller;

import com.ecommerce.digitaltricks.product.dto.CategoriaDTO;
import com.ecommerce.digitaltricks.admin.dto.EmpresaDTO;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.product.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/restaurantes")
@CrossOrigin(origins = "*")
public class RestaurantePublicoController {

    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public RestaurantePublicoController(EmpresaRepository empresaRepository,
                                        CategoriaRepository categoriaRepository,
                                        UsuarioEmpresaRepository usuarioEmpresaRepository) {
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<EmpresaDTO> buscarPorSlug(@PathVariable String slug) {
        Empresa empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        EmpresaDTO dto = new EmpresaDTO(
                empresa.getId(),
                empresa.getNomeFantasia(),
                empresa.getRazaoSocial(),
                empresa.getSlug(),
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

    @GetMapping("/me")
    public ResponseEntity<EmpresaDTO> buscarMeuRestaurante(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Usuário não autenticado");
        }

        String username = authentication.getName();

        // Buscar empresa do usuário autenticado
        UsuarioEmpresa vinculo = usuarioEmpresaRepository.findByUsuarioUsernameAndAtivoTrue(username)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Nenhuma empresa encontrada para o usuário"));

        Empresa empresa = vinculo.getEmpresa();

        EmpresaDTO dto = new EmpresaDTO(
                empresa.getId(),
                empresa.getNomeFantasia(),
                empresa.getRazaoSocial(),
                empresa.getSlug(),
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