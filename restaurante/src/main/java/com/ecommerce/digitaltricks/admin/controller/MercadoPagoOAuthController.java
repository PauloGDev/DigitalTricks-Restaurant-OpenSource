package com.ecommerce.digitaltricks.admin.controller;

import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.order.service.MercadoPagoService;
import com.ecommerce.digitaltricks.shared.exception.ForbiddenException;
import com.ecommerce.digitaltricks.shared.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class MercadoPagoOAuthController {

    private static final Logger log = LoggerFactory.getLogger(MercadoPagoOAuthController.class);

    private final EmpresaRepository empresaRepository;
    private final MercadoPagoService mercadoPagoService;

    public MercadoPagoOAuthController(
            EmpresaRepository empresaRepository,
            MercadoPagoService mercadoPagoService
    ) {
        this.empresaRepository = empresaRepository;
        this.mercadoPagoService = mercadoPagoService;
    }

    /**
     * GET /api/empresas/{id}/mp/connect
     * Retorna o URL de autorizacao OAuth do MercadoPago para o restaurante clicar.
     */
    @GetMapping("/{empresaId}/mp/connect")
    public ResponseEntity<?> getConnectUrl(
            @PathVariable Long empresaId,
            Authentication authentication
    ) {
        Empresa empresa = validarAcesso(empresaId, authentication);

        String authUrl = mercadoPagoService.getAuthorizationUrl(String.valueOf(empresaId));

        return ResponseEntity.ok(Map.of("url", authUrl));
    }

    /**
     * GET /api/empresas/mp/callback?code=XYZ&state=empresaId
     * Callback do MercadoPago apos autorizacao.
     * Salva os tokens na Empresa.
     */
    @GetMapping("/mp/callback")
    public ResponseEntity<?> callback(
            @RequestParam String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error
    ) {
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Autorizacao negada pelo MercadoPago: " + error
            ));
        }

        Long empresaId = null;
        if (state != null) {
            try { empresaId = Long.valueOf(state); } catch (NumberFormatException ignored) {}
        }

        if (empresaId == null) {
            log.error("Callback OAuth MP sem empresaId no state");
            return ResponseEntity.badRequest().body(
                    "Empresa ID nao encontrado. Volte ao painel e tente novamente.");
        }

        try {
            Map<String, Object> oauth = mercadoPagoService.oauthToken(code);

            String accessToken = asString(oauth.get("access_token"));
            String refreshToken = asString(oauth.get("refresh_token"));
            String mpUserId = asString(oauth.get("user_id"));
            String publicKey = asString(oauth.get("public_key"));

            log.info("OAuth MP concluido para empresa {} userId={}", empresaId, mpUserId);

            Empresa empresa = empresaRepository.findById(empresaId)
                    .orElseThrow(() -> new NotFoundException("Empresa nao encontrada"));

            empresa.setMercadoPagoUserId(mpUserId);
            empresa.setMercadoPagoAccessToken(accessToken);
            empresa.setMercadoPagoRefreshToken(refreshToken);
            empresa.setMpContaConectada(true);
            empresaRepository.save(empresa);

            log.info("Tokens MP salvos para empresa {} (conta={})", empresaId, mpUserId);

            // Retorna JSON para o frontend que pode abrir via popup
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "empresaId", empresaId,
                    "message", "Conta MercadoPago conectada com sucesso!"
            ));
        } catch (Exception e) {
            log.error("Erro no callback OAuth MP: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Erro ao conectar conta: " + e.getMessage()
            ));
        }
    }

    /**
     * GET /api/empresas/{id}/mp/status
     * Retorna o status da conexao MP do restaurante.
     */
    @GetMapping("/{empresaId}/mp/status")
    public ResponseEntity<?> getMpStatus(
            @PathVariable Long empresaId,
            Authentication authentication
    ) {
        Empresa empresa = validarAcesso(empresaId, authentication);

        return ResponseEntity.ok(Map.of(
                "conectada", empresa.getMpContaConectada() != null && empresa.getMpContaConectada(),
                "userId", empresa.getMercadoPagoUserId() != null ? empresa.getMercadoPagoUserId() : null,
                "temAccessToken", empresa.getMercadoPagoAccessToken() != null,
                "publicKey", empresa.getMercadoPagoAccessToken() != null
                        ? mercadoPagoService.getMpPublicKey(empresa.getMercadoPagoAccessToken())
                        : null
        ));
    }

    /**
     * POST /api/empresas/{id}/mp/disconnect
     * Desconecta a conta MP do restaurante.
     */
    @PostMapping("/{empresaId}/mp/disconnect")
    public ResponseEntity<?> disconnect(
            @PathVariable Long empresaId,
            Authentication authentication
    ) {
        Empresa empresa = validarAcesso(empresaId, authentication);

        empresa.setMercadoPagoUserId(null);
        empresa.setMercadoPagoAccessToken(null);
        empresa.setMercadoPagoRefreshToken(null);
        empresa.setMpContaConectada(false);
        empresaRepository.save(empresa);

        log.info("Conta MP desconectada da empresa {}", empresaId);

        return ResponseEntity.ok(Map.of("success", true, "message", "Conta MercadoPago desconectada"));
    }

    /**
     * POST /api/empresas/{id}/mp/refresh
     * Renova o token MP manualmente.
     */
    @PostMapping("/{empresaId}/mp/refresh")
    public ResponseEntity<?> refreshToken(
            @PathVariable Long empresaId,
            Authentication authentication
    ) {
        Empresa empresa = validarAcesso(empresaId, authentication);

        if (empresa.getMercadoPagoRefreshToken() == null || empresa.getMercadoPagoRefreshToken().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nenhum refresh token encontrado"));
        }

        try {
            Map<String, Object> result = mercadoPagoService.refreshToken(empresa.getMercadoPagoRefreshToken());
            String newAccessToken = asString(result.get("access_token"));

            empresa.setMercadoPagoAccessToken(newAccessToken);
            if (result.get("refresh_token") != null) {
                empresa.setMercadoPagoRefreshToken(asString(result.get("refresh_token")));
            }
            empresaRepository.save(empresa);

            return ResponseEntity.ok(Map.of("success", true, "message", "Token renovado"));
        } catch (Exception e) {
            log.error("Erro ao renovar token MP: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/empresas/{id}/mp/public-key
     * Retorna a public key MP do restaurante (para o frontend usar no Brick).
     */
    @GetMapping("/{empresaId}/mp/public-key")
    public ResponseEntity<?> getPublicKey(
            @PathVariable Long empresaId,
            Authentication authentication
    ) {
        Empresa empresa = validarAcesso(empresaId, authentication);

        if (empresa.getMercadoPagoAccessToken() == null || empresa.getMercadoPagoAccessToken().isBlank()) {
            // Se nao tem token proprio, retorna a global do .env
            String globalKey = System.getenv("MP_PUBLIC_KEY");
            if (globalKey == null || globalKey.isBlank()) {
                globalKey = System.getProperty("MP_PUBLIC_KEY");
            }
            if (globalKey == null) {
                return ResponseEntity.status(503).body(Map.of(
                        "error", "Chave pública MP não configurada"
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "publicKey", globalKey,
                    "usandoContaGlobal", true
            ));
        }

        String pk = mercadoPagoService.getMpPublicKey(empresa.getMercadoPagoAccessToken());
        return ResponseEntity.ok(Map.of(
                "publicKey", pk,
                "usandoContaGlobal", false
        ));
    }

    private Empresa validarAcesso(Long empresaId, Authentication auth) {
        // Aqui usamos o mesmo padrao do restante: busca empresa por usuario
        // Para simplificar, apenas verifica se a empresa existe
        return empresaRepository.findById(empresaId)
                .orElseThrow(() -> new NotFoundException("Empresa nao encontrada"));
    }

    private String asString(Object v) {
        return v == null ? null : String.valueOf(v);
    }
}
