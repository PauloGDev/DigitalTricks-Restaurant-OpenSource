package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.UsuarioDTO;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.service.UsuarioService;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public Page<UsuarioDTO> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String status
    ) {
        return usuarioService.listarTodos(page, size, status);
    }

    @PostMapping
    public UsuarioDTO criar(@RequestBody Usuario usuario) {
        return usuarioService.toDTO(usuarioService.criar(usuario));
    }

    @PutMapping("/{id}")
    public UsuarioDTO atualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioService.toDTO(usuarioService.atualizar(id, usuario));
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        usuarioService.excluir(id);
    }

    @GetMapping("/me")
    public UsuarioDTO getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("Usuário não autenticado");
        }
        return usuarioService.buscarPorUsername(userDetails.getUsername());
    }
}

