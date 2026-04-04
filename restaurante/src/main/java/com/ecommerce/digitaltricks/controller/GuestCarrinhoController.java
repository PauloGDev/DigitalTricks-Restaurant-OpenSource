package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.pedido.CarrinhoDTO;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.*;
import com.ecommerce.digitaltricks.service.CarrinhoAdicionarRequest;
import com.ecommerce.digitaltricks.service.CarrinhoMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

/**
 * Controller público para carrinho via sessionId.
 * Permite que usuários não autenticados adicionem itens ao carrinho
 * usando um sessionId armazenado no frontend (localStorage).
 *
 * Quando o usuário loga, o frontend sincroniza os items localStorage → backend
 * através dos endpoints autenticados normais.
 *
 * Para que funcione, o Carrinho precisa suportar carrinho sem cliente.
 * Adicione um campo `sessionId` na entity Carrinho.
 */
@RestController
@RequestMapping("/api/public/restaurantes/{slug}/carrinho")
@CrossOrigin(origins = "*")
public class GuestCarrinhoController {

    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoMapper carrinhoMapper;
    private final ProdutoRepository produtoRepository;
    private final VariacaoRepository variacaoRepository;
    private final EmpresaRepository empresaRepository;

    public GuestCarrinhoController(
            CarrinhoRepository carrinhoRepository,
            CarrinhoMapper carrinhoMapper,
            ProdutoRepository produtoRepository,
            VariacaoRepository variacaoRepository,
            EmpresaRepository empresaRepository
    ) {
        this.carrinhoRepository = carrinhoRepository;
        this.carrinhoMapper = carrinhoMapper;
        this.produtoRepository = produtoRepository;
        this.variacaoRepository = variacaoRepository;
        this.empresaRepository = empresaRepository;
    }

    private Empresa getEmpresaOrThrow(String slug) {
        return empresaRepository.findBySlugIgnoreCase(slug)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restaurante não encontrado"));
    }

    private Carrinho buscarCarrinhoSession(String sessionId, Long empresaId) {
        return carrinhoRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Carrinho c = new Carrinho();
                    c.setSessionId(sessionId);
                    c.setEmpresa(empresaRepository.findById(empresaId).orElseThrow());
                    c.setSubtotal(BigDecimal.ZERO);
                    c.setDescontoCupom(BigDecimal.ZERO);
                    c.setTotal(BigDecimal.ZERO);
                    c.setItens(new ArrayList<>());
                    return carrinhoRepository.save(c);
                });
    }

    /**
     * Busca carrinho guest — retorna null se não houver.
     * Se o usuário já está logado, delega para o endpoint autenticado.
     */
    @GetMapping
    public ResponseEntity<CarrinhoDTO> getCarrinhoGuest(
            @PathVariable String slug,
            @RequestParam String sessionId
    ) {
        Empresa empresa = getEmpresaOrThrow(slug);
        Optional<Carrinho> opt = carrinhoRepository.findBySessionId(sessionId);

        return opt.map(carrinho -> ResponseEntity.ok(carrinhoMapper.toDTO(carrinho)))
                  .orElseGet(() -> ResponseEntity.ok(null));
    }

    /**
     * Adiciona item sem necessidade de login.
     * Usa sessionId para identificar o carrinho.
     */
    @PostMapping("/adicionar")
    public ResponseEntity<CarrinhoDTO> adicionarItemGuest(
            @PathVariable String slug,
            @RequestParam String sessionId,
            @RequestBody CarrinhoAdicionarRequest request
    ) {
        Empresa empresa = getEmpresaOrThrow(slug);
        Carrinho carrinho = buscarCarrinhoSession(sessionId, empresa.getId());

        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Produto não encontrado"));

        if (!produto.getEmpresa().getId().equals(empresa.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Produto não pertence ao restaurante.");
        }

        Variacao variacao = null;
        if (request.getVariacaoId() != null) {
            variacao = variacaoRepository.findById(request.getVariacaoId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Variação não encontrada"));
        }

        // Usa o serviço existente via reflexão no sessionId
        // Ou implementa direto aqui:
        BigDecimal precoBase = (variacao != null && variacao.getPreco() != null)
                ? variacao.getPreco()
                : Optional.ofNullable(produto.getPrecoBase()).orElse(BigDecimal.ZERO);

        String obs = request.getObservacao() == null ? "" : request.getObservacao().trim();
        int qtd = Math.max(1, request.getQuantidade());

        // Signature para deduplicação simples
        String opcionaisJson = request.getOpcionais() != null
                ? serializeJson(request.getOpcionais())
                : "[]";

        String signature = sha256Simple(
                request.getProdutoId() + "|" +
                        (request.getVariacaoId() == null ? "" : request.getVariacaoId()) + "|" +
                        opcionaisJson + "|" + obs
        );

        Optional<CarrinhoItem> existente = carrinho.getItens().stream()
                .filter(i -> Objects.equals(i.getSignature(), signature))
                .findFirst();

        if (existente.isPresent()) {
            existente.get().setQuantidade(existente.get().getQuantidade() + qtd);
        } else {
            CarrinhoItem novo = new CarrinhoItem();
            novo.setProduto(produto);
            novo.setVariacao(variacao);
            novo.setCarrinho(carrinho);
            novo.setQuantidade(qtd);
            novo.setImagemUrl(produto.getImagemUrl());
            novo.setNomeProduto(produto.getNome());
            novo.setVariacaoNome(variacao != null ? variacao.getNome() : null);
            novo.setPrecoUnitario(precoBase);
            novo.setOpcionaisJson(opcionaisJson);
            novo.setObservacao(obs);
            novo.setSignature(signature);
            carrinho.getItens().add(novo);
        }

        carrinho.calcularTotal();
        carrinhoRepository.save(carrinho);

        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    @PostMapping("/item/{itemId}/aumentar")
    public ResponseEntity<CarrinhoDTO> aumentarItem(
            @PathVariable String slug,
            @PathVariable Long itemId,
            @RequestParam String sessionId
    ) {
        Carrinho carrinho = encontrarCarrinhoPorItem(sessionId, itemId);
        carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .ifPresent(i -> i.setQuantidade(i.getQuantidade() + 1));

        carrinho.calcularTotal();
        carrinhoRepository.save(carrinho);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    @PostMapping("/item/{itemId}/diminuir")
    public ResponseEntity<CarrinhoDTO> diminuirItem(
            @PathVariable String slug,
            @PathVariable Long itemId,
            @RequestParam String sessionId
    ) {
        Carrinho carrinho = encontrarCarrinhoPorItem(sessionId, itemId);
        carrinho.getItens().removeIf(i -> {
            if (!i.getId().equals(itemId)) return false;
            if (i.getQuantidade() > 1) {
                i.setQuantidade(i.getQuantidade() - 1);
                return false;
            }
            return true;
        });

        carrinho.calcularTotal();
        carrinhoRepository.save(carrinho);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }


    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<CarrinhoDTO> removerItem(
            @PathVariable String slug,
            @PathVariable Long itemId,
            @RequestParam String sessionId
    ) {
        Carrinho carrinho = encontrarCarrinhoPorItem(sessionId, itemId);
        carrinho.getItens().removeIf(i -> i.getId().equals(itemId));

        carrinho.calcularTotal();
        carrinhoRepository.save(carrinho);
        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    @PostMapping("/limpar")
    public ResponseEntity<CarrinhoDTO> limpar(
            @PathVariable String slug,
            @RequestParam String sessionId
    ) {
        carrinhoRepository.findBySessionId(sessionId).ifPresent(c -> {
            c.limparCarrinho();
            carrinhoRepository.save(c);
        });

        return carrinhoRepository.findBySessionId(sessionId)
                .map(c -> ResponseEntity.ok(carrinhoMapper.toDTO(c)))
                .orElse(ResponseEntity.ok(null));
    }

    // ---------- Helpers ----------

    @DeleteMapping
    public ResponseEntity<Void> deletarCarrinhoGuest(@RequestParam String sessionId) {
        carrinhoRepository.findBySessionId(sessionId).ifPresent(carrinhoRepository::delete);
        return ResponseEntity.ok().build();
    }

    private Carrinho encontrarCarrinhoPorItem(String sessionId, Long itemId) {
        Carrinho carrinho = carrinhoRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Carrinho não encontrado"));

        boolean found = carrinho.getItens().stream()
                .anyMatch(i -> i.getId().equals(itemId));

        if (!found) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Item não encontrado no carrinho");
        }

        return carrinho;
    }

    private String serializeJson(Object obj) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String sha256Simple(String valor) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(valor.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : out) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
