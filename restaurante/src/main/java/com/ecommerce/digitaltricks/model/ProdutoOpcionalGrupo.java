package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.enums.produtos.TipoGrupoProduto;
import com.ecommerce.digitaltricks.enums.produtos.TipoSelecaoOpcional;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "produto_opcional_grupo")
public class ProdutoOpcionalGrupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(nullable = false)
    private boolean obrigatorio = false;

    @Column(nullable = false)
    private Integer minSelecionaveis = 0;

    @Column(nullable = false)
    private Integer maxSelecionaveis = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoSelecaoOpcional tipoSelecao = TipoSelecaoOpcional.SINGLE;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(nullable = false)
    private Integer ordem = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @OneToMany(mappedBy = "grupo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    private List<ProdutoOpcionalItem> itens = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoGrupoProduto tipoGrupo = TipoGrupoProduto.OPCIONAL_SELECAO;

    @PrePersist
    @PreUpdate
    public void normalizeRules() {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do grupo opcional é obrigatório.");
        }

        if (minSelecionaveis == null) minSelecionaveis = 0;
        if (maxSelecionaveis == null) maxSelecionaveis = 0;
        if (ordem == null) ordem = 0;
        if (tipoSelecao == null) tipoSelecao = TipoSelecaoOpcional.SINGLE;
        if (tipoGrupo == null) tipoGrupo = TipoGrupoProduto.OPCIONAL_SELECAO;

        if (minSelecionaveis < 0) minSelecionaveis = 0;
        if (maxSelecionaveis < 0) maxSelecionaveis = 0;
        if (maxSelecionaveis < minSelecionaveis) maxSelecionaveis = minSelecionaveis;

        if (tipoSelecao == TipoSelecaoOpcional.SINGLE) {
            maxSelecionaveis = Math.min(maxSelecionaveis, 1);
            minSelecionaveis = Math.min(minSelecionaveis, 1);
        }

        if (obrigatorio && minSelecionaveis == 0) {
            minSelecionaveis = 1;
        }

        vincularItensAoGrupo();
    }

    public void vincularItensAoGrupo() {
        if (itens == null) {
            itens = new ArrayList<>();
            return;
        }

        for (ProdutoOpcionalItem item : itens) {
            if (item != null) {
                item.setGrupo(this);
            }
        }
    }

    public void addItem(ProdutoOpcionalItem item) {
        if (item == null) return;
        item.setGrupo(this);
        this.itens.add(item);
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TipoGrupoProduto getTipoGrupo() {
        return tipoGrupo;
    }

    public void setTipoGrupo(TipoGrupoProduto tipoGrupo) {
        this.tipoGrupo = tipoGrupo;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public boolean isObrigatorio() { return obrigatorio; }
    public void setObrigatorio(boolean obrigatorio) { this.obrigatorio = obrigatorio; }
    public Integer getMinSelecionaveis() { return minSelecionaveis; }
    public void setMinSelecionaveis(Integer minSelecionaveis) { this.minSelecionaveis = minSelecionaveis; }
    public Integer getMaxSelecionaveis() { return maxSelecionaveis; }
    public void setMaxSelecionaveis(Integer maxSelecionaveis) { this.maxSelecionaveis = maxSelecionaveis; }
    public TipoSelecaoOpcional getTipoSelecao() { return tipoSelecao; }
    public void setTipoSelecao(TipoSelecaoOpcional tipoSelecao) { this.tipoSelecao = tipoSelecao; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public Integer getOrdem() { return ordem; }
    public void setOrdem(Integer ordem) { this.ordem = ordem; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public List<ProdutoOpcionalItem> getItens() { return itens; }

    public void setItens(List<ProdutoOpcionalItem> itens) {
        this.itens = new ArrayList<>();
        if (itens != null) {
            for (ProdutoOpcionalItem item : itens) {
                addItem(item);
            }
        }
    }
}