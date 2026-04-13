package com.ecommerce.digitaltricks.admin.dto;

public class RecompensaFidelidadeResgateResponseDTO {

    private RecompensaFidelidadeResponseDTO recompensa;
    private Integer pontosRestantes;
    private String mensagem;
    private String codigoCupom;
    private Boolean cupomAplicadoNoCarrinho;

    public RecompensaFidelidadeResgateResponseDTO() {
    }

    public RecompensaFidelidadeResgateResponseDTO(
            RecompensaFidelidadeResponseDTO recompensa,
            Integer pontosRestantes,
            String mensagem,
            String codigoCupom,
            Boolean cupomAplicadoNoCarrinho
    ) {
        this.recompensa = recompensa;
        this.pontosRestantes = pontosRestantes;
        this.mensagem = mensagem;
        this.codigoCupom = codigoCupom;
        this.cupomAplicadoNoCarrinho = cupomAplicadoNoCarrinho;
    }

    public RecompensaFidelidadeResponseDTO getRecompensa() {
        return recompensa;
    }

    public void setRecompensa(RecompensaFidelidadeResponseDTO recompensa) {
        this.recompensa = recompensa;
    }

    public Integer getPontosRestantes() {
        return pontosRestantes;
    }

    public void setPontosRestantes(Integer pontosRestantes) {
        this.pontosRestantes = pontosRestantes;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }

    public String getCodigoCupom() {
        return codigoCupom;
    }

    public void setCodigoCupom(String codigoCupom) {
        this.codigoCupom = codigoCupom;
    }

    public Boolean getCupomAplicadoNoCarrinho() {
        return cupomAplicadoNoCarrinho;
    }

    public void setCupomAplicadoNoCarrinho(Boolean cupomAplicadoNoCarrinho) {
        this.cupomAplicadoNoCarrinho = cupomAplicadoNoCarrinho;
    }
}
