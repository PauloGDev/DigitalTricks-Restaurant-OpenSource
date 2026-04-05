package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.model.ProdutoOpcionalItem;
import com.ecommerce.digitaltricks.product.model.Variacao;
import com.ecommerce.digitaltricks.product.repository.ProdutoOpcionalItemRepository;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.product.repository.VariacaoRepository;
import com.ecommerce.digitaltricks.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

@Service
public class CarrinhoService {

    private final CarrinhoRepository carrinhoRepository;
    private final ProdutoRepository produtoRepository;
    private final VariacaoRepository variacaoRepository;
    private final ProdutoOpcionalItemRepository opcionalItemRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final ObjectMapper om;
    private final CupomService cupomService;
    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;

    public CarrinhoService(CarrinhoRepository carrinhoRepository,
                           ProdutoRepository produtoRepository,
                           VariacaoRepository variacaoRepository,
                           ProdutoOpcionalItemRepository opcionalItemRepository,
                           UsuarioRepository usuarioRepository,
                           EmpresaRepository empresaRepository,
                           ObjectMapper om,
                           CupomService cupomService, PedidoRepository pedidoRepository, ClienteRepository clienteRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.produtoRepository = produtoRepository;
        this.variacaoRepository = variacaoRepository;
        this.opcionalItemRepository = opcionalItemRepository;
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.om = om;
        this.cupomService = cupomService;
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
    }

    private Cliente buscarOuCriarClientePorTelefone(String telefone) {
        System.out.println("[CARRINHO.SERVICE] buscarOuCriarCliente: telefone=" + telefone + " (len=" + (telefone != null ? telefone.length() : "null") + ")");
        Optional<Cliente> existente = clienteRepository.findByTelefone(telefone);
        if (existente.isPresent()) {
            System.out.println("[CARRINHO.SERVICE] Cliente ENCONTRADO, id=" + existente.get().getId() + ", telefone_db=" + existente.get().getTelefone());
            return existente.get();
        }
        System.out.println("[CARRINHO.SERVICE] Cliente NAO ENCONTRADO, criando novo para telefone=" + telefone);
        Cliente novo = new Cliente();
        novo.setTelefone(telefone);
        novo.setPassword("guest");
        Cliente saved = clienteRepository.save(novo);
        System.out.println("[CARRINHO.SERVICE] Cliente CRIADO, id=" + saved.getId());
        return saved;
    }

    private Empresa buscarEmpresa(Long empresaId) {
        System.out.println("[CARRINHO.SERVICE] buscarEmpresa: id=" + empresaId);
        return empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
    }

    private Carrinho getOrCreateCarrinho(String telefone, Long empresaId) {
        Cliente cliente = buscarOuCriarClientePorTelefone(telefone);
        Empresa empresa = buscarEmpresa(empresaId);

        System.out.println("[CARRINHO.SERVICE] find carrinho: clienteId=" + cliente.getId() + ", empresaId=" + empresaId);
        Optional<Carrinho> carrinhoOpt = carrinhoRepository.findByClienteIdAndEmpresaId(cliente.getId(), empresaId);

        if (carrinhoOpt.isPresent()) {
            Carrinho carrinho = carrinhoOpt.get();
            System.out.println("[CARRINHO.SERVICE] Carrinho ENCONTRADO, id=" + carrinho.getId() + ", itens=" + carrinho.getItens().size());
            return carrinho;
        }

        System.out.println("[CARRINHO.SERVICE] Carrinho NAO ENCONTRADO, criando novo");
        Carrinho carrinho = new Carrinho();
        carrinho.setCliente(cliente);
        carrinho.setEmpresa(empresa);
        carrinho.setItens(new ArrayList<>());
        carrinho.setSubtotal(BigDecimal.ZERO);
        carrinho.setDescontoCupom(BigDecimal.ZERO);
        carrinho.setTotal(BigDecimal.ZERO);
        Carrinho saved = carrinhoRepository.save(carrinho);
        System.out.println("[CARRINHO.SERVICE] Carrinho CRIADO, id=" + saved.getId());
        return saved;
    }

    public Carrinho buscarCarrinho(String telefone, Long empresaId) {
        return getOrCreateCarrinho(telefone, empresaId);
    }

    @Transactional
    public Carrinho adicionarItem(String telefone,
                                  Long empresaId,
                                  Long produtoId,
                                  Long variacaoId,
                                  int quantidade,
                                  List<CarrinhoAdicionarRequest.OpcionaisGrupoReq> opcionais,
                                  String observacao) {

        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);
        Cliente cliente = carrinho.getCliente();

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getEmpresa() == null || !produto.getEmpresa().getId().equals(empresaId)) {
            throw new RuntimeException("Produto não pertence à empresa informada.");
        }

        Variacao variacao = null;
        if (variacaoId != null) {
            variacao = variacaoRepository.findById(variacaoId)
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada"));

            if (variacao.getProduto() == null || !variacao.getProduto().getId().equals(produto.getId())) {
                throw new RuntimeException("Variação não pertence ao produto informado.");
            }
        } else if (produto.getVariacoes() != null && !produto.getVariacoes().isEmpty()) {
            throw new RuntimeException("É necessário selecionar uma variação para este produto.");
        }

        BigDecimal precoBase = (variacao != null && variacao.getPreco() != null)
                ? variacao.getPreco()
                : Optional.ofNullable(produto.getPrecoBase()).orElse(BigDecimal.ZERO);

        System.out.println("[CARRINHO.SERVICE] ADD produto=" + produto.getNome() + ", precoBase=" + precoBase + ", variacaoId=" + variacaoId + ", qtd=" + quantidade);

        String opcionaisJson;
        try {
            opcionaisJson = om.writeValueAsString(opcionais != null ? opcionais : List.of());
        } catch (Exception e) {
            throw new RuntimeException("Opcionais inválidos");
        }

        BigDecimal extras = calcularExtras(produto, opcionais);
        BigDecimal precoFinal = precoBase.add(extras);

        String obs = observacao == null ? "" : observacao.trim();
        int qtd = Math.max(1, quantidade);

        String signature = sha256(
                produtoId + "|" +
                        (variacaoId == null ? "" : variacaoId) + "|" +
                        opcionaisJson + "|" +
                        obs
        );

        System.out.println("[CARRINHO.SERVICE] ADD signature=" + signature.substring(0, Math.min(16, signature.length())) + "+");

        Optional<CarrinhoItem> existente = carrinho.getItens().stream()
                .filter(i -> Objects.equals(i.getSignature(), signature))
                .findFirst();

        if (existente.isPresent()) {
            CarrinhoItem item = existente.get();
            item.setQuantidade(item.getQuantidade() + qtd);
            System.out.println("[CARRINHO.SERVICE] Item EXISTENTE, nova_qtd=" + item.getQuantidade());
        } else {
            CarrinhoItem novo = new CarrinhoItem();
            novo.setProduto(produto);
            novo.setVariacao(variacao);
            novo.setCarrinho(carrinho);
            novo.setQuantidade(qtd);
            novo.setImagemUrl(produto.getImagemUrl());
            novo.setNomeProduto(produto.getNome());
            novo.setVariacaoNome(variacao != null ? variacao.getNome() : null);
            novo.setPrecoUnitario(precoFinal);
            novo.setOpcionaisJson(opcionaisJson);
            novo.setObservacao(obs);
            novo.setSignature(signature);
            carrinho.getItens().add(novo);
            System.out.println("[CARRINHO.SERVICE] Item NOVO: " + produto.getNome() + ", imagem=" + produto.getImagemUrl() + ", preco=" + precoFinal);
        }

        recalcularCupomSeNecessario(carrinho, cliente);
        Carrinho salvo = carrinhoRepository.save(carrinho);
        System.out.println("[CARRINHO.SERVICE] ADD FINAL carrinho_id=" + salvo.getId() + ", itens_depois=" + salvo.getItens().size());
        for (CarrinhoItem item : salvo.getItens()) {
            System.out.println("[CARRINHO.SERVICE]   item: id=" + item.getId() + ", nome=" + item.getNomeProduto() + ", qtd=" + item.getQuantidade() + ", preco=" + item.getPrecoUnitario());
        }
        return salvo;
    }

    @Transactional
    public Carrinho aumentarItemPorId(String telefone, Long empresaId, Long itemId) {
        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);

        carrinho.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .ifPresent(i -> i.setQuantidade(i.getQuantidade() + 1));

        recalcularCupomSeNecessario(carrinho, carrinho.getCliente());
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho diminuirItemPorId(String telefone, Long empresaId, Long itemId) {
        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);

        carrinho.getItens().removeIf(i -> {
            if (!i.getId().equals(itemId)) return false;
            if (i.getQuantidade() > 1) {
                i.setQuantidade(i.getQuantidade() - 1);
                return false;
            }
            return true;
        });

        recalcularCupomSeNecessario(carrinho, carrinho.getCliente());
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItemPorId(String telefone, Long empresaId, Long itemId) {
        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);
        carrinho.getItens().removeIf(i -> i.getId().equals(itemId));

        recalcularCupomSeNecessario(carrinho, carrinho.getCliente());
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho removerItem(String telefone, Long empresaId, Long produtoId) {
        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);
        carrinho.removerItem(produtoId);

        recalcularCupomSeNecessario(carrinho, carrinho.getCliente());
        return carrinhoRepository.save(carrinho);
    }

    @Transactional
    public Carrinho limparCarrinho(String telefone, Long empresaId) {
        Carrinho carrinho = getOrCreateCarrinho(telefone, empresaId);
        carrinho.limparCarrinho();
        return carrinhoRepository.save(carrinho);
    }

    private void recalcularCupomSeNecessario(Carrinho carrinho, Cliente cliente) {
        carrinho.calcularTotal();

        if (carrinho.getCupom() == null) {
            carrinho.setDescontoCupom(BigDecimal.ZERO);
            carrinho.setMotivoCupomInvalido(null);
            carrinho.setCodigoErroCupom(null);
            carrinho.calcularTotal();
            return;
        }

        int quantidadeItens = carrinho.getItens().stream()
                .map(CarrinhoItem::getQuantidade)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        boolean clienteJaTemPedidos = false;

        if (cliente != null && cliente.getId() != null) {
            clienteJaTemPedidos = pedidoRepository.existsByClienteId(cliente.getId());
        }

        try {
            cupomService.validarCupom(
                    carrinho.getCupom(),
                    cliente,
                    carrinho.getSubtotal(),
                    quantidadeItens,
                    clienteJaTemPedidos,
                    null,
                    null
            );

            BigDecimal desconto = cupomService.calcularDesconto(
                    carrinho.getCupom(),
                    carrinho.getSubtotal()
            );

            carrinho.setDescontoCupom(desconto);
            carrinho.setMotivoCupomInvalido(null);
            carrinho.setCodigoErroCupom(null);
            carrinho.calcularTotal();

        } catch (Exception e) {
            carrinho.setDescontoCupom(BigDecimal.ZERO);
            carrinho.setMotivoCupomInvalido(e.getMessage());
            carrinho.setCodigoErroCupom("CUPOM_INVALIDO");
            carrinho.calcularTotal();
        }
    }

    private BigDecimal calcularExtras(Produto produto,
                                      List<CarrinhoAdicionarRequest.OpcionaisGrupoReq> opcionais) {
        if (opcionais == null || opcionais.isEmpty()) {
            return BigDecimal.ZERO;
        }

        Set<Long> ids = new HashSet<>();

        for (var grupoReq : opcionais) {
            if (grupoReq == null || grupoReq.getItens() == null) continue;

            for (var itemReq : grupoReq.getItens()) {
                if (itemReq != null && itemReq.getItemId() != null) {
                    ids.add(itemReq.getItemId());
                }
            }
        }

        if (ids.isEmpty()) {
            return BigDecimal.ZERO;
        }

        List<ProdutoOpcionalItem> itensBanco = opcionalItemRepository.findAllById(ids);

        if (itensBanco.size() != ids.size()) {
            Set<Long> encontrados = new HashSet<>();
            for (ProdutoOpcionalItem item : itensBanco) {
                encontrados.add(item.getId());
            }
            ids.removeAll(encontrados);
            throw new RuntimeException("Opcionais inválidos (itens não encontrados): " + ids);
        }

        Map<Long, ProdutoOpcionalItem> itemById = new HashMap<>();
        for (ProdutoOpcionalItem item : itensBanco) {
            itemById.put(item.getId(), item);
        }

        BigDecimal total = BigDecimal.ZERO;

        for (var grupoReq : opcionais) {
            if (grupoReq == null || grupoReq.getItens() == null) continue;

            for (var itemReq : grupoReq.getItens()) {
                if (itemReq == null || itemReq.getItemId() == null) continue;

                ProdutoOpcionalItem itemBanco = itemById.get(itemReq.getItemId());
                if (itemBanco == null) continue;

                if (!itemBanco.isAtivo()) {
                    throw new RuntimeException("Opcional desativado: " + itemBanco.getNome());
                }

                if (itemBanco.getGrupo() == null || itemBanco.getGrupo().getProduto() == null) {
                    throw new RuntimeException("Opcional inválido: " + itemBanco.getNome());
                }

                if (!itemBanco.getGrupo().getProduto().getId().equals(produto.getId())) {
                    throw new RuntimeException("Opcional não pertence ao produto informado: " + itemBanco.getNome());
                }

                if (grupoReq.getGrupoId() != null &&
                        !grupoReq.getGrupoId().equals(itemBanco.getGrupo().getId())) {
                    throw new RuntimeException("Opcional não pertence ao grupo informado: " + itemBanco.getNome());
                }

                Integer estoque = itemBanco.getEstoque();
                int quantidade = itemReq.getQuantidade() != null && itemReq.getQuantidade() > 0
                        ? itemReq.getQuantidade()
                        : 1;

                if (estoque != null && estoque < quantidade) {
                    throw new RuntimeException("Estoque insuficiente para o opcional: " + itemBanco.getNome());
                }

                BigDecimal precoExtra = Optional.ofNullable(itemBanco.getPrecoExtra()).orElse(BigDecimal.ZERO);
                total = total.add(precoExtra.multiply(BigDecimal.valueOf(quantidade)));
            }
        }

        return total;
    }

    private String sha256(String valor) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] out = md.digest(valor.getBytes(StandardCharsets.UTF_8));
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