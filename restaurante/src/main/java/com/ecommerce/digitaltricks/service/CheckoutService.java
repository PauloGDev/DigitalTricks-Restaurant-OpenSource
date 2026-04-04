package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.enums.pedido.StatusPagamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.model.Carrinho;
import com.ecommerce.digitaltricks.model.Cliente;
import com.ecommerce.digitaltricks.model.ClientePerfil;
import com.ecommerce.digitaltricks.model.Endereco;
import com.ecommerce.digitaltricks.model.ItemPedido;
import com.ecommerce.digitaltricks.model.Pedido;
import com.ecommerce.digitaltricks.model.Produto;
import com.ecommerce.digitaltricks.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.repository.PedidoRepository;
import com.ecommerce.digitaltricks.repository.ProdutoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CheckoutService {

    private final CarrinhoRepository carrinhoRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final PedidoStatusService pedidoStatusService;

    public CheckoutService(
            CarrinhoRepository carrinhoRepository,
            PedidoRepository pedidoRepository,
            ProdutoRepository produtoRepository,
            ProdutoService produtoService,
            PedidoStatusService pedidoStatusService
    ) {
        this.carrinhoRepository = carrinhoRepository;
        this.pedidoRepository = pedidoRepository;
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
        this.pedidoStatusService = pedidoStatusService;
    }

    public Page<Pedido> listarTodos(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("data").descending());

        if (status != null && !status.isBlank()) {
            return pedidoRepository.findByStatus(StatusPedido.valueOf(status), pageable);
        }
        return pedidoRepository.findAll(pageable);
    }

    public Pedido finalizarCompra(Long carrinhoId, Endereco endereco) {
        Carrinho carrinho = carrinhoRepository.findById(carrinhoId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));

        if (carrinho.getItens() == null || carrinho.getItens().isEmpty()) {
            throw new RuntimeException("Carrinho vazio");
        }

        Cliente cliente = carrinho.getCliente();
        if (cliente == null) {
            throw new RuntimeException("Cliente não encontrado no carrinho");
        }

        ClientePerfil perfil = cliente.getPerfil();
        if (perfil == null) {
            throw new RuntimeException("Perfil do cliente não encontrado");
        }

        List<ItemPedido> itensPedido = carrinho.getItens().stream()
                .map(i -> {
                    Produto produto = produtoRepository.findById(i.getProduto().getId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Produto não encontrado: " + i.getProduto().getId()
                            ));

                    return new ItemPedido(
                            produto,
                            produto.getNome(),
                            i.getQuantidade(),
                            produto.getPrecoBase(),
                            produto.getImagemUrl()
                    );
                })
                .collect(Collectors.toList());

        BigDecimal subtotal = itensPedido.stream()
                .map(ItemPedido::getTotalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setEmpresa(carrinho.getEmpresa());
        pedido.setItens(itensPedido);
        pedido.setSubtotal(subtotal);
        pedido.setDescontoCupom(BigDecimal.ZERO);
        pedido.setTotal(subtotal);

        pedido.setEnderecoEntrega(endereco);
        pedido.setTipoEntrega(endereco != null ? TipoEntrega.DELIVERY : TipoEntrega.RETIRADA);
        pedido.setStatus(StatusPedido.RECEBIDO);
        pedido.setStatusPagamento(StatusPagamento.PENDENTE);

        pedido.setNomeCompleto(perfil.getNomeCompleto());
        pedido.setTelefone(perfil.getTelefone());
        pedido.setEmail(perfil.getEmail());

        Pedido salvo = pedidoRepository.save(pedido);
        pedidoStatusService.registrarStatusInicial(salvo);

        carrinho.limparCarrinho();
        carrinhoRepository.save(carrinho);

        return salvo;
    }
}