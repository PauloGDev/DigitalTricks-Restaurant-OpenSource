package com.ecommerce.digitaltricks.admin.dto;

import com.ecommerce.digitaltricks.admin.model.NivelFidelidade;

public class NivelFidelidadeResponseDTO {

    private Long id;
    private String nome;
    private Integer minPontos;
    private String cor;
    private String descricao;
    private Long recompensaId;

    public static NivelFidelidadeResponseDTO fromEntity(NivelFidelidade entity) {
        NivelFidelidadeResponseDTO dto = new NivelFidelidadeResponseDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setMinPontos(entity.getMinPontos());
        dto.setCor(entity.getCor());
        dto.setDescricao(entity.getDescricao());
        dto.setRecompensaId(entity.getRecompensaId());
        return dto;
    }

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

    public Integer getMinPontos() {
        return minPontos;
    }

    public void setMinPontos(Integer minPontos) {
        this.minPontos = minPontos;
    }

    public String getCor() {
        return cor;
    }

    public void setCor(String cor) {
        this.cor = cor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Long getRecompensaId() {
        return recompensaId;
    }

    public void setRecompensaId(Long recompensaId) {
        this.recompensaId = recompensaId;
    }
}
