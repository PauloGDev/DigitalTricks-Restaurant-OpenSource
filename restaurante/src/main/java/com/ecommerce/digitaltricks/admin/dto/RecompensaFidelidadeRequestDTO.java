package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecompensaFidelidadeRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    private String descricao;

    @NotNull(message = "Tipo é obrigatório")
    private TipoRecompensaFidelidade tipo;

    @NotNull(message = "Valor em pontos é obrigatório")
    @Positive(message = "Valor em pontos deve ser positivo")
    private Integer valorPontos;

    private BigDecimal descontoPercentual;
    private BigDecimal descontoValorFixo;
    private Long produtoId;
    private String imagemUrl;

    @NotNull(message = "Ativo é obrigatório")
    private Boolean ativo = true;

    @NotNull(message = "Estoque é obrigatório")
    private Integer estoque = 0;

    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;

    // Getters and Setters
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
}