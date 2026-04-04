package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.enums.pedido.MetodoPagamentoNaEntrega;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Embeddable
public class PagamentoNaEntrega {

    @Enumerated(EnumType.STRING)
    @Column(name = "pay_on_method")
    private MetodoPagamentoNaEntrega metodo; // DEBIT | CREDIT | CASH

    @Column(name = "pay_on_needs_change")
    private Boolean precisaTroco;

    @Column(name = "pay_on_change_for", precision = 12, scale = 2)
    private BigDecimal trocoPara;

    public MetodoPagamentoNaEntrega getMetodo() { return metodo; }
    public void setMetodo(MetodoPagamentoNaEntrega metodo) { this.metodo = metodo; }

    public Boolean getPrecisaTroco() { return precisaTroco; }
    public void setPrecisaTroco(Boolean precisaTroco) { this.precisaTroco = precisaTroco; }

    public BigDecimal getTrocoPara() { return trocoPara; }
    public void setTrocoPara(BigDecimal trocoPara) { this.trocoPara = trocoPara; }
}