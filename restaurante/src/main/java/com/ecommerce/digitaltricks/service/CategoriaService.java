package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.model.Empresa;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository,
                            ProdutoRepository produtoRepository,
                            EmpresaRepository empresaRepository,
                            UsuarioRepository usuarioRepository,
                            UsuarioEmpresaRepository usuarioEmpresaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    public List<Categoria> listarCategorias(Long empresaId, String username) {
        validarAcessoEmpresa(empresaId, username);
        return categoriaRepository.findByEmpresaIdOrderByNomeAsc(empresaId);
    }

    public Categoria criarCategoria(Long empresaId, Categoria categoria, String username) {
        validarAcessoEmpresa(empresaId, username);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (categoria.getNome() == null || categoria.getNome().isBlank()) {
            throw new RuntimeException("Nome da categoria é obrigatório");
        }

        if (categoriaRepository.existsByEmpresaIdAndNomeIgnoreCase(empresaId, categoria.getNome().trim())) {
            throw new RuntimeException("Já existe uma categoria com esse nome nesta empresa");
        }

        categoria.setNome(categoria.getNome().trim());
        categoria.setEmpresa(empresa);

        return categoriaRepository.save(categoria);
    }

    public Categoria editarCategoria(Long empresaId, Long id, Categoria categoriaAtualizada, String username) {
        validarAcessoEmpresa(empresaId, username);

        Categoria existente = categoriaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        String novoNome = categoriaAtualizada.getNome() != null ? categoriaAtualizada.getNome().trim() : null;
        if (novoNome == null || novoNome.isBlank()) {
            throw new RuntimeException("Nome da categoria é obrigatório");
        }

        if (!existente.getNome().equalsIgnoreCase(novoNome)
                && categoriaRepository.existsByEmpresaIdAndNomeIgnoreCase(empresaId, novoNome)) {
            throw new RuntimeException("Já existe uma categoria com esse nome nesta empresa");
        }

        existente.setNome(novoNome);
        return categoriaRepository.save(existente);
    }

    @Transactional
    public void excluirCategoria(Long empresaId, Long id, String username) {
        validarAcessoEmpresa(empresaId, username);

        Categoria categoria = categoriaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        List<Produto> produtos = produtoRepository.findByEmpresaIdAndCategorias_Id(empresaId, id);
        for (Produto produto : produtos) {
            produto.getCategorias().remove(categoria);
            produtoRepository.save(produto);
        }

        categoriaRepository.delete(categoria);
    }

    private void validarAcessoEmpresa(Long empresaId, String username) {
        var usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuarioEmpresaRepository.findByUsuarioIdAndEmpresaId(usuario.getId(), empresaId)
                .orElseThrow(() -> new RuntimeException("Você não tem acesso a esta empresa"));
    }
}