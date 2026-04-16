package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.admin.dto.NivelFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.service.NivelFidelidadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/restaurantes/{empresaId}/niveis-fidelidade")
public class NivelFidelidadePublicoController {

    private final NivelFidelidadeService nivelFidelidadeService;

    public NivelFidelidadePublicoController(NivelFidelidadeService nivelFidelidadeService) {
        this.nivelFidelidadeService = nivelFidelidadeService;
    }

    @GetMapping
    public ResponseEntity<List<NivelFidelidadeResponseDTO>> listar(@PathVariable Long empresaId) {
        return ResponseEntity.ok(nivelFidelidadeService.listarPorEmpresa(empresaId));
    }
}
