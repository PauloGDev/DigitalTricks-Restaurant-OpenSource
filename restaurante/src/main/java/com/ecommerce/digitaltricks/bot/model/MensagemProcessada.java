package com.ecommerce.digitaltricks.bot.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class MensagemProcessada {
    @Id
    private String id;

    public MensagemProcessada(String id) {
        this.id = id;
    }

    public MensagemProcessada() {

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
