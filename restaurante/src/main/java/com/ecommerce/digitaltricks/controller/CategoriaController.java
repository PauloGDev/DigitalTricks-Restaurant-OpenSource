package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.CategoriaDTO;
import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.service.CategoriaService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas/{empresaId}/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public List<CategoriaDTO> listar(@PathVariable Long empresaId, Authentication authentication) {
        String username = authentication.getName();

        return categoriaService.listarCategorias(empresaId, username).stream()
                .map(c -> new CategoriaDTO(c.getId(), c.getNome()))
                .toList();
    }

    @PostMapping
    public CategoriaDTO criar(@PathVariable Long empresaId,
                              @RequestBody Categoria categoria,
                              Authentication authentication) {
        String username = authentication.getName();

        Categoria salva = categoriaService.criarCategoria(empresaId, categoria, username);
        return new CategoriaDTO(salva.getId(), salva.getNome());
    }

    @PutMapping("/{id}")
    public CategoriaDTO editar(@PathVariable Long empresaId,
                               @PathVariable Long id,
                               @RequestBody Categoria categoria,
                               Authentication authentication) {
        String username = authentication.getName();

        Categoria salva = categoriaService.editarCategoria(empresaId, id, categoria, username);
        return new CategoriaDTO(salva.getId(), salva.getNome());
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long empresaId,
                        @PathVariable Long id,
                        Authentication authentication) {
        String username = authentication.getName();
        categoriaService.excluirCategoria(empresaId, id, username);
    }
}