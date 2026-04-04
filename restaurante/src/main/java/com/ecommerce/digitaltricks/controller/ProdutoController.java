package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.*;
import com.ecommerce.digitaltricks.model.Categoria;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.service.ProdutoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final EmpresaRepository empresaRepository;

    public ProdutoController(ProdutoService produtoService, EmpresaRepository empresaRepository) {
        this.produtoService = produtoService;
        this.empresaRepository = empresaRepository;
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

    @GetMapping("/api/empresas/{empresaId}/produtos/{id}")
    public ProdutoDTO buscarProduto(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            Authentication authentication
    ) {
        Produto p = produtoService.buscarPorId(empresaId, id, authentication.getName());
        return toDTO(p);
    }

    @GetMapping("/api/empresas/{empresaId}/produtos")
    public ResponseEntity<ProdutoPageDTO> listar(
            @PathVariable Long empresaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoria,
            Authentication authentication
    ) {
        List<String> categorias = null;
        if (categoria != null && !categoria.isBlank()) {
            categorias = Arrays.asList(categoria.split(","));
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Produto> pagina = produtoService.listarPaginado(
                empresaId,
                search,
                categorias,
                pageable,
                authentication.getName()
        );

        List<ProdutoDTO> produtos = pagina.getContent().stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(
                new ProdutoPageDTO(produtos, pagina.getNumber(), pagina.getTotalPages(), pagina.getTotalElements())
        );
    }

    @PostMapping(
            value = "/api/empresas/{empresaId}/produtos",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ProdutoDTO criarProdutoJson(
            @PathVariable Long empresaId,
            @RequestBody ProdutoDTO produtoDTO,
            Authentication authentication
    ) {
        Produto novo = produtoService.criarProduto(
                empresaId,
                produtoDTO,
                null,
                authentication.getName()
        );
        return toDTO(novo);
    }

    @PostMapping(
            value = "/api/empresas/{empresaId}/produtos",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProdutoDTO criarProdutoMultipart(
            @PathVariable Long empresaId,
            @RequestPart("produto") ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            Authentication authentication
    ) {
        Produto novo = produtoService.criarProduto(
                empresaId,
                produtoDTO,
                imagem,
                authentication.getName()
        );
        return toDTO(novo);
    }

    @GetMapping("/api/public/restaurantes/{slug}/produtos/listarFiltroShop")
    public ResponseEntity<Map<String, Object>> listarProdutosPublicPorSlug(
            @PathVariable String slug,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categoria,
            @RequestParam(defaultValue = "maisVendidos") String ordenarPor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        var empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        Page<Produto> produtosPage = produtoService.listarPaginadoPublic(
                empresa.getId(),
                search,
                categoria,
                ordenarPor,
                page,
                size
        );

        Map<String, Object> response = new HashMap<>();
        response.put("produtos", produtosPage.getContent().stream().map(this::toDTO).toList());
        response.put("totalPaginas", produtosPage.getTotalPages());
        response.put("totalProdutos", produtosPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/public/restaurantes/{slug}/produtos/slug/{produtoSlug}")
    public ProdutoDTO buscarPorSlugPublicoDoRestaurante(
            @PathVariable String slug,
            @PathVariable String produtoSlug
    ) {
        var empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        Produto p = produtoService.buscarPorSlugPublico(empresa.getId(), produtoSlug);
        return toDTO(p);
    }

    @GetMapping("/api/public/restaurantes/{slug}/produtos/destaque-por-categoria")
    public ProdutoDTO getDestaquePorCategoriaPorSlug(
            @PathVariable String slug,
            @RequestParam String categoria
    ) {
        var empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        List<Produto> produtos = produtoService.buscarTop10PorCategoria(empresa.getId(), categoria, 1);

        if (produtos.isEmpty()) {
            throw new RuntimeException("Nenhum produto encontrado para esta categoria");
        }

        return toDTO(produtos.get(0));
    }

    @GetMapping("/api/public/restaurantes/{slug}/produtos/mais-vendidos")
    public List<ProdutoDTO> getMaisVendidosPorCategoriaPorSlug(
            @PathVariable String slug,
            @RequestParam String categoria,
            @RequestParam(defaultValue = "10") int limit
    ) {
        var empresa = empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado"));

        return produtoService.buscarTop10PorCategoria(empresa.getId(), categoria, limit)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @PutMapping("/api/empresas/{empresaId}/produtos/{id}/status")
    public ResponseEntity<ProdutoDTO> atualizarStatus(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body,
            Authentication authentication
    ) {
        boolean ativo = body.getOrDefault("ativo", true);
        Produto produto = produtoService.alterarStatus(
                empresaId,
                id,
                ativo,
                authentication.getName()
        );
        return ResponseEntity.ok(toDTO(produto));
    }

    @PutMapping(
            value = "/api/empresas/{empresaId}/produtos/{id}",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ProdutoDTO atualizarProdutoJson(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestBody ProdutoDTO produtoDTO,
            Authentication authentication
    ) {
        Produto atualizado = produtoService.atualizarProduto(
                empresaId,
                id,
                produtoDTO,
                null,
                authentication.getName()
        );
        return toDTO(atualizado);
    }

    @PutMapping(
            value = "/api/empresas/{empresaId}/produtos/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ProdutoDTO atualizarProdutoMultipart(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            @RequestPart("produto") ProdutoDTO produtoDTO,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            Authentication authentication
    ) {
        Produto atualizado = produtoService.atualizarProduto(
                empresaId,
                id,
                produtoDTO,
                imagem,
                authentication.getName()
        );
        return toDTO(atualizado);
    }

    @DeleteMapping("/api/empresas/{empresaId}/produtos/{id}")
    public ResponseEntity<String> excluirOuDesativar(
            @PathVariable Long empresaId,
            @PathVariable Long id,
            Authentication authentication
    ) {
        String msg = produtoService.excluirOuDesativarProduto(
                empresaId,
                id,
                authentication.getName()
        );
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/api/public/empresas/{empresaId}/produtos/listarFiltroShop")
    public ResponseEntity<Map<String, Object>> listarProdutosPublic(
            @PathVariable Long empresaId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> categoria,
            @RequestParam(defaultValue = "maisVendidos") String ordenarPor,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Page<Produto> produtosPage = produtoService.listarPaginadoPublic(
                empresaId,
                search,
                categoria,
                ordenarPor,
                page,
                size
        );

        Map<String, Object> response = new HashMap<>();
        response.put("produtos", produtosPage.getContent().stream().map(this::toDTO).toList());
        response.put("totalPaginas", produtosPage.getTotalPages());
        response.put("totalProdutos", produtosPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/public/empresas/{empresaId}/produtos/slug/{slug}")
    public ProdutoDTO buscarPorSlug(
            @PathVariable Long empresaId,
            @PathVariable String slug
    ) {
        Produto p = produtoService.buscarPorSlugPublico(empresaId, slug);
        return toDTO(p);
    }

    @GetMapping("/api/public/empresas/{empresaId}/produtos/destaque-por-categoria")
    public ProdutoDTO getDestaquePorCategoria(
            @PathVariable Long empresaId,
            @RequestParam String categoria
    ) {
        List<Produto> produtos = produtoService.buscarTop10PorCategoria(empresaId, categoria, 1);

        if (produtos.isEmpty()) {
            throw new RuntimeException("Nenhum produto encontrado para esta categoria");
        }

        return toDTO(produtos.get(0));
    }

    @GetMapping("/api/public/empresas/{empresaId}/produtos/mais-vendidos")
    public List<ProdutoDTO> getMaisVendidosPorCategoria(
            @PathVariable Long empresaId,
            @RequestParam String categoria,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return produtoService.buscarTop10PorCategoria(empresaId, categoria, limit)
                .stream()
                .map(this::toDTO)
                .toList();
    }
}