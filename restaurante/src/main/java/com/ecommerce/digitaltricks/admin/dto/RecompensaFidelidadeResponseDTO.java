package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.model.RecompensaFidelidade;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecompensaFidelidadeResponseDTO {

    private Long id;
    private String nome;
    private String descricao;
    private TipoRecompensaFidelidade tipo;
    private Integer valorPontos;
    private BigDecimal descontoPercentual;
    private BigDecimal descontoValorFixo;
    private Long produtoId;
    private String produtoNome; // opcional: nome do produto
    private String imagemUrl;
    private Boolean ativo;
    private Integer estoque;
    private Integer estoqueUtilizado;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;

    public RecompensaFidelidadeResponseDTO() {}

    public static RecompensaFidelidadeResponseDTO fromEntity(RecompensaFidelidade entity) {
        RecompensaFidelidadeResponseDTO dto = new RecompensaFidelidadeResponseDTO();
        dto.id = entity.getId();
        dto.nome = entity.getNome();
        dto.descricao = entity.getDescricao();
        dto.tipo = entity.getTipo();
        dto.valorPontos = entity.getValorPontos();
        dto.descontoPercentual = entity.getDescontoPercentual();
        dto.descontoValorFixo = entity.getDescontoValorFixo();
        dto.produtoId = entity.getProdutoId();
        dto.imagemUrl = entity.getImagemUrl();
        dto.ativo = entity.getAtivo();
        dto.estoque = entity.getEstoque();
        dto.estoqueUtilizado = entity.getEstoqueUtilizado();
        dto.dataInicio = entity.getDataInicio();
        dto.dataFim = entity.getDataFim();
        dto.criadoEm = entity.getCriadoEm();
        dto.atualizadoEm = entity.getAtualizadoEm();
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getProdutoNome() {
        return produtoNome;
    }

    public void setProdutoNome(String produtoNome) {
        this.produtoNome = produtoNome;
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
}