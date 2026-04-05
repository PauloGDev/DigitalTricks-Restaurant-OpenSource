package com.ecommerce.digitaltricks.shared.util;

import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.shared.exception.ForbiddenException;
import com.ecommerce.digitaltricks.shared.exception.NotFoundException;
import org.springframework.stereotype.Component;

/**
 * Valida se um usuário tem acesso à empresa informada.
 * Extrai a lógica duplicada que aparecia em ProdutoService, EmpresaService,
 * PedidoAdminController, AnalyticsService e em todos os controllers admin.
 */
@Component
public class AcessoEmpresaValidator {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public AcessoEmpresaValidator(
            UsuarioRepository usuarioRepository,
            UsuarioEmpresaRepository usuarioEmpresaRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    /**
     * Busca o usuário pelo username e valida que ele tem acesso ativo à empresa.
     *
     * @param empresaId ID da empresa que será acessada
     * @param username  username do usuário autenticado
     * @return a entidade Usuario encontrada
     */
    public Usuario validarAcesso(Long empresaId, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        usuarioEmpresaRepository.findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuario.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        return usuario;
    }

    /**
     * Retorna o ID da primeira empresa ativa do usuário autenticado.
     */
    public Long obterEmpresaIdDoUsuario(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        return usuarioEmpresaRepository
                .findFirstByUsuarioIdAndAtivoTrueOrderByIdAsc(usuario.getId())
                .map(ue -> ue.getEmpresa().getId())
                .orElseThrow(() -> new ForbiddenException("Usuário não possui empresa"));
    }
}
