package com.ecommerce.digitaltricks.model;

import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.enums.usuarios.admin.StatusEmpresa;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "empresas")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFantasia;

    private String razaoSocial;

    @Column(unique = true, nullable = false)
    private String cnpj;

    @Column(nullable = false, unique = true)
    private String slug;

    private String email;
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusEmpresa status = StatusEmpresa.ATIVA;

    private String mercadoPagoUserId;

    @Column(length = 1000)
    private String mercadoPagoAccessToken;

    @Column(length = 1000)
    private String mercadoPagoRefreshToken;

    @Column(nullable = false)
    private Boolean mpContaConectada = false;

    /* =========================
       ENDEREÇO DA EMPRESA
       ========================= */
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String cidade;
    private String complemento;
    private String uf;

    private Double latitude;
    private Double longitude;

    /* =========================
       CONFIGURAÇÃO DE ENTREGA
       ========================= */
    @Column(nullable = false)
    private Boolean aceitaRetirada = true;

    @Column(nullable = false)
    private Boolean aceitaDelivery = true;

    private Double raioEntregaKm;
    private Double taxaEntregaFixa;
    private Double valorPorKm;
    private Double pedidoMinimoDelivery;
    private Double valorFreteGratis;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 200)
    private String categoriaPreview;

    @Column(length = 5000)
    private String horariosFuncionamento;

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Produto> produtos = new ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UsuarioEmpresa> usuarios = new ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClienteEmpresa> clientes = new ArrayList<>();

    @OneToMany(mappedBy = "empresa")
    private List<Pedido> pedidos = new ArrayList<>();

    @OneToMany(mappedBy = "empresa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Categoria> categorias = new ArrayList<>();

    public Empresa() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getCategoriaPreview() {
        return categoriaPreview;
    }

    public void setCategoriaPreview(String categoriaPreview) {
        this.categoriaPreview = categoriaPreview;
    }

    public String getHorariosFuncionamento() {
        return horariosFuncionamento;
    }

    public void setHorariosFuncionamento(String horariosFuncionamento) {
        this.horariosFuncionamento = horariosFuncionamento;
    }

    public Long getId() {
        return id;
    }

    public String getNomeFantasia() {
        return nomeFantasia;
    }

    public void setNomeFantasia(String nomeFantasia) {
        this.nomeFantasia = nomeFantasia;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getCnpj() {
        return cnpj;
    }

    public void setCnpj(String cnpj) {
        this.cnpj = cnpj;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public StatusEmpresa getStatus() {
        return status;
    }

    public void setStatus(StatusEmpresa status) {
        this.status = status;
    }

    public String getMercadoPagoUserId() {
        return mercadoPagoUserId;
    }

    public void setMercadoPagoUserId(String mercadoPagoUserId) {
        this.mercadoPagoUserId = mercadoPagoUserId;
    }

    public String getMercadoPagoAccessToken() {
        return mercadoPagoAccessToken;
    }

    public void setMercadoPagoAccessToken(String mercadoPagoAccessToken) {
        this.mercadoPagoAccessToken = mercadoPagoAccessToken;
    }

    public String getMercadoPagoRefreshToken() {
        return mercadoPagoRefreshToken;
    }

    public void setMercadoPagoRefreshToken(String mercadoPagoRefreshToken) {
        this.mercadoPagoRefreshToken = mercadoPagoRefreshToken;
    }

    public Boolean getMpContaConectada() {
        return mpContaConectada;
    }

    public void setMpContaConectada(Boolean mpContaConectada) {
        this.mpContaConectada = mpContaConectada;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Boolean getAceitaRetirada() {
        return aceitaRetirada;
    }

    public void setAceitaRetirada(Boolean aceitaRetirada) {
        this.aceitaRetirada = aceitaRetirada;
    }

    public Boolean getAceitaDelivery() {
        return aceitaDelivery;
    }

    public void setAceitaDelivery(Boolean aceitaDelivery) {
        this.aceitaDelivery = aceitaDelivery;
    }

    public Double getRaioEntregaKm() {
        return raioEntregaKm;
    }

    public void setRaioEntregaKm(Double raioEntregaKm) {
        this.raioEntregaKm = raioEntregaKm;
    }

    public Double getTaxaEntregaFixa() {
        return taxaEntregaFixa;
    }

    public void setTaxaEntregaFixa(Double taxaEntregaFixa) {
        this.taxaEntregaFixa = taxaEntregaFixa;
    }

    public Double getValorPorKm() {
        return valorPorKm;
    }

    public void setValorPorKm(Double valorPorKm) {
        this.valorPorKm = valorPorKm;
    }

    public Double getPedidoMinimoDelivery() {
        return pedidoMinimoDelivery;
    }

    public void setPedidoMinimoDelivery(Double pedidoMinimoDelivery) {
        this.pedidoMinimoDelivery = pedidoMinimoDelivery;
    }

    public Double getValorFreteGratis() {
        return valorFreteGratis;
    }

    public void setValorFreteGratis(Double valorFreteGratis) {
        this.valorFreteGratis = valorFreteGratis;
    }

    public List<Produto> getProdutos() {
        return produtos;
    }

    public void setProdutos(List<Produto> produtos) {
        this.produtos = produtos;
    }

    public List<UsuarioEmpresa> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<UsuarioEmpresa> usuarios) {
        this.usuarios = usuarios;
    }

    public List<ClienteEmpresa> getClientes() {
        return clientes;
    }

    public void setClientes(List<ClienteEmpresa> clientes) {
        this.clientes = clientes;
    }

    public List<Pedido> getPedidos() {
        return pedidos;
    }

    public void setPedidos(List<Pedido> pedidos) {
        this.pedidos = pedidos;
    }

    public List<Categoria> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<Categoria> categorias) {
        this.categorias = categorias;
    }

    @PrePersist
    @PreUpdate
    public void gerarSlugSeNecessario() {
        if (nomeFantasia != null && (slug == null || slug.isBlank())) {
            this.slug = nomeFantasia.toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-")
                    .replaceAll("-+", "-")
                    .replaceAll("^-|-$", "");
        }
    }

    public boolean isAbertoAgora() {
        if (horariosFuncionamento == null) return false;

        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Map<String, Object>> horarios =
                    mapper.readValue(horariosFuncionamento, Map.class);

            DayOfWeek hoje = LocalDate.now().getDayOfWeek();

            String chave = switch (hoje) {
                case SUNDAY -> "domingo";
                case MONDAY -> "segunda";
                case TUESDAY -> "terca";
                case WEDNESDAY -> "quarta";
                case THURSDAY -> "quinta";
                case FRIDAY -> "sexta";
                case SATURDAY -> "sabado";
            };

            Map<String, Object> dia = horarios.get(chave);
            if (dia == null || !(Boolean) dia.get("aberto")) return false;

            LocalTime agora = LocalTime.now();

            LocalTime inicio = LocalTime.parse((String) dia.get("inicio"));
            LocalTime fim = LocalTime.parse((String) dia.get("fim"));

            return !agora.isBefore(inicio) && !agora.isAfter(fim);

        } catch (Exception e) {
            return false;
        }
    }
}