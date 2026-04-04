package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.enums.pedido.TipoCupomDesconto;
import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.enums.pedido.TipoPagamento;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "cupom",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"empresa_id", "codigo"})
        }
)
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean apenasPrimeiraCompra;
    private Boolean apenasNovoUsuario;
    private Boolean freteGratis;
    private Boolean aplicaEmItensPromocionais;
    private Integer quantidadeMinimaItens;
    private Integer quantidadeMaximaItens;
    private BigDecimal valorMinimoFrete;

    private LocalTime horarioInicio;
    private LocalTime horarioFim;

    @Column(length = 255)
    private String diasSemanaPermitidos; // ex: "MONDAY,TUESDAY,FRIDAY"

    @Column(length = 255)
    private String bairrosPermitidos; // ex: "CENTRO,ALDEOTA"

    @Column(length = 255)
    private String cepsPermitidos; // opcional

    @Column(length = 255)
    private String categoriasPermitidasIds; // simples
    @Column(length = 255)
    private String produtosPermitidosIds;   // simples

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false, length = 80)
    private String codigo;

    @Column(nullable = false)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    private boolean ativo = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCupomDesconto tipoDesconto;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal valorDesconto;

    @Column(precision = 12, scale = 2)
    private BigDecimal valorMaximoDesconto;

    @Column(precision = 12, scale = 2)
    private BigDecimal valorMinimoPedido;

    private Integer limiteUsoTotal;
    private Integer limiteUsoPorUsuario;

    @Column(nullable = false)
    private Integer totalUsado = 0;

    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;

    @Enumerated(EnumType.STRING)
    private TipoEntrega tipoEntregaPermitida;

    @Enumerated(EnumType.STRING)
    private TipoPagamento tipoPagamentoPermitido;

    @Column(nullable = false)
    private boolean cumulativo = false;

    public Cupom() {}

    public boolean estaVigente(LocalDateTime agora) {
        boolean inicioOk = dataInicio == null || !agora.isBefore(dataInicio);
        boolean fimOk = dataFim == null || !agora.isAfter(dataFim);
        return ativo && inicioOk && fimOk;
    }

    public Long getId() {
        return id;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo != null ? codigo.trim().toUpperCase() : null;
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

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public TipoCupomDesconto getTipoDesconto() {
        return tipoDesconto;
    }

    public void setTipoDesconto(TipoCupomDesconto tipoDesconto) {
        this.tipoDesconto = tipoDesconto;
    }

    public BigDecimal getValorDesconto() {
        return valorDesconto;
    }

    public void setValorDesconto(BigDecimal valorDesconto) {
        this.valorDesconto = valorDesconto;
    }

    public BigDecimal getValorMaximoDesconto() {
        return valorMaximoDesconto;
    }

    public void setValorMaximoDesconto(BigDecimal valorMaximoDesconto) {
        this.valorMaximoDesconto = valorMaximoDesconto;
    }

    public BigDecimal getValorMinimoPedido() {
        return valorMinimoPedido;
    }

    public void setValorMinimoPedido(BigDecimal valorMinimoPedido) {
        this.valorMinimoPedido = valorMinimoPedido;
    }

    public Integer getLimiteUsoTotal() {
        return limiteUsoTotal;
    }

    public void setLimiteUsoTotal(Integer limiteUsoTotal) {
        this.limiteUsoTotal = limiteUsoTotal;
    }

    public Integer getLimiteUsoPorUsuario() {
        return limiteUsoPorUsuario;
    }

    public void setLimiteUsoPorUsuario(Integer limiteUsoPorUsuario) {
        this.limiteUsoPorUsuario = limiteUsoPorUsuario;
    }

    public Integer getTotalUsado() {
        return totalUsado;
    }

    public void setTotalUsado(Integer totalUsado) {
        this.totalUsado = totalUsado;
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

    public TipoEntrega getTipoEntregaPermitida() {
        return tipoEntregaPermitida;
    }

    public void setTipoEntregaPermitida(TipoEntrega tipoEntregaPermitida) {
        this.tipoEntregaPermitida = tipoEntregaPermitida;
    }

    public TipoPagamento getTipoPagamentoPermitido() {
        return tipoPagamentoPermitido;
    }

    public void setTipoPagamentoPermitido(TipoPagamento tipoPagamentoPermitido) {
        this.tipoPagamentoPermitido = tipoPagamentoPermitido;
    }

    public boolean isCumulativo() {
        return cumulativo;
    }

    public void setCumulativo(boolean cumulativo) {
        this.cumulativo = cumulativo;
    }

    public Boolean getApenasPrimeiraCompra() {
        return apenasPrimeiraCompra;
    }

    public void setApenasPrimeiraCompra(Boolean apenasPrimeiraCompra) {
        this.apenasPrimeiraCompra = apenasPrimeiraCompra;
    }

    public Boolean getApenasNovoUsuario() {
        return apenasNovoUsuario;
    }

    public void setApenasNovoUsuario(Boolean apenasNovoUsuario) {
        this.apenasNovoUsuario = apenasNovoUsuario;
    }

    public Boolean getFreteGratis() {
        return freteGratis;
    }

    public void setFreteGratis(Boolean freteGratis) {
        this.freteGratis = freteGratis;
    }

    public Boolean getAplicaEmItensPromocionais() {
        return aplicaEmItensPromocionais;
    }

    public void setAplicaEmItensPromocionais(Boolean aplicaEmItensPromocionais) {
        this.aplicaEmItensPromocionais = aplicaEmItensPromocionais;
    }

    public Integer getQuantidadeMinimaItens() {
        return quantidadeMinimaItens;
    }

    public void setQuantidadeMinimaItens(Integer quantidadeMinimaItens) {
        this.quantidadeMinimaItens = quantidadeMinimaItens;
    }

    public Integer getQuantidadeMaximaItens() {
        return quantidadeMaximaItens;
    }

    public void setQuantidadeMaximaItens(Integer quantidadeMaximaItens) {
        this.quantidadeMaximaItens = quantidadeMaximaItens;
    }

    public BigDecimal getValorMinimoFrete() {
        return valorMinimoFrete;
    }

    public void setValorMinimoFrete(BigDecimal valorMinimoFrete) {
        this.valorMinimoFrete = valorMinimoFrete;
    }

    public LocalTime getHorarioInicio() {
        return horarioInicio;
    }

    public void setHorarioInicio(LocalTime horarioInicio) {
        this.horarioInicio = horarioInicio;
    }

    public LocalTime getHorarioFim() {
        return horarioFim;
    }

    public void setHorarioFim(LocalTime horarioFim) {
        this.horarioFim = horarioFim;
    }

    public String getDiasSemanaPermitidos() {
        return diasSemanaPermitidos;
    }

    public void setDiasSemanaPermitidos(String diasSemanaPermitidos) {
        this.diasSemanaPermitidos = diasSemanaPermitidos;
    }

    public String getBairrosPermitidos() {
        return bairrosPermitidos;
    }

    public void setBairrosPermitidos(String bairrosPermitidos) {
        this.bairrosPermitidos = bairrosPermitidos;
    }

    public String getCepsPermitidos() {
        return cepsPermitidos;
    }

    public void setCepsPermitidos(String cepsPermitidos) {
        this.cepsPermitidos = cepsPermitidos;
    }

    public String getCategoriasPermitidasIds() {
        return categoriasPermitidasIds;
    }

    public void setCategoriasPermitidasIds(String categoriasPermitidasIds) {
        this.categoriasPermitidasIds = categoriasPermitidasIds;
    }

    public String getProdutosPermitidosIds() {
        return produtosPermitidosIds;
    }

    public void setProdutosPermitidosIds(String produtosPermitidosIds) {
        this.produtosPermitidosIds = produtosPermitidosIds;
    }


}