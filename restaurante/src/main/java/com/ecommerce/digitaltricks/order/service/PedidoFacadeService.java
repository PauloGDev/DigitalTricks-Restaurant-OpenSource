package com.ecommerce.digitaltricks.order.service;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.model.ClientePerfil;
import com.ecommerce.digitaltricks.customer.service.ClienteEmpresaService;
import com.ecommerce.digitaltricks.customer.model.Endereco;
import com.ecommerce.digitaltricks.customer.dto.EnderecoDTO;
import com.ecommerce.digitaltricks.order.dto.pedido.*;
import com.ecommerce.digitaltricks.order.enums.*;
import com.ecommerce.digitaltricks.order.model.ItemPedido;
import com.ecommerce.digitaltricks.order.model.ItemPedidoOpcional;
import com.ecommerce.digitaltricks.order.model.PagamentoNaEntrega;
import com.ecommerce.digitaltricks.order.model.Pedido;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.model.ProdutoOpcionalGrupo;
import com.ecommerce.digitaltricks.product.model.ProdutoOpcionalItem;
import com.ecommerce.digitaltricks.product.model.Variacao;
import com.ecommerce.digitaltricks.product.service.ProdutoService;
import com.ecommerce.digitaltricks.cart.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.bot.repository.NumeroWhatsappRepository;
import com.ecommerce.digitaltricks.bot.service.WhatsAppSenderService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class PedidoFacadeService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final CarrinhoRepository carrinhoRepository;
    private final CupomService cupomService;
    private final ClienteEmpresaService clienteEmpresaService;
    private final PedidoStatusService pedidoStatusService;
    private final WhatsAppSenderService whatsAppSenderService;
    private final NumeroWhatsappRepository numeroWhatsappRepository;
    private final NotificacaoPedidoService notificacaoPedidoService;

    public PedidoFacadeService(
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ProdutoRepository produtoRepository,
            ProdutoService produtoService,
            CarrinhoRepository carrinhoRepository,
            CupomService cupomService,
            ClienteEmpresaService clienteEmpresaService,
            PedidoStatusService pedidoStatusService,
            WhatsAppSenderService whatsAppSenderService, NumeroWhatsappRepository numeroWhatsappRepository, NotificacaoPedidoService notificacaoPedidoService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.produtoRepository = produtoRepository;
        this.produtoService = produtoService;
        this.carrinhoRepository = carrinhoRepository;
        this.cupomService = cupomService;
        this.clienteEmpresaService = clienteEmpresaService;
        this.pedidoStatusService = pedidoStatusService;
        this.whatsAppSenderService = whatsAppSenderService;
        this.numeroWhatsappRepository = numeroWhatsappRepository;
        this.notificacaoPedidoService = notificacaoPedidoService;
    }

    private ItemPedido criarItemPedido(Empresa empresa, ItemPedidoRequestDTO i) {
        Produto produto = produtoRepository.findById(i.produtoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + i.produtoId()));

        if (produto.getEmpresa() == null || !produto.getEmpresa().getId().equals(empresa.getId())) {
            throw new RuntimeException("Produto não pertence à empresa informada: " + produto.getId());
        }

        produtoService.atualizarPedidosProduto(empresa.getId(), i.produtoId());

        Variacao variacaoSelecionada = null;
        String nomeProduto = produto.getNome();
        String imagemUrl = produto.getImagemUrl();

        BigDecimal precoUnitario;

        if (i.variacaoId() != null) {
            variacaoSelecionada = produto.getVariacoes().stream()
                    .filter(v -> v.getId().equals(i.variacaoId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Variação não encontrada: " + i.variacaoId()));

            precoUnitario = (variacaoSelecionada.getPreco() != null
                    && variacaoSelecionada.getPreco().compareTo(BigDecimal.ZERO) > 0)
                    ? variacaoSelecionada.getPreco()
                    : produto.getPrecoBase();

            nomeProduto = nomeProduto + " - " + variacaoSelecionada.getNome();
        } else {
            precoUnitario = produto.getPrecoBase();
        }

        if (precoUnitario == null) {
            throw new RuntimeException("Preço base não encontrado para o produto: " + produto.getId());
        }

        validarGruposObrigatorios(produto, i.opcionais());

        ItemPedido item = new ItemPedido(
                produto,
                nomeProduto,
                i.quantidade(),
                precoUnitario,
                imagemUrl
        );

        item.setVariacao(variacaoSelecionada);
        item.setObservacao(i.observacao());

        if (i.opcionais() != null) {
            for (GrupoOpcionalSelecionadoDTO grupoSelecionado : i.opcionais()) {
                if (grupoSelecionado.itens() == null || grupoSelecionado.itens().isEmpty()) {
                    continue;
                }

                ProdutoOpcionalGrupo grupoProduto = produto.getGruposOpcionais().stream()
                        .filter(gr -> gr.getId().equals(grupoSelecionado.grupoId()))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException(
                                "Grupo de opcional inválido: " + grupoSelecionado.grupoId()
                        ));

                for (ItemSelecionadoDTO itemSel : grupoSelecionado.itens()) {
                    ProdutoOpcionalItem opcionalItem = grupoProduto.getItens().stream()
                            .filter(it -> it.getId().equals(itemSel.itemId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException(
                                    "Opcional inválido para o grupo '" + grupoProduto.getNome() + "': " + itemSel.itemId()
                            ));

                    int qtd = (itemSel.quantidade() != null && itemSel.quantidade() > 0)
                            ? itemSel.quantidade()
                            : 1;

                    BigDecimal precoExtra = opcionalItem.getPrecoExtra() != null
                            ? opcionalItem.getPrecoExtra()
                            : BigDecimal.ZERO;

                    TipoItemPedidoOpcional tipo = mapTipoOpcional(grupoSelecionado.tipoGrupo());

                    ItemPedidoOpcional opc = new ItemPedidoOpcional(
                            opcionalItem.getId(),
                            opcionalItem.getNome(),
                            precoExtra,
                            qtd,
                            tipo,
                            grupoProduto.getId(),
                            grupoProduto.getNome(),
                            item
                    );

                    item.addOpcional(opc);
                }
            }
        }

        item.recalcularTotalOpcionais();
        return item;
    }

    private void validarGruposObrigatorios(
            Produto produto,
            List<GrupoOpcionalSelecionadoDTO> opcionaisSelecionados
    ) {
        if (produto.getGruposOpcionais() == null || produto.getGruposOpcionais().isEmpty()) {
            return;
        }

        for (ProdutoOpcionalGrupo grupoObrigatorio : produto.getGruposOpcionais()) {
            if (!grupoObrigatorio.isObrigatorio()) {
                continue;
            }

            boolean possui = opcionaisSelecionados != null &&
                    opcionaisSelecionados.stream()
                            .anyMatch(g ->
                                    Objects.equals(g.grupoId(), grupoObrigatorio.getId())
                                            && g.itens() != null
                                            && !g.itens().isEmpty()
                            );

            if (!possui) {
                throw new RuntimeException(
                        "O grupo obrigatório '" + grupoObrigatorio.getNome() + "' não foi selecionado."
                );
            }
        }
    }

    private TipoItemPedidoOpcional mapTipoOpcional(Object tipoGrupo) {
        if (tipoGrupo == null) {
            return TipoItemPedidoOpcional.OPCIONAL_SELECAO;
        }

        if (tipoGrupo instanceof TipoItemPedidoOpcional tipoEnum) {
            return tipoEnum;
        }

        try {
            return TipoItemPedidoOpcional.valueOf(tipoGrupo.toString());
        } catch (IllegalArgumentException ex) {
            return TipoItemPedidoOpcional.OPCIONAL_SELECAO;
        }
    }

    @Transactional
    public PedidoDTO criarPedidoCliente(
            Cliente cliente,
            Empresa empresa,
            PedidoRequestDTO pedidoRequest
    ) {
        ClientePerfil perfil = cliente.getPerfil();

        if (perfil == null) {
            throw new RuntimeException("Perfil do cliente não encontrado");
        }

        String nomeCompleto = perfil.getNomeCompleto();
        String telefone = perfil.getTelefone();
        String email = perfil.getEmail();

        if (nomeCompleto == null || nomeCompleto.isBlank()) {
            throw new RuntimeException("Nome obrigatório");
        }

        if (telefone == null || telefone.isBlank()) {
            throw new RuntimeException("Telefone obrigatório");
        }

        if (pedidoRequest == null) {
            throw new RuntimeException("Body do pedido está vazio.");
        }

        if (empresa == null || empresa.getId() == null) {
            throw new RuntimeException("Empresa não encontrada.");
        }

        if (pedidoRequest.itens() == null || pedidoRequest.itens().isEmpty()) {
            throw new RuntimeException("Nenhum item foi enviado no pedido.");
        }

        TipoEntrega tipoEntrega = pedidoRequest.tipoEntrega() != null
                ? pedidoRequest.tipoEntrega()
                : TipoEntrega.DELIVERY;

        TipoPagamento tipoPagamento = pedidoRequest.tipoPagamento();
        if (tipoPagamento == null) {
            throw new RuntimeException("tipoPagamento é obrigatório.");
        }

        Endereco endereco = null;
        if (tipoEntrega == TipoEntrega.DELIVERY) {
            endereco = perfil.getEnderecos().stream()
                    .filter(e -> pedidoRequest.enderecoId() != null
                            ? e.getId().equals(pedidoRequest.enderecoId())
                            : e.isPadrao())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Endereço inválido"));
        }

        PagamentoNaEntrega pagamentoNaEntrega = null;
        if (tipoPagamento == TipoPagamento.PAY_ON_DELIVERY) {
            if (pedidoRequest.pagamentoNaEntrega() == null
                    || pedidoRequest.pagamentoNaEntrega().metodo() == null) {
                throw new RuntimeException(
                        "pagamentoNaEntrega.metodo é obrigatório quando tipoPagamento=PAY_ON_DELIVERY."
                );
            }

            var pneDto = pedidoRequest.pagamentoNaEntrega();
            pagamentoNaEntrega = new PagamentoNaEntrega();
            pagamentoNaEntrega.setMetodo(pneDto.metodo());

            if (pneDto.metodo() == MetodoPagamentoNaEntrega.CASH) {
                boolean precisaTroco = Boolean.TRUE.equals(pneDto.precisaTroco());
                pagamentoNaEntrega.setPrecisaTroco(precisaTroco);

                if (precisaTroco) {
                    if (pneDto.trocoPara() == null || pneDto.trocoPara().compareTo(BigDecimal.ZERO) <= 0) {
                        throw new RuntimeException("trocoPara deve ser > 0 quando precisaTroco=true (dinheiro).");
                    }
                    pagamentoNaEntrega.setTrocoPara(pneDto.trocoPara());
                } else {
                    pagamentoNaEntrega.setTrocoPara(null);
                }
            } else {
                pagamentoNaEntrega.setPrecisaTroco(false);
                pagamentoNaEntrega.setTrocoPara(null);
            }
        }

        List<ItemPedido> itens = pedidoRequest.itens().stream()
                .map(i -> criarItemPedido(empresa, i))
                .toList();

        BigDecimal subtotal = itens.stream()
                .map(ItemPedido::getTotalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal descontoCupom = BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(descontoCupom);

        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        Pedido pedido = new Pedido();
        pedido.setEmpresa(empresa);
        pedido.setCliente(cliente);
        pedido.setItens(itens);
        pedido.setTotal(total);

        if (tipoPagamento == TipoPagamento.PAY_ON_DELIVERY || tipoEntrega == TipoEntrega.RETIRADA) {
            pedido.setStatus(StatusPedido.RECEBIDO);
        } else {
            pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
        }

        pedido.setStatusPagamento(StatusPagamento.PENDENTE);
        pedido.setTipoEntrega(tipoEntrega);
        pedido.setTipoPagamento(tipoPagamento);
        pedido.setPagamentoNaEntrega(pagamentoNaEntrega);

        if (tipoEntrega == TipoEntrega.DELIVERY) {
            pedido.setEnderecoEntrega(endereco);
            pedido.setServicoFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().servico() : null);
            pedido.setValorFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().valor() : null);
            pedido.setPrazoFrete(pedidoRequest.frete() != null ? pedidoRequest.frete().prazo() : null);
        } else {
            pedido.setEnderecoEntrega(null);
            pedido.setServicoFrete(null);
            pedido.setValorFrete(0.0);
            pedido.setPrazoFrete(null);
        }

        pedido.setNomeCompleto(nomeCompleto);
        pedido.setTelefone(telefone);
        pedido.setEmail(email);
        pedido.setSubtotal(subtotal);
        pedido.setDescontoCupom(descontoCupom);
        pedido.setCupomCodigo(null);

        Pedido salvo = pedidoRepository.save(pedido);
        pedidoStatusService.registrarStatusInicial(salvo);
        clienteEmpresaService.registrarPedido(salvo);

        // WhatsApp é opcional - não pode bloquear o pedido
        numeroWhatsappRepository
                .findByEmpresaId(empresa.getId())
                .ifPresent(numero -> {
                    try {
                        whatsAppSenderService.sendText(
                                numero,
                                salvo.getTelefone(),
                                "\u2705 Pedido confirmado!\n" +
                                        "N\u00famero: " + salvo.getId() +
                                        "\nTotal: R$ " + salvo.getTotal()
                        );
                    } catch (Exception e) {
                        System.out.println("[PEDIDO] Falha ao enviar WhatsApp: " + e.getMessage());
                    }
                });

        notificacaoPedidoService.notificarNovoPedido(salvo);
        return toDTO(salvo);
    }

    public Page<PedidoDTO> buscarPedidosEmpresa(Long empresaId, Pageable pageable) {
        return pedidoRepository.findByEmpresaIdOrderByDataDesc(empresaId, pageable)
                .map(this::toDTO);
    }

    public PedidoDTO toDTO(Pedido pedido) {
        return new PedidoDTO(
                pedido.getId(),
                pedido.getData(),
                pedido.getTotal(),
                pedido.getSubtotal() != null ? pedido.getSubtotal() : BigDecimal.ZERO,
                pedido.getTipoPagamento(),
                pedido.getStatus(),
                pedido.getStatusPagamento(),
                pedido.getMotivoCancelamento(),
                pedido.getOrigemCancelamento(),
                pedido.getEnderecoEntrega() != null ? new EnderecoDTO(
                        pedido.getEnderecoEntrega().getId(),
                        pedido.getEnderecoEntrega().getLogradouro(),
                        pedido.getEnderecoEntrega().getNumero(),
                        pedido.getEnderecoEntrega().getBairro(),
                        pedido.getEnderecoEntrega().getCidade(),
                        pedido.getEnderecoEntrega().getUf(),
                        pedido.getEnderecoEntrega().getCep(),
                        pedido.getEnderecoEntrega().getComplemento(),
                        pedido.getEnderecoEntrega().isPadrao()
                ) : null,
                pedido.getTipoEntrega(),
                pedido.getPagamentoNaEntrega() != null
                        ? new PagamentoNaEntregaDTO(
                        pedido.getPagamentoNaEntrega().getMetodo(),
                        pedido.getPagamentoNaEntrega().getPrecisaTroco(),
                        pedido.getPagamentoNaEntrega().getTrocoPara()
                )
                        : null,
                pedido.getItens().stream()
                        .map(this::toItemDTO)
                        .toList(),
                pedido.getNomeCompleto(),
                pedido.getCpf(),
                pedido.getTelefone(),
                pedido.getEmail(),
                pedido.getServicoFrete(),
                pedido.getValorFrete(),
                pedido.getPrazoFrete()
        );
    }

    private ItemPedidoDTO toItemDTO(ItemPedido item) {
        List<GrupoOpcionalPedidoDTO> opcionaisAgrupados =
                item.getOpcionais() != null
                        ? item.getOpcionais().stream()
                        .collect(Collectors.groupingBy(
                                ItemPedidoOpcional::getGrupoId,
                                LinkedHashMap::new,
                                Collectors.toList()
                        ))
                        .entrySet().stream()
                        .map(entry -> {
                            List<ItemPedidoOpcional> itensGrupo = entry.getValue();
                            ItemPedidoOpcional primeiro = itensGrupo.get(0);

                            return new GrupoOpcionalPedidoDTO(
                                    primeiro.getGrupoId(),
                                    primeiro.getGrupoNome(),
                                    primeiro.getTipo(),
                                    itensGrupo.stream()
                                            .map(op -> new ItemPedidoOpcionalDTO(
                                                    op.getId(),
                                                    op.getNome(),
                                                    op.getPrecoExtra(),
                                                    op.getQuantidade(),
                                                    op.getTipo(),
                                                    op.getGrupoId(),
                                                    op.getGrupoNome()
                                            ))
                                            .toList()
                            );
                        })
                        .toList()
                        : List.of();

        return new ItemPedidoDTO(
                item.getId(),
                item.getVariacao() != null ? item.getVariacao().getId() : null,
                item.getNomeProduto(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getTotalOpcionais(),
                item.getTotalItem(),
                item.getImagemUrl(),
                item.getObservacao(),
                opcionaisAgrupados
        );
    }
}