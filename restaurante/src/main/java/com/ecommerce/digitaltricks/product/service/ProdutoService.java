package com.ecommerce.digitaltricks.product.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.admin.enums.TipoDescontoPromocao;
import com.ecommerce.digitaltricks.product.enums.TipoGrupoProduto;
import com.ecommerce.digitaltricks.product.dto.ProdutoDTO;
import com.ecommerce.digitaltricks.product.dto.ProdutoOpcionalGrupoDTO;
import com.ecommerce.digitaltricks.product.dto.ProdutoOpcionalItemDTO;
import com.ecommerce.digitaltricks.product.dto.VariacaoDTO;
import com.ecommerce.digitaltricks.product.model.*;
import com.ecommerce.digitaltricks.product.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.product.repository.VariacaoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.JoinType;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final Cloudinary cloudinary;
    private final VariacaoRepository variacaoRepository;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public ProdutoService(
            ProdutoRepository produtoRepository,
            CategoriaRepository categoriaRepository,
            Cloudinary cloudinary,
            VariacaoRepository variacaoRepository,
            EmpresaRepository empresaRepository,
            UsuarioRepository usuarioRepository,
            UsuarioEmpresaRepository usuarioEmpresaRepository
    ) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.cloudinary = cloudinary;
        this.variacaoRepository = variacaoRepository;
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    // =========================
    // LISTAGENS
    // =========================

    public Page<Produto> listarPaginado(Long empresaId, String search, List<String> categorias, Pageable pageable, String username) {
        validarAcessoEmpresa(empresaId, username);

        if (search != null && !search.isBlank()) {
            return produtoRepository.findByEmpresaIdAndNomeContainingIgnoreCase(empresaId, search, pageable);
        }

        if (categorias != null && !categorias.isEmpty()) {
            return produtoRepository.findByEmpresaIdAndCategorias_NomeInIgnoreCase(empresaId, categorias, pageable);
        }

        return produtoRepository.findByEmpresaId(empresaId, pageable);
    }

    public Page<Produto> listarPaginadoPublic(
            Long empresaId,
            String search,
            List<String> categorias,
            String ordenarPor,
            int page,
            int size
    ) {
        Sort sort = switch (ordenarPor != null ? ordenarPor : "") {
            case "menorPreco" -> Sort.by(Sort.Direction.ASC, "precoMinimo");
            case "maiorPreco" -> Sort.by(Sort.Direction.DESC, "precoMinimo");
            case "nomeAsc" -> Sort.by(Sort.Direction.ASC, "nome");
            case "nomeDesc" -> Sort.by(Sort.Direction.DESC, "nome");
            case "maisRecentes" -> Sort.by(Sort.Direction.DESC, "id");
            default -> Sort.by(Sort.Direction.DESC, "pedidos");
        };

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Produto> spec = (root, query, cb) -> cb.and(
                cb.isTrue(root.get("ativo")),
                cb.equal(root.get("empresa").get("id"), empresaId)
        );

        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("nome")), pattern));
        }

        if (categorias != null && !categorias.isEmpty()) {
            spec = spec.and((root, query, cb) -> {
                var subquery = query.subquery(Long.class);
                var subRoot = subquery.from(Produto.class);
                var join = subRoot.join("categorias", JoinType.LEFT);

                subquery.select(subRoot.get("id"))
                        .where(
                                cb.equal(subRoot.get("empresa").get("id"), empresaId),
                                join.get("nome").in(categorias)
                        )
                        .groupBy(subRoot.get("id"))
                        .having(cb.equal(cb.countDistinct(join.get("nome")), categorias.size()));

                return cb.in(root.get("id")).value(subquery);
            });
        }

        return produtoRepository.findAll(spec, pageable);
    }

    public Page<ProdutoDTO> listarPaginadoPublicDTO(
            Long empresaId,
            String search,
            List<String> categorias,
            String ordenarPor,
            int page,
            int size
    ) {
        return listarPaginadoPublic(empresaId, search, categorias, ordenarPor, page, size)
                .map(this::toDTO);
    }

    // =========================
    // BUSCAS / CRUD
    // =========================

    public Produto buscarPorId(Long empresaId, Long id, String username) {
        validarAcessoEmpresa(empresaId, username);

        Produto produto = produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        produto.atualizarPrecoMinimo();
        return produto;
    }

    public List<Produto> buscarTop10PorCategoria(Long empresaId, String categoria, int limit) {
        List<Produto> maisVendidos = produtoRepository
                .findMaisVendidosPorCategoriaEEmpresa(empresaId, categoria, PageRequest.of(0, limit));

        int faltando = limit - maisVendidos.size();
        if (faltando > 0) {
            List<Produto> naoVendidos = produtoRepository
                    .findNaoVendidosPorCategoriaEEmpresa(empresaId, categoria, PageRequest.of(0, faltando));

            Set<Long> ids = new HashSet<>(maisVendidos.stream().map(Produto::getId).toList());
            naoVendidos.removeIf(p -> ids.contains(p.getId()));

            maisVendidos = new ArrayList<>(maisVendidos);
            maisVendidos.addAll(naoVendidos);
        }

        return maisVendidos;
    }

    public Produto criarProduto(Long empresaId, ProdutoDTO dto, MultipartFile imagem, String username) {
        validarAcessoEmpresa(empresaId, username);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        Produto produto = new Produto();
        produto.setEmpresa(empresa);

        aplicarCamposPromocao(produto, dto);
        produto.setNome(dto.nome());
        produto.setSlug(gerarSlug(empresaId, dto.nome()));
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setEstoque(dto.estoque());

        produto.setPermiteObservacao(dto.permiteObservacao());
        produto.setMaxObservacaoChars(dto.maxObservacaoChars());

        produto.setCategorias(resolveCategorias(empresaId, dto.categorias()));

        if (imagem != null && !imagem.isEmpty()) {
            try {
                atualizarImagem(produto, imagem);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar imagem", e);
            }
        }

        if (dto.variacoes() != null) {
            for (VariacaoDTO v : dto.variacoes()) {
                Variacao variacao = v.toEntity();
                variacao.setProduto(produto);
                produto.getVariacoes().add(variacao);
            }
        }

        syncGruposOpcionais(produto, dto.gruposOpcionais());

        produto.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produto);
    }

    @Transactional
    public Produto alterarStatus(Long empresaId, Long id, boolean ativo, String username) {
        validarAcessoEmpresa(empresaId, username);

        Produto produto = produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));

        produto.setAtivo(ativo);
        produto.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produto);
    }

    public void atualizarPedidosProduto(Long empresaId, Long id) {
        Produto produto = produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

        produto.setPedidos(produto.getPedidos() + 1);
        produtoRepository.saveAndFlush(produto);
    }

    public Produto buscarPorSlugPublico(Long empresaId, String slug) {
        return produtoRepository.findByEmpresaIdAndSlug(empresaId, slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }

    @Transactional
    public Produto atualizarProduto(Long empresaId, Long id, ProdutoDTO dto, MultipartFile imagem, String username) {
        validarAcessoEmpresa(empresaId, username);

        Produto produto = produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        aplicarCamposPromocao(produto, dto);

        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPrecoBase(dto.precoBase());
        produto.setEstoque(dto.estoque());
        produto.setPermiteObservacao(dto.permiteObservacao());
        produto.setMaxObservacaoChars(dto.maxObservacaoChars());

        produto.setCategorias(resolveCategorias(empresaId, dto.categorias()));

        if (imagem != null && !imagem.isEmpty()) {
            try {
                atualizarImagem(produto, imagem);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao enviar imagem", e);
            }
        }

        produto.getVariacoes().clear();
        if (dto.variacoes() != null) {
            for (VariacaoDTO vDto : dto.variacoes()) {
                Variacao variacao = new Variacao();
                variacao.setNome(vDto.nome());
                variacao.setPreco(vDto.preco());
                variacao.setEstoque(vDto.estoque());
                variacao.setProduto(produto);
                produto.getVariacoes().add(variacao);
            }
        }

        syncGruposOpcionais(produto, dto.gruposOpcionais());

        produto.atualizarPrecoMinimo();
        return produtoRepository.saveAndFlush(produto);
    }

    public String excluirOuDesativarProduto(Long empresaId, Long id, String username) {
        validarAcessoEmpresa(empresaId, username);

        Produto produto = produtoRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getPedidos() > 0) {
            produto.setAtivo(false);
            produtoRepository.saveAndFlush(produto);
            return "Produto desativado (havia pedidos vinculados)";
        }

        produtoRepository.delete(produto);
        return "Produto excluído definitivamente";
    }

    private void aplicarCamposPromocao(Produto produto, ProdutoDTO dto) {
        if (!dto.emOferta()) {
            produto.setEmOferta(false);
            produto.setTipoDesconto(null);
            produto.setValorDesconto(null);
            produto.setTituloOferta(null);
            produto.setInicioOferta(null);
            produto.setFimOferta(null);
            return;
        }

        produto.setEmOferta(true);

        if (dto.tipoDesconto() == null) {
            throw new IllegalArgumentException("tipoDesconto é obrigatório quando emOferta=true");
        }

        produto.setTipoDesconto(TipoDescontoPromocao.valueOf(dto.tipoDesconto()));
        produto.setValorDesconto(dto.valorDesconto());
        produto.setTituloOferta(dto.tituloOferta());
        produto.setInicioOferta(dto.inicioOferta());
        produto.setFimOferta(dto.fimOferta());
    }

    private ProdutoDTO toDTO(Produto p) {
        var variacoes = (p.getVariacoes() == null) ? List.<VariacaoDTO>of()
                : p.getVariacoes().stream()
                .map(v -> new VariacaoDTO(
                        v.getId(),
                        v.getNome(),
                        v.getPreco(),
                        v.getEstoque(),
                        p.calcularPrecoComPromocao(v.getPreco())
                ))
                .toList();

        var grupos = (p.getGruposOpcionais() == null) ? List.<ProdutoOpcionalGrupoDTO>of()
                : p.getGruposOpcionais().stream()
                .map(g -> new ProdutoOpcionalGrupoDTO(
                        g.getId(),
                        g.getNome(),
                        g.getDescricao(),
                        g.isObrigatorio(),
                        g.getMinSelecionaveis(),
                        g.getMaxSelecionaveis(),
                        g.getTipoSelecao(),
                        g.isAtivo(),
                        g.getOrdem(),
                        (g.getItens() == null) ? List.<ProdutoOpcionalItemDTO>of()
                                : g.getItens().stream()
                                .map(i -> new ProdutoOpcionalItemDTO(
                                        i.getId(),
                                        i.getNome(),
                                        i.getPrecoExtra(),
                                        i.isAtivo(),
                                        i.getEstoque(),
                                        i.getOrdem()
                                ))
                                .toList(),
                        g.getTipoGrupo().name()
                ))
                .toList();

        return new ProdutoDTO(
                p.getId(),
                p.isAtivo(),
                p.getNome(),
                p.getDescricao(),
                p.getCategorias().stream().map(Categoria::getNome).toList(),
                p.getPrecoBase(),
                p.getEstoque(),
                p.getSlug(),
                p.getImagemUrl(),
                variacoes,
                p.getPedidos(),
                p.getPrecoMinimo(),
                grupos,
                p.isPermiteObservacao(),
                p.getMaxObservacaoChars(),
                p.isEmOferta(),
                p.getTipoDesconto() != null ? p.getTipoDesconto().name() : null,
                p.getValorDesconto(),
                p.getTituloOferta(),
                p.getInicioOferta(),
                p.getFimOferta(),
                p.getPrecoPromocional(),
                p.isOfertaVigente()
        );
    }

    private void syncGruposOpcionais(Produto produto, List<ProdutoOpcionalGrupoDTO> gruposDto) {
        produto.getGruposOpcionais().clear();
        if (gruposDto == null || gruposDto.isEmpty()) return;

        for (ProdutoOpcionalGrupoDTO gDto : gruposDto) {
            ProdutoOpcionalGrupo g = new ProdutoOpcionalGrupo();

            g.setProduto(produto);
            g.setNome(gDto.nome());
            g.setDescricao(gDto.descricao());
            g.setObrigatorio(gDto.obrigatorio());
            g.setMinSelecionaveis(Math.max(0, gDto.minSelecionaveis() != null ? gDto.minSelecionaveis() : 0));
            g.setMaxSelecionaveis(Math.max(0, gDto.maxSelecionaveis() != null ? gDto.maxSelecionaveis() : 0));
            g.setTipoSelecao(gDto.tipoSelecao());
            g.setAtivo(gDto.ativo());
            g.setOrdem(gDto.ordem() != null ? gDto.ordem() : 0);
            g.setTipoGrupo(
                    gDto.tipoGrupo() != null && !gDto.tipoGrupo().isBlank()
                            ? TipoGrupoProduto.valueOf(gDto.tipoGrupo().toUpperCase())
                            : TipoGrupoProduto.OPCIONAL_SELECAO
            );

            if (gDto.itens() != null) {
                for (ProdutoOpcionalItemDTO iDto : gDto.itens()) {
                    ProdutoOpcionalItem item = new ProdutoOpcionalItem();

                    item.setGrupo(g);
                    item.setNome(iDto.nome());
                    item.setPrecoExtra(iDto.precoExtra() != null ? iDto.precoExtra() : BigDecimal.ZERO);
                    item.setAtivo(Boolean.TRUE.equals(iDto.ativo()));
                    item.setEstoque(iDto.estoque());
                    item.setOrdem(iDto.ordem() != null ? iDto.ordem() : 0);

                    g.getItens().add(item);
                }
            }

            produto.getGruposOpcionais().add(g);
        }
    }

    private List<Categoria> resolveCategorias(Long empresaId, List<String> nomes) {
        if (nomes == null || nomes.isEmpty()) return new ArrayList<>();

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        return nomes.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(nome -> categoriaRepository.findByEmpresaIdAndNomeIgnoreCase(empresaId, nome)
                        .orElseGet(() -> categoriaRepository.save(new Categoria(nome, empresa))))
                .toList();
    }

    private void atualizarImagem(Produto produto, MultipartFile imagem) throws IOException {
        if (imagem == null || imagem.isEmpty()) return;

        if (produto.getImagemPublicId() != null) {
            cloudinary.uploader().destroy(produto.getImagemPublicId(), ObjectUtils.emptyMap());
        }

        Map uploadResult = cloudinary.uploader().upload(
                imagem.getBytes(),
                ObjectUtils.asMap("folder", "ecommerce/produtos")
        );

        produto.setImagemUrl(uploadResult.get("secure_url").toString());
        produto.setImagemPublicId(uploadResult.get("public_id").toString());
    }

    private String gerarSlug(Long empresaId, String nome) {
        String baseSlug = (nome == null ? "" : nome).toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("(^-|-$)", "");

        String slug = baseSlug.isBlank() ? "produto" : baseSlug;
        int contador = 2;

        while (produtoRepository.findByEmpresaIdAndSlug(empresaId, slug).isPresent()) {
            slug = baseSlug + "-" + contador;
            contador++;
        }

        return slug;
    }

    private void validarAcessoEmpresa(Long empresaId, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuarioEmpresaRepository.findByUsuarioIdAndEmpresaId(usuario.getId(), empresaId)
                .orElseThrow(() -> new RuntimeException("Você não tem acesso a esta empresa"));
    }
}