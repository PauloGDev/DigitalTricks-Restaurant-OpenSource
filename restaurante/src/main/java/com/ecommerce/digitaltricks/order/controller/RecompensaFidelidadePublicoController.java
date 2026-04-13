package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResgateResponseDTO;
import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.service.RecompensaFidelidadeService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurantes/{empresaId}/recompensas-fidelidade")
public class RecompensaFidelidadePublicoController {

    private final RecompensaFidelidadeService recompensaService;

    public RecompensaFidelidadePublicoController(RecompensaFidelidadeService recompensaService) {
        this.recompensaService = recompensaService;
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<RecompensaFidelidadeResponseDTO>> listarDisponiveis(
            @PathVariable Long empresaId) {
        List<RecompensaFidelidadeResponseDTO> recompensas = recompensaService.listarDisponiveisPorEmpresa(empresaId);
        return ResponseEntity.ok(recompensas);
    }

    @GetMapping("/disponiveis/{pontosCliente}")
    public ResponseEntity<List<RecompensaFidelidadeResponseDTO>> listarDisponiveisPorPontos(
            @PathVariable Long empresaId,
            @PathVariable Integer pontosCliente) {
        List<RecompensaFidelidadeResponseDTO> recompensas = recompensaService.listarDisponiveisPorPontos(empresaId, pontosCliente);
        return ResponseEntity.ok(recompensas);
    }

    @PatchMapping("/{recompensaId}/resgatar")
    public ResponseEntity<RecompensaFidelidadeResgateResponseDTO> resgatar(
            @PathVariable Long empresaId,
            @PathVariable Long recompensaId,
            Authentication authentication) {
        RecompensaFidelidadeResgateResponseDTO response = recompensaService.resgatarParaCliente(
                empresaId,
                recompensaId,
                authentication.getName()
        );
        return ResponseEntity.ok(response);
    }
}
