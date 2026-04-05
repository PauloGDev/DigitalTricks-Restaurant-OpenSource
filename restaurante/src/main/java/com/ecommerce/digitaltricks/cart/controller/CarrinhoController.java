package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.model.Endereco;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.costumer.repository.EnderecoRepository;
import com.ecommerce.digitaltricks.dto.AplicarCupomRequestDTO;
import com.ecommerce.digitaltricks.order.dto.pedido.CalculoFreteResponseDTO;
import com.ecommerce.digitaltricks.dto.pedido.CarrinhoDTO;
import com.ecommerce.digitaltricks.dto.pedido.CarrinhoItemDTO;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.order.model.Cupom;
import com.ecommerce.digitaltricks.order.repository.CupomRepository;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.model.Variacao;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.product.repository.VariacaoRepository;
import com.ecommerce.digitaltricks.repository.*;
import com.ecommerce.digitaltricks.service.*;
import com.ecommerce.digitaltricks.shared.mapper.CarrinhoMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/restaurantes/{slug}/carrinho")
@CrossOrigin(origins = "*")
public class CarrinhoController {

    private final CarrinhoService carrinhoService;
    private final CarrinhoRepository carrinhoRepository;
    private final CarrinhoMapper carrinhoMapper;
    private final VariacaoRepository variacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final CupomService cupomService;
    private final ClienteRepository clienteRepository;
    private final CupomRepository cupomRepository;
    private final EmpresaRepository empresaRepository;
    private final EnderecoRepository enderecoRepository;
    private final FreteService freteService;

    public CarrinhoController(
            CarrinhoService carrinhoService,
            CarrinhoRepository carrinhoRepository,
            CarrinhoMapper carrinhoMapper,
            VariacaoRepository variacaoRepository,
            ProdutoRepository produtoRepository,
            CupomService cupomService,
            ClienteRepository clienteRepository,
            CupomRepository cupomRepository,
            EmpresaRepository empresaRepository, EnderecoRepository enderecoRepository, FreteService freteService) {
        this.carrinhoService = carrinhoService;
        this.carrinhoRepository = carrinhoRepository;
        this.carrinhoMapper = carrinhoMapper;
        this.variacaoRepository = variacaoRepository;
        this.produtoRepository = produtoRepository;
        this.cupomService = cupomService;
        this.clienteRepository = clienteRepository;
        this.cupomRepository = cupomRepository;
        this.empresaRepository = empresaRepository;
        this.enderecoRepository = enderecoRepository;
        this.freteService = freteService;
    }

    private Long empresaId(String slug) {
        return empresaRepository.findBySlugIgnoreCase(slug)
                .map(Empresa::getId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Restaurante não encontrado"));
    }

    private String getTelefone(Authentication auth) {
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cliente não autenticado");
        }
        return auth.getName();
    }

    private Cliente getCliente(Authentication auth) {
        String telefone = getTelefone(auth);

        return clienteRepository.findByTelefone(telefone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    @GetMapping
    public ResponseEntity<CarrinhoDTO> getCarrinho(
            @PathVariable String slug, Authentication auth
    ) {
        String telefone = getTelefone(auth);
        Long eid = empresaId(slug);
        System.out.println("[CARRINHO.DETAILS] GET telefone=" + telefone + ", empresaId=" + eid + ", slug=" + slug);

        Carrinho carrinho = carrinhoService.buscarCarrinho(telefone, eid);
        System.out.println("[CARRINHO.DETAILS] GET carrinhoId=" + carrinho.getId() + ", clienteId=" + carrinho.getCliente().getId());
        System.out.println("[CARRINHO.DETAILS] GET itens_size (antes DTO)=" + carrinho.getItens().size());

        for (CarrinhoItem item : carrinho.getItens()) {
            System.out.println("[CARRINHO.DETAILS]   item: id=" + item.getId() +
                    ", nome=" + item.getNomeProduto() +
                    ", qtd=" + item.getQuantidade() +
                    ", preco=" + item.getPrecoUnitario());
        }

        CarrinhoDTO dto = carrinhoMapper.toDTO(carrinho);
        System.out.println("[CARRINHO.DETAILS] GET DTO itens_count=" + dto.itens().size());
        for (CarrinhoItemDTO ii : dto.itens()) {
            System.out.println("[CARRINHO.DETAILS]   DTO_item: id=" + ii.id() +
                    ", nome=" + ii.nomeProduto() +
                    ", qtd=" + ii.quantidade());
        }

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/adicionar")
    public ResponseEntity<CarrinhoDTO> adicionarItem(
            @PathVariable String slug,
            Authentication auth,
            @RequestBody CarrinhoAdicionarRequest request
    ) {
        Long empresaId = empresaId(slug);

        Produto produto = produtoRepository.findById(request.getProdutoId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Produto não encontrado"));

        if (!produto.getEmpresa().getSlug().equalsIgnoreCase(slug)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Produto não pertence ao restaurante.");
        }

        if (request.getVariacaoId() != null) {
            Variacao variacao = variacaoRepository.findById(request.getVariacaoId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variação não encontrada"));

            if (!variacao.getProduto().getId().equals(produto.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variação inválida");
            }
        }

        return ResponseEntity.ok(carrinhoMapper.toDTO(
                carrinhoService.adicionarItem(
                        getTelefone(auth), empresaId,
                        request.getProdutoId(), request.getVariacaoId(),
                        request.getQuantidade(), request.getOpcionais(),
                        request.getObservacao()
                )
        ));
    }

    @GetMapping("/frete")
    public ResponseEntity<CalculoFreteResponseDTO> calcularFrete(
            @PathVariable String slug,
            @RequestParam Long enderecoId,
            Authentication auth
    ) {
        Cliente cliente = getCliente(auth);
        Empresa empresa = empresaRepository.getEmpresaBySlug(slug);

        Carrinho carrinho = carrinhoService.buscarCarrinho(cliente.getTelefone(), empresa.getId());

        Endereco endereco = enderecoRepository.findById(enderecoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereço não encontrado"));

        if (endereco.getLatitude() == null || endereco.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereço sem localização válida");
        }

        if (endereco.getPerfil() == null ||
                endereco.getPerfil().getCliente() == null ||
                !endereco.getPerfil().getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Endereço não pertence ao cliente.");
        }

        Double subtotal = carrinho.getSubtotal() != null
                ? carrinho.getSubtotal().doubleValue()
                : 0.0;

        return ResponseEntity.ok(freteService.calcularFrete(empresa, endereco, subtotal));
    }

    @PostMapping("/item/{itemId}/aumentar")
    public ResponseEntity<CarrinhoDTO> aumentar(
            @PathVariable String slug,
            @PathVariable Long itemId,
            Authentication auth
    ) {
        String telefone = getTelefone(auth);
        return ResponseEntity.ok(
                carrinhoMapper.toDTO(
                        carrinhoService.aumentarItemPorId(telefone, empresaId(slug), itemId)
                )
        );
    }

    @PostMapping("/item/{itemId}/diminuir")
    public ResponseEntity<CarrinhoDTO> diminuir(
            @PathVariable String slug,
            @PathVariable Long itemId,
            Authentication auth
    ) {
        String telefone = getTelefone(auth);
        return ResponseEntity.ok(
                carrinhoMapper.toDTO(
                        carrinhoService.diminuirItemPorId(telefone, empresaId(slug), itemId)
                )
        );
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<CarrinhoDTO> removerPorItem(
            @PathVariable String slug,
            @PathVariable Long itemId,
            Authentication auth
    ) {
        String telefone = getTelefone(auth);
        return ResponseEntity.ok(
                carrinhoMapper.toDTO(
                        carrinhoService.removerItemPorId(telefone, empresaId(slug), itemId)
                )
        );
    }

    @PostMapping("/limpar")
    public ResponseEntity<CarrinhoDTO> limpar(
            @PathVariable String slug,
            Authentication auth
    ) {
        String telefone = getTelefone(auth);
        return ResponseEntity.ok(
                carrinhoMapper.toDTO(
                        carrinhoService.limparCarrinho(telefone, empresaId(slug))
                )
        );
    }

    @PostMapping("/cupom/aplicar")
    public ResponseEntity<CarrinhoDTO> aplicarCupom(
            @PathVariable String slug,
            Authentication auth,
            @RequestBody AplicarCupomRequestDTO request
    ) {
        String telefone = getTelefone(auth);
        Cliente cliente = getCliente(auth);

        Carrinho carrinho = carrinhoService.buscarCarrinho(telefone, empresaId(slug));

        Cupom cupom = cupomRepository.findByEmpresaIdAndCodigoIgnoreCase(empresaId(slug), request.codigo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado"));

        cupomService.aplicarNoCarrinho(carrinho, cupom, cliente, null, null);
        carrinhoRepository.save(carrinho);

        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }

    @DeleteMapping("/cupom/remover")
    public ResponseEntity<CarrinhoDTO> removerCupom(
            @PathVariable String slug,
            Authentication auth
    ) {
        String telefone = getTelefone(auth);

        Carrinho carrinho = carrinhoService.buscarCarrinho(telefone, empresaId(slug));
        cupomService.removerDoCarrinho(carrinho);
        carrinhoRepository.save(carrinho);

        return ResponseEntity.ok(carrinhoMapper.toDTO(carrinho));
    }
}