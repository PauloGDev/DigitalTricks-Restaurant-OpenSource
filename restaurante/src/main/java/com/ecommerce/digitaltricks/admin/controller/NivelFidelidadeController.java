package com.ecommerce.digitaltricks.admin.controller;

import com.ecommerce.digitaltricks.admin.dto.NivelFidelidadeRequestDTO;
import com.ecommerce.digitaltricks.admin.dto.NivelFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.service.NivelFidelidadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/empresas/{empresaId}/niveis-fidelidade")
public class NivelFidelidadeController {

    private final NivelFidelidadeService nivelFidelidadeService;

    public NivelFidelidadeController(NivelFidelidadeService nivelFidelidadeService) {
        this.nivelFidelidadeService = nivelFidelidadeService;
    }

    @GetMapping
    public ResponseEntity<List<NivelFidelidadeResponseDTO>> listar(@PathVariable Long empresaId) {
        return ResponseEntity.ok(nivelFidelidadeService.listarPorEmpresa(empresaId));
    }

    @PutMapping
    public ResponseEntity<List<NivelFidelidadeResponseDTO>> salvar(
            @PathVariable Long empresaId,
            @RequestBody List<NivelFidelidadeRequestDTO> request
    ) {
        return ResponseEntity.ok(nivelFidelidadeService.salvarTodos(empresaId, request));
    }
}
