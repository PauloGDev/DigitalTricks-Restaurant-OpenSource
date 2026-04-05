package com.ecommerce.digitaltricks.customer.service;

import com.ecommerce.digitaltricks.integration.NominatimClient;
import com.ecommerce.digitaltricks.integration.ViaCepClient;
import com.ecommerce.digitaltricks.integration.dto.CoordenadaDTO;
import com.ecommerce.digitaltricks.integration.dto.ViaCepResponse;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.customer.model.Endereco;
import org.springframework.stereotype.Service;

@Service
public class EnderecoGeocodingService {

    private final ViaCepClient viaCepClient;
    private final NominatimClient nominatimClient;

    public EnderecoGeocodingService(ViaCepClient viaCepClient,
                                    NominatimClient nominatimClient) {
        this.viaCepClient = viaCepClient;
        this.nominatimClient = nominatimClient;
    }

    public void enriquecerEndereco(Endereco endereco) {
        preencherPorCep(endereco);
        preencherCoordenadas(endereco);
    }

    public void enriquecerEmpresa(Empresa empresa) {
        preencherPorCep(empresa);
        preencherCoordenadas(empresa);
    }

    private void preencherPorCep(Endereco endereco) {
        if (endereco.getCep() == null || endereco.getCep().isBlank()) {
            return;
        }

        ViaCepResponse cep = viaCepClient.buscarCep(endereco.getCep());

        if (isBlank(endereco.getLogradouro())) endereco.setLogradouro(cep.logradouro());
        if (isBlank(endereco.getBairro())) endereco.setBairro(cep.bairro());
        if (isBlank(endereco.getCidade())) endereco.setCidade(cep.localidade());
        if (isBlank(endereco.getUf())) endereco.setUf(cep.uf());
        if (isBlank(endereco.getComplemento())) endereco.setComplemento(cep.complemento());
        endereco.setCep(cep.cep());
    }

    private void preencherPorCep(Empresa empresa) {
        if (empresa.getCep() == null || empresa.getCep().isBlank()) {
            return;
        }

        ViaCepResponse cep = viaCepClient.buscarCep(empresa.getCep());

        if (isBlank(empresa.getLogradouro())) empresa.setLogradouro(cep.logradouro());
        if (isBlank(empresa.getBairro())) empresa.setBairro(cep.bairro());
        if (isBlank(empresa.getCidade())) empresa.setCidade(cep.localidade());
        if (isBlank(empresa.getUf())) empresa.setUf(cep.uf());
        if (isBlank(empresa.getComplemento())) empresa.setComplemento(cep.complemento());
        empresa.setCep(cep.cep());
    }

    private void preencherCoordenadas(Endereco endereco) {
        if (!isBlank(endereco.getLogradouro())
                && !isBlank(endereco.getCidade())
                && !isBlank(endereco.getUf())) {

            CoordenadaDTO coord = nominatimClient.geocodificar(
                    endereco.getLogradouro(),
                    endereco.getNumero(),
                    endereco.getBairro(),
                    endereco.getCidade(),
                    endereco.getUf(),
                    endereco.getCep()
            );

            endereco.setLatitude(coord.latitude());
            endereco.setLongitude(coord.longitude());
        }
    }

    private void preencherCoordenadas(Empresa empresa) {
        if (!isBlank(empresa.getLogradouro())
                && !isBlank(empresa.getCidade())
                && !isBlank(empresa.getUf())) {

            CoordenadaDTO coord = nominatimClient.geocodificar(
                    empresa.getLogradouro(),
                    empresa.getNumero(),
                    empresa.getBairro(),
                    empresa.getCidade(),
                    empresa.getUf(),
                    empresa.getCep()
            );

            empresa.setLatitude(coord.latitude());
            empresa.setLongitude(coord.longitude());
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}