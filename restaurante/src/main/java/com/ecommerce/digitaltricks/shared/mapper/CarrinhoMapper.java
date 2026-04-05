package com.ecommerce.digitaltricks.shared.mapper;

import com.ecommerce.digitaltricks.cart.dto.CarrinhoDTO;
import com.ecommerce.digitaltricks.cart.dto.CarrinhoItemDTO;
import com.ecommerce.digitaltricks.cart.dto.CarrinhoOpcionalGrupoDTO;
import com.ecommerce.digitaltricks.cart.dto.CarrinhoOpcionalItemDTO;
import com.ecommerce.digitaltricks.cart.model.Carrinho;
import com.ecommerce.digitaltricks.cart.model.CarrinhoItem;
import com.ecommerce.digitaltricks.order.dto.cupom.CupomAplicadoDTO;
import com.ecommerce.digitaltricks.product.model.ProdutoOpcionalItem;
import com.ecommerce.digitaltricks.product.repository.ProdutoOpcionalItemRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class CarrinhoMapper {

    private final ObjectMapper om;
    private final ProdutoOpcionalItemRepository opcionalItemRepository;

    public CarrinhoMapper(ObjectMapper om, ProdutoOpcionalItemRepository opcionalItemRepository) {
        this.om = om;
        this.opcionalItemRepository = opcionalItemRepository;
    }

    public CarrinhoDTO toDTO(Carrinho carrinho) {
        return new CarrinhoDTO(
                carrinho.getId(),
                carrinho.getCliente() != null ? carrinho.getCliente().getId() : null,
                carrinho.getItens().stream().map(this::toItemDTO).toList(),
                carrinho.getSubtotal(),
                carrinho.getDescontoCupom(),
                carrinho.getTotal(),
                carrinho.getCupom() != null
                        ? new CupomAplicadoDTO(
                        carrinho.getCupom().getId(),
                        carrinho.getCupom().getCodigo(),
                        carrinho.getCupom().getNome(),
                        carrinho.getCupom().getTipoDesconto().name(),
                        carrinho.getCupom().getValorDesconto(),
                        carrinho.getDescontoCupom()
                )
                        : null,
                carrinho.getMotivoCupomInvalido(),
                carrinho.getCodigoErroCupom()
        );
    }

    private CarrinhoItemDTO toItemDTO(CarrinhoItem item) {
        var produto = item.getProduto();
        var variacao = item.getVariacao();

        BigDecimal precoUnit = Optional.ofNullable(item.getPrecoUnitario())
                .orElseGet(() -> variacao != null && variacao.getPreco() != null
                        ? variacao.getPreco()
                        : Optional.ofNullable(produto.getPrecoBase()).orElse(BigDecimal.ZERO));

        int qtd = Math.max(1, item.getQuantidade());

        String produtoDescricao = produto != null ? produto.getDescricao() : null;
        String observacao = item.getObservacao();

        OpcionaisParsed parsed = parseOpcionais(item.getOpcionaisJson());

        BigDecimal extrasUnitarios = parsed.opcionaisDetalhado.stream()
                .flatMap(g -> g.itens().stream())
                .map(it -> {
                    BigDecimal extra = Optional.ofNullable(it.precoExtra()).orElse(BigDecimal.ZERO);
                    int quantidadeExtra = it.quantidade() != null && it.quantidade() > 0 ? it.quantidade() : 1;
                    return extra.multiply(BigDecimal.valueOf(quantidadeExtra));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal subtotal = precoUnit
                .add(extrasUnitarios)
                .multiply(BigDecimal.valueOf(qtd));

        return new CarrinhoItemDTO(
                item.getId(),
                produto != null ? produto.getId() : null,
                item.getNomeProduto() != null ? item.getNomeProduto() : (produto != null ? produto.getNome() : null),
                produtoDescricao,
                variacao != null ? variacao.getId() : null,
                item.getVariacaoNome() != null ? item.getVariacaoNome() : (variacao != null ? variacao.getNome() : null),
                precoUnit,
                qtd,
                subtotal,
                item.getImagemUrl() != null ? item.getImagemUrl() : (produto != null ? produto.getImagemUrl() : null),
                observacao,
                parsed.opcionaisDetalhado,
                parsed.opcionaisResumo
        );
    }

    private record OpcionaisParsed(
            List<CarrinhoOpcionalGrupoDTO> opcionaisDetalhado,
            List<String> opcionaisResumo
    ) {}

    private static record ItemReq(Long itemId, Integer quantidade) {}

    private static record GrupoReq(
            Long grupoId,
            String tipoGrupo,
            List<ItemReq> itens,
            List<Long> itensIds
    ) {}

    private OpcionaisParsed parseOpcionais(String opcionaisJson) {
        if (opcionaisJson == null || opcionaisJson.isBlank() || "[]".equals(opcionaisJson.trim())) {
            return new OpcionaisParsed(List.of(), List.of());
        }

        List<GrupoReq> gruposReq;
        try {
            gruposReq = om.readValue(opcionaisJson, new TypeReference<List<GrupoReq>>() {});
        } catch (Exception e) {
            return new OpcionaisParsed(List.of(), List.of("Opcionais inválidos"));
        }

        Set<Long> ids = new HashSet<>();

        for (GrupoReq g : gruposReq) {
            if (g == null) continue;

            if (g.itens() != null) {
                for (ItemReq item : g.itens()) {
                    if (item != null && item.itemId() != null) {
                        ids.add(item.itemId());
                    }
                }
            }

            if (g.itensIds() != null) {
                for (Long id : g.itensIds()) {
                    if (id != null) {
                        ids.add(id);
                    }
                }
            }
        }

        if (ids.isEmpty()) {
            return new OpcionaisParsed(
                    gruposReq.stream()
                            .filter(g -> g != null && g.grupoId() != null)
                            .map(g -> new CarrinhoOpcionalGrupoDTO(
                                    g.grupoId(),
                                    null,
                                    g.tipoGrupo(),
                                    List.of()
                            ))
                            .toList(),
                    List.of()
            );
        }

        List<ProdutoOpcionalItem> itensBanco = opcionalItemRepository.findAllByIdInWithGrupo(ids);

        Map<Long, ProdutoOpcionalItem> itemById = itensBanco.stream()
                .collect(Collectors.toMap(ProdutoOpcionalItem::getId, i -> i));

        List<CarrinhoOpcionalGrupoDTO> detalhado = new ArrayList<>();
        List<String> resumo = new ArrayList<>();

        for (GrupoReq g : gruposReq) {
            if (g == null || g.grupoId() == null) continue;

            List<CarrinhoOpcionalItemDTO> itensDTO = new ArrayList<>();
            String grupoNome = null;
            String tipoGrupo = g.tipoGrupo();

            if (g.itens() != null && !g.itens().isEmpty()) {
                for (ItemReq itemReq : g.itens()) {
                    if (itemReq == null || itemReq.itemId() == null) continue;

                    ProdutoOpcionalItem it = itemById.get(itemReq.itemId());
                    if (it == null) continue;

                    if (grupoNome == null && it.getGrupo() != null) {
                        grupoNome = it.getGrupo().getNome();
                    }

                    if (tipoGrupo == null && it.getGrupo() != null) {
                        tipoGrupo = it.getGrupo().getTipoGrupo() != null
                                ? it.getGrupo().getTipoGrupo().name()
                                : null;
                    }

                    int quantidade = itemReq.quantidade() != null && itemReq.quantidade() > 0
                            ? itemReq.quantidade()
                            : 1;

                    itensDTO.add(new CarrinhoOpcionalItemDTO(
                            it.getId(),
                            it.getNome(),
                            it.getPrecoExtra(),
                            quantidade
                    ));

                    BigDecimal extra = Optional.ofNullable(it.getPrecoExtra()).orElse(BigDecimal.ZERO);

                    if ("ADICIONAL_QUANTIDADE".equalsIgnoreCase(tipoGrupo) && quantidade > 1) {
                        resumo.add(extra.compareTo(BigDecimal.ZERO) > 0
                                ? quantidade + "x " + it.getNome() + " (+R$ " + extra + ")"
                                : quantidade + "x " + it.getNome());
                    } else {
                        resumo.add(extra.compareTo(BigDecimal.ZERO) > 0
                                ? it.getNome() + " (+R$ " + extra + ")"
                                : it.getNome());
                    }
                }
            } else if (g.itensIds() != null && !g.itensIds().isEmpty()) {
                for (Long itemId : g.itensIds()) {
                    if (itemId == null) continue;

                    ProdutoOpcionalItem it = itemById.get(itemId);
                    if (it == null) continue;

                    if (grupoNome == null && it.getGrupo() != null) {
                        grupoNome = it.getGrupo().getNome();
                    }

                    if (tipoGrupo == null && it.getGrupo() != null) {
                        tipoGrupo = it.getGrupo().getTipoGrupo() != null
                                ? it.getGrupo().getTipoGrupo().name()
                                : null;
                    }

                    itensDTO.add(new CarrinhoOpcionalItemDTO(
                            it.getId(),
                            it.getNome(),
                            it.getPrecoExtra(),
                            1
                    ));

                    BigDecimal extra = Optional.ofNullable(it.getPrecoExtra()).orElse(BigDecimal.ZERO);
                    resumo.add(extra.compareTo(BigDecimal.ZERO) > 0
                            ? it.getNome() + " (+R$ " + extra + ")"
                            : it.getNome());
                }
            }

            detalhado.add(new CarrinhoOpcionalGrupoDTO(
                    g.grupoId(),
                    grupoNome,
                    tipoGrupo,
                    itensDTO
            ));
        }

        return new OpcionaisParsed(detalhado, resumo);
    }
}