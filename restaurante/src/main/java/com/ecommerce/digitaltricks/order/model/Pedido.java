package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.costumer.model.Endereco;
import com.ecommerce.digitaltricks.enums.pedido.MotivoCancelamento;
import com.ecommerce.digitaltricks.enums.pedido.OrigemCancelamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPagamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.enums.pedido.TipoPagamento;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    private String mercadoPagoPreferenceId;

    @Column(name = "mercado_pago_order_id")
    private String mercadoPagoOrderId;

    @Column(name = "mp_payment_id")
    private String mpPaymentId;

    @Column(name = "mp_status")
    private String mpStatus;

    @Column(name = "payment_provider")
    private String paymentProvider;

    private String stripeSessionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "pedido_id")
    private List<ItemPedido> itens = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "endereco_id")
    private Endereco enderecoEntrega;

    @Column(precision = 12, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusPedido status = StatusPedido.AGUARDANDO_PAGAMENTO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_pagamento", nullable = false)
    private StatusPagamento statusPagamento = StatusPagamento.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_cancelamento")
    private MotivoCancelamento motivoCancelamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "origem_cancelamento")
    private OrigemCancelamento origemCancelamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false)
    private TipoEntrega tipoEntrega = TipoEntrega.DELIVERY;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_pagamento", nullable = false)
    private TipoPagamento tipoPagamento;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "metodo", column = @Column(name = "pay_on_method")),
            @AttributeOverride(name = "precisaTroco", column = @Column(name = "pay_on_needs_change")),
            @AttributeOverride(name = "trocoPara", column = @Column(name = "pay_on_change_for", precision = 12, scale = 2))
    })
    private PagamentoNaEntrega pagamentoNaEntrega;

    private String nomeCompleto;
    private String telefone;
    private String email;
    private String cpf;

    private String servicoFrete;
    private Double valorFrete;
    private String prazoFrete;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String invoiceUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String pixPayload;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String pixQrCodeBase64;

    private String cupomCodigo;

    @Column(precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 12, scale = 2)
    private BigDecimal descontoCupom = BigDecimal.ZERO;

    public Pedido() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public String getMercadoPagoPreferenceId() {
        return mercadoPagoPreferenceId;
    }

    public void setMercadoPagoPreferenceId(String mercadoPagoPreferenceId) {
        this.mercadoPagoPreferenceId = mercadoPagoPreferenceId;
    }

    public String getMercadoPagoOrderId() {
        return mercadoPagoOrderId;
    }

    public void setMercadoPagoOrderId(String mercadoPagoOrderId) {
        this.mercadoPagoOrderId = mercadoPagoOrderId;
    }

    public String getMpPaymentId() {
        return mpPaymentId;
    }

    public void setMpPaymentId(String mpPaymentId) {
        this.mpPaymentId = mpPaymentId;
    }

    public String getMpStatus() {
        return mpStatus;
    }

    public void setMpStatus(String mpStatus) {
        this.mpStatus = mpStatus;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public String getStripeSessionId() {
        return stripeSessionId;
    }

    public void setStripeSessionId(String stripeSessionId) {
        this.stripeSessionId = stripeSessionId;
    }

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public List<ItemPedido> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedido> itens) {
        this.itens = itens;
    }

    public Endereco getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public void setEnderecoEntrega(Endereco enderecoEntrega) {
        this.enderecoEntrega = enderecoEntrega;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public StatusPedido getStatus() {
        return status;
    }

    public void setStatus(StatusPedido status) {
        this.status = status;
    }

    public StatusPagamento getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(StatusPagamento statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

    public MotivoCancelamento getMotivoCancelamento() {
        return motivoCancelamento;
    }

    public void setMotivoCancelamento(MotivoCancelamento motivoCancelamento) {
        this.motivoCancelamento = motivoCancelamento;
    }

    public OrigemCancelamento getOrigemCancelamento() {
        return origemCancelamento;
    }

    public void setOrigemCancelamento(OrigemCancelamento origemCancelamento) {
        this.origemCancelamento = origemCancelamento;
    }

    public TipoEntrega getTipoEntrega() {
        return tipoEntrega;
    }

    public void setTipoEntrega(TipoEntrega tipoEntrega) {
        this.tipoEntrega = tipoEntrega;
    }

    public TipoPagamento getTipoPagamento() {
        return tipoPagamento;
    }

    public void setTipoPagamento(TipoPagamento tipoPagamento) {
        this.tipoPagamento = tipoPagamento;
    }

    public PagamentoNaEntrega getPagamentoNaEntrega() {
        return pagamentoNaEntrega;
    }

    public void setPagamentoNaEntrega(PagamentoNaEntrega pagamentoNaEntrega) {
        this.pagamentoNaEntrega = pagamentoNaEntrega;
    }

    public String getNomeCompleto() {
        return nomeCompleto;
    }

    public void setNomeCompleto(String nomeCompleto) {
        this.nomeCompleto = nomeCompleto;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getServicoFrete() {
        return servicoFrete;
    }

    public void setServicoFrete(String servicoFrete) {
        this.servicoFrete = servicoFrete;
    }

    public Double getValorFrete() {
        return valorFrete;
    }

    public void setValorFrete(Double valorFrete) {
        this.valorFrete = valorFrete;
    }

    public String getPrazoFrete() {
        return prazoFrete;
    }

    public void setPrazoFrete(String prazoFrete) {
        this.prazoFrete = prazoFrete;
    }

    public String getInvoiceUrl() {
        return invoiceUrl;
    }

    public void setInvoiceUrl(String invoiceUrl) {
        this.invoiceUrl = invoiceUrl;
    }

    public String getPixPayload() {
        return pixPayload;
    }

    public void setPixPayload(String pixPayload) {
        this.pixPayload = pixPayload;
    }

    public String getPixQrCodeBase64() {
        return pixQrCodeBase64;
    }

    public void setPixQrCodeBase64(String pixQrCodeBase64) {
        this.pixQrCodeBase64 = pixQrCodeBase64;
    }

    public String getCupomCodigo() {
        return cupomCodigo;
    }

    public void setCupomCodigo(String cupomCodigo) {
        this.cupomCodigo = cupomCodigo;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDescontoCupom() {
        return descontoCupom;
    }

    public void setDescontoCupom(BigDecimal descontoCupom) {
        this.descontoCupom = descontoCupom;
    }
}