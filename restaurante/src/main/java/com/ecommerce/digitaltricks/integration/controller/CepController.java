package com.ecommerce.digitaltricks.integration.controller;

import com.ecommerce.digitaltricks.integration.ViaCepClient;
import com.ecommerce.digitaltricks.integration.dto.ViaCepResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cep")
@CrossOrigin(origins = "*")
public class CepController {

    private final ViaCepClient viaCepClient;

    public CepController(ViaCepClient viaCepClient) {
        this.viaCepClient = viaCepClient;
    }

    @GetMapping("/{cep}")
    public ViaCepResponse buscar(@PathVariable String cep) {
        return viaCepClient.buscarCep(cep);
    }
}