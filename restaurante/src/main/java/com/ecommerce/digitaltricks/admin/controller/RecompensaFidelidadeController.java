package com.ecommerce.digitaltricks.admin.controller;

import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeRequestDTO;
import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.service.RecompensaFidelidadeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/empresas/{empresaId}/recompensas-fidelidade")
public class RecompensaFidelidadeController {

    private final RecompensaFidelidadeService recompensaService;

    public RecompensaFidelidadeController(RecompensaFidelidadeService recompensaService) {
        this.recompensaService = recompensaService;
    }

    @GetMapping
    public ResponseEntity<List<RecompensaFidelidadeResponseDTO>> listar(
            @PathVariable Long empresaId) {
        List<RecompensaFidelidadeResponseDTO> recompensas = recompensaService.listarPorEmpresa(empresaId);
        return ResponseEntity.ok(recompensas);
    }

    @GetMapping("/{recompensaId}")
    public ResponseEntity<RecompensaFidelidadeResponseDTO> buscar(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId) {
        RecompensaFidelidadeResponseDTO recompensa = recompensaService.buscarPorId(empresaId, recompensaId);
        return ResponseEntity.ok(recompensa);
    }

    @PostMapping
    public ResponseEntity<RecompensaFidelidadeResponseDTO> criar(
            @PathVariable Long empresaId,
            @Valid @RequestBody RecompensaFidelidadeRequestDTO request) {
        RecompensaFidelidadeResponseDTO recompensa = recompensaService.criar(empresaId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(recompensa);
    }

    @PutMapping("/{recompensaId}")
    public ResponseEntity<RecompensaFidelidadeResponseDTO> atualizar(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId,
            @Valid @RequestBody RecompensaFidelidadeRequestDTO request) {
        RecompensaFidelidadeResponseDTO recompensa = recompensaService.atualizar(empresaId, recompensaId, request);
        return ResponseEntity.ok(recompensa);
    }

    @DeleteMapping("/{recompensaId}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId) {
        recompensaService.deletar(empresaId, recompensaId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{recompensaId}/status")
    public ResponseEntity<RecompensaFidelidadeResponseDTO> alterarStatus(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId,
            @RequestBody Map<String, Boolean> request) {
        Boolean ativo = request.get("ativo");
        if (ativo == null) {
            return ResponseEntity.badRequest().build();
        }
        RecompensaFidelidadeResponseDTO recompensa = recompensaService.alterarStatus(empresaId, recompensaId, ativo);
        return ResponseEntity.ok(recompensa);
    }

    @PatchMapping("/{recompensaId}/registrar-uso")
    public ResponseEntity<RecompensaFidelidadeResponseDTO> registrarUso(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId) {
        RecompensaFidelidadeResponseDTO recompensa = recompensaService.registrarUso(empresaId, recompensaId);
        return ResponseEntity.ok(recompensa);
    }
}