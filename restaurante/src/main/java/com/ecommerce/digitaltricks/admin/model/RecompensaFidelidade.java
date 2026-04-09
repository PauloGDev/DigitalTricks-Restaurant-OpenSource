package com.ecommerce.digitaltricks.admin.model;

import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "recompensa_fidelidade",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"empresa_id", "nome"})
    }
)
public class RecompensaFidelidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoRecompensaFidelidade tipo;

    @Column(nullable = false)
    private Integer valorPontos; // pontos necessários para resgatar

    @Column(precision = 5, scale = 2)
    private BigDecimal descontoPercentual; // para DESCONTO_PERCENTUAL (ex: 10.00)

    @Column(precision = 12, scale = 2)
    private BigDecimal descontoValorFixo; // para DESCONTO_VALOR_FIXO

    @Column
    private Long produtoId; // para PRODUTO_GRATIS (referência ao produto)

    @Column(length = 255)
    private String imagemUrl; // URL da imagem da recompensa

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(nullable = false)
    private Integer estoque = 0; // 0 = ilimitado

    @Column
    private Integer estoqueUtilizado = 0;

    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;

    @Column(nullable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    public RecompensaFidelidade() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoRecompensaFidelidade getTipo() {
        return tipo;
    }

    public void setTipo(TipoRecompensaFidelidade tipo) {
        this.tipo = tipo;
    }

    public Integer getValorPontos() {
        return valorPontos;
    }

    public void setValorPontos(Integer valorPontos) {
        this.valorPontos = valorPontos;
    }

    public BigDecimal getDescontoPercentual() {
        return descontoPercentual;
    }

    public void setDescontoPercentual(BigDecimal descontoPercentual) {
        this.descontoPercentual = descontoPercentual;
    }

    public BigDecimal getDescontoValorFixo() {
        return descontoValorFixo;
    }

    public void setDescontoValorFixo(BigDecimal descontoValorFixo) {
        this.descontoValorFixo = descontoValorFixo;
    }

    public Long getProdutoId() {
        return produtoId;
    }

    public void setProdutoId(Long produtoId) {
        this.produtoId = produtoId;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public Integer getEstoque() {
        return estoque;
    }

    public void setEstoque(Integer estoque) {
        this.estoque = estoque;
    }

    public Integer getEstoqueUtilizado() {
        return estoqueUtilizado;
    }

    public void setEstoqueUtilizado(Integer estoqueUtilizado) {
        this.estoqueUtilizado = estoqueUtilizado;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(LocalDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    // Helper method to check if reward is available
    public boolean estaDisponivel(LocalDateTime agora) {
        if (!ativo) return false;
        if (estoque > 0 && estoqueUtilizado >= estoque) return false;

        boolean inicioOk = dataInicio == null || !agora.isBefore(dataInicio);
        boolean fimOk = dataFim == null || !agora.isAfter(dataFim);
        return inicioOk && fimOk;
    }
}