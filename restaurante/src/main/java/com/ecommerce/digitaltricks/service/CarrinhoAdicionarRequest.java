package com.ecommerce.digitaltricks.service;

import java.util.List;

public class CarrinhoAdicionarRequest {

    private Long produtoId;
    private Long variacaoId;
    private int quantidade;
    private List<OpcionaisGrupoReq> opcionais;
    private String observacao;

    public Long getProdutoId() { return produtoId; }
    public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }

    public Long getVariacaoId() { return variacaoId; }
    public void setVariacaoId(Long variacaoId) { this.variacaoId = variacaoId; }

    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }

    public List<OpcionaisGrupoReq> getOpcionais() { return opcionais; }
    public void setOpcionais(List<OpcionaisGrupoReq> opcionais) { this.opcionais = opcionais; }

    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }

    public static class OpcionaisGrupoReq {
        private Long grupoId;
        private String tipoGrupo;
        private List<ItemSelecionadoReq> itens;

        public Long getGrupoId() { return grupoId; }
        public void setGrupoId(Long grupoId) { this.grupoId = grupoId; }

        public String getTipoGrupo() { return tipoGrupo; }
        public void setTipoGrupo(String tipoGrupo) { this.tipoGrupo = tipoGrupo; }

        public List<ItemSelecionadoReq> getItens() { return itens; }
        public void setItens(List<ItemSelecionadoReq> itens) { this.itens = itens; }
    }

    public static class ItemSelecionadoReq {
        private Long itemId;
        private Integer quantidade;

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public Integer getQuantidade() { return quantidade; }
        public void setQuantidade(Integer quantidade) { this.quantidade = quantidade; }
    }
}