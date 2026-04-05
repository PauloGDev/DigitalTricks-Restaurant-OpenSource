package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.enums.TipoDescontoPromocao;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(
        name = "produto",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"empresa_id", "slug"})
        }
)
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private BigDecimal precoBase;
    private Integer estoque;

    private String imagemUrl;
    private String imagemPublicId;

    @Column(nullable = false)
    private BigDecimal precoMinimo = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal precoPromocional = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int pedidos;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean ativo = true;

    @Column(nullable = false)
    private String slug;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "produto_categoria",
            joinColumns = @JoinColumn(name = "produto_id"),
            inverseJoinColumns = @JoinColumn(name = "categoria_id")
    )
    private List<Categoria> categorias = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Variacao> variacoes = new ArrayList<>();

    @OneToMany(mappedBy = "produto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC, id ASC")
    private List<ProdutoOpcionalGrupo> gruposOpcionais = new ArrayList<>();

    @Column(nullable = false)
    private boolean permiteObservacao = true;

    @Column(nullable = false)
    private int maxObservacaoChars = 140;

    @Column(nullable = false)
    private boolean emOferta = false;

    @Enumerated(EnumType.STRING)
    private TipoDescontoPromocao tipoDesconto;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorDesconto;

    private String tituloOferta;

    private LocalDateTime inicioOferta;
    private LocalDateTime fimOferta;

    public Produto() {}

    public Produto(
            String nome,
            String descricao,
            BigDecimal precoBase,
            Integer estoque,
            String imagemUrl,
            Integer pedidos
    ) {
        this.nome = nome;
        this.descricao = descricao;
        this.precoBase = precoBase;
        this.estoque = estoque;
        this.imagemUrl = imagemUrl;
        this.pedidos = pedidos != null ? pedidos : 0;
    }

    @PrePersist
    @PreUpdate
    public void beforeSaveOrUpdate() {
        normalizarCampos();
        gerarSlugSeNecessario();
        vincularFilhos();
        atualizarPrecoMinimo();
        validarPromocao();
        atualizarPrecoPromocional();
    }

    @PostLoad
    public void atualizarAoCarregar() {
        atualizarPrecoMinimo();
        atualizarPrecoPromocional();
    }

    private void normalizarCampos() {
        if (nome != null) {
            nome = nome.trim();
        }

        if (descricao != null && descricao.isBlank()) {
            descricao = null;
        }

        if (tituloOferta != null && tituloOferta.isBlank()) {
            tituloOferta = null;
        }

        if (precoBase != null && precoBase.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Preço base não pode ser negativo.");
        }

        if (estoque != null && estoque < 0) {
            throw new IllegalArgumentException("Estoque não pode ser negativo.");
        }

        if (maxObservacaoChars < 0) {
            maxObservacaoChars = 0;
        }

        if (pedidos < 0) {
            pedidos = 0;
        }
    }

    private void vincularFilhos() {
        if (variacoes != null) {
            for (Variacao variacao : variacoes) {
                if (variacao != null) {
                    variacao.setProduto(this);
                }
            }
        }

        if (gruposOpcionais != null) {
            for (ProdutoOpcionalGrupo grupo : gruposOpcionais) {
                if (grupo != null) {
                    grupo.setProduto(this);
                    grupo.vincularItensAoGrupo();
                }
            }
        }
    }

    private void gerarSlugSeNecessario() {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome do produto é obrigatório.");
        }

        if (slug == null || slug.isBlank()) {
            this.slug = slugify(nome);
        } else {
            this.slug = slugify(slug);
        }
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    public void atualizarPrecoMinimo() {
        if (variacoes != null && !variacoes.isEmpty()) {
            this.precoMinimo = variacoes.stream()
                    .filter(Objects::nonNull)
                    .map(Variacao::getPreco)
                    .filter(Objects::nonNull)
                    .min(BigDecimal::compareTo)
                    .orElse(precoBase != null ? precoBase : BigDecimal.ZERO);
        } else {
            this.precoMinimo = precoBase != null ? precoBase : BigDecimal.ZERO;
        }
    }

    public BigDecimal calcularPrecoComPromocao(BigDecimal base) {
        if (base == null) return BigDecimal.ZERO;
        if (!isOfertaVigente()) return base;

        if (tipoDesconto == TipoDescontoPromocao.PERCENTUAL) {
            BigDecimal desconto = base.multiply(valorDesconto)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return base.subtract(desconto).max(BigDecimal.ZERO);
        }

        if (tipoDesconto == TipoDescontoPromocao.VALOR_FIXO) {
            return base.subtract(valorDesconto).max(BigDecimal.ZERO);
        }

        return base;
    }

    public void atualizarPrecoPromocional() {
        this.precoPromocional = calcularPrecoComPromocao(getPrecoBaseCalculo());
    }

    @JsonIgnore
    public BigDecimal getPrecoBaseCalculo() {
        return precoMinimo != null ? precoMinimo : BigDecimal.ZERO;
    }

    @JsonIgnore
    public BigDecimal getPrecoPromocionalCalculado() {
        return calcularPrecoComPromocao(getPrecoBaseCalculo());
    }

    public boolean isOfertaVigente() {
        if (!emOferta) return false;
        if (valorDesconto == null || valorDesconto.compareTo(BigDecimal.ZERO) <= 0) return false;

        LocalDateTime agora = LocalDateTime.now();

        boolean iniciou = (inicioOferta == null || !agora.isBefore(inicioOferta));
        boolean naoExpirou = (fimOferta == null || !agora.isAfter(fimOferta));

        return iniciou && naoExpirou;
    }

    private void validarPromocao() {
        if (!emOferta) {
            this.tipoDesconto = null;
            this.valorDesconto = null;
            this.tituloOferta = null;
            this.inicioOferta = null;
            this.fimOferta = null;
            return;
        }

        if (tipoDesconto == null) {
            throw new IllegalArgumentException("Tipo de desconto é obrigatório quando o produto está em oferta.");
        }

        if (valorDesconto == null || valorDesconto.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor do desconto deve ser maior que zero.");
        }

        if (tipoDesconto == TipoDescontoPromocao.PERCENTUAL &&
                valorDesconto.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Desconto percentual não pode ser maior que 100.");
        }

        if (tipoDesconto == TipoDescontoPromocao.VALOR_FIXO &&
                getPrecoBaseCalculo().compareTo(BigDecimal.ZERO) > 0 &&
                valorDesconto.compareTo(getPrecoBaseCalculo()) > 0) {
            throw new IllegalArgumentException("Desconto fixo não pode ser maior que o preço base calculado.");
        }

        if (inicioOferta != null && fimOferta != null && fimOferta.isBefore(inicioOferta)) {
            throw new IllegalArgumentException("A data final da oferta não pode ser menor que a data inicial.");
        }
    }

    public void addVariacao(Variacao variacao) {
        if (variacao == null) return;
        variacao.setProduto(this);
        this.variacoes.add(variacao);
    }

    public void addGrupoOpcional(ProdutoOpcionalGrupo grupo) {
        if (grupo == null) return;
        grupo.setProduto(this);
        grupo.vincularItensAoGrupo();
        this.gruposOpcionais.add(grupo);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getPrecoBase() { return precoBase; }
    public void setPrecoBase(BigDecimal precoBase) { this.precoBase = precoBase; }

    public Integer getEstoque() { return estoque; }
    public void setEstoque(Integer estoque) { this.estoque = estoque; }

    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }

    public String getImagemPublicId() { return imagemPublicId; }
    public void setImagemPublicId(String imagemPublicId) { this.imagemPublicId = imagemPublicId; }

    public BigDecimal getPrecoMinimo() { return precoMinimo; }
    public void setPrecoMinimo(BigDecimal precoMinimo) {
        this.precoMinimo = precoMinimo != null ? precoMinimo : BigDecimal.ZERO;
    }

    public BigDecimal getPrecoPromocional() { return precoPromocional; }
    public void setPrecoPromocional(BigDecimal precoPromocional) {
        this.precoPromocional = precoPromocional != null ? precoPromocional : BigDecimal.ZERO;
    }

    public int getPedidos() { return pedidos; }
    public void setPedidos(int pedidos) { this.pedidos = Math.max(0, pedidos); }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public List<Categoria> getCategorias() { return categorias; }
    public void setCategorias(List<Categoria> categorias) {
        this.categorias = categorias != null ? new ArrayList<>(categorias) : new ArrayList<>();
    }

    public List<Variacao> getVariacoes() { return variacoes; }
    public void setVariacoes(List<Variacao> variacoes) {
        this.variacoes = new ArrayList<>();
        if (variacoes != null) {
            for (Variacao variacao : variacoes) {
                addVariacao(variacao);
            }
        }
    }

    public List<ProdutoOpcionalGrupo> getGruposOpcionais() { return gruposOpcionais; }
    public void setGruposOpcionais(List<ProdutoOpcionalGrupo> gruposOpcionais) {
        this.gruposOpcionais = new ArrayList<>();
        if (gruposOpcionais != null) {
            for (ProdutoOpcionalGrupo grupo : gruposOpcionais) {
                addGrupoOpcional(grupo);
            }
        }
    }

    public boolean isPermiteObservacao() { return permiteObservacao; }
    public void setPermiteObservacao(boolean permiteObservacao) { this.permiteObservacao = permiteObservacao; }

    public int getMaxObservacaoChars() { return maxObservacaoChars; }
    public void setMaxObservacaoChars(int maxObservacaoChars) { this.maxObservacaoChars = Math.max(0, maxObservacaoChars); }

    public boolean isEmOferta() { return emOferta; }
    public void setEmOferta(boolean emOferta) { this.emOferta = emOferta; }

    public TipoDescontoPromocao getTipoDesconto() { return tipoDesconto; }
    public void setTipoDesconto(TipoDescontoPromocao tipoDesconto) { this.tipoDesconto = tipoDesconto; }

    public BigDecimal getValorDesconto() { return valorDesconto; }
    public void setValorDesconto(BigDecimal valorDesconto) { this.valorDesconto = valorDesconto; }

    public String getTituloOferta() { return tituloOferta; }
    public void setTituloOferta(String tituloOferta) { this.tituloOferta = tituloOferta; }

    public LocalDateTime getInicioOferta() { return inicioOferta; }
    public void setInicioOferta(LocalDateTime inicioOferta) { this.inicioOferta = inicioOferta; }

    public LocalDateTime getFimOferta() { return fimOferta; }
    public void setFimOferta(LocalDateTime fimOferta) { this.fimOferta = fimOferta; }
}