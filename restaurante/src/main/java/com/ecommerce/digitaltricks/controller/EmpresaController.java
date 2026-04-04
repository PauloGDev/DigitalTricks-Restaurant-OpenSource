package com.ecommerce.digitaltricks.controller;

import com.ecommerce.digitaltricks.dto.analytics.AnalyticsDTO;
import com.ecommerce.digitaltricks.dto.empresa.*;
import com.ecommerce.digitaltricks.service.AnalyticsService;
import com.ecommerce.digitaltricks.service.ClienteEmpresaService;
import com.ecommerce.digitaltricks.service.EmpresaService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@CrossOrigin(origins = "*")
public class EmpresaController {

    private final EmpresaService empresaService;
    private final ClienteEmpresaService clienteEmpresaService;
    private final AnalyticsService analyticsService;

    public EmpresaController(EmpresaService empresaService,
                             ClienteEmpresaService clienteEmpresaService,
                             AnalyticsService analyticsService) {
        this.empresaService = empresaService;
        this.clienteEmpresaService = clienteEmpresaService;
        this.analyticsService = analyticsService;
    }

    @PostMapping
    public EmpresaDTO criar(@Valid @RequestBody CriarEmpresaRequest request, Authentication authentication) {
        String username = authentication.getName();
        return empresaService.criarEmpresa(request, username);
    }

    @GetMapping("/minhas")
    public List<EmpresaDTO> listarMinhas(Authentication authentication) {
        String username = authentication.getName();
        return empresaService.listarMinhasEmpresas(username);
    }

    @GetMapping("/{id}")
    public EmpresaDTO buscarPorId(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        return empresaService.buscarEmpresaDoUsuario(id, username);
    }

    @PutMapping("/{id}")
    public EmpresaDTO atualizar(@PathVariable Long id,
                                @Valid @RequestBody AtualizarEmpresaRequest request,
                                Authentication authentication) {
        String username = authentication.getName();
        return empresaService.atualizarEmpresa(id, request, username);
    }

    @PostMapping("/{id}/usuarios")
    public UsuarioEmpresaDTO adicionarUsuario(@PathVariable Long id,
                                              @Valid @RequestBody AdicionarUsuarioEmpresaRequest request,
                                              Authentication authentication) {
        String username = authentication.getName();
        return empresaService.adicionarUsuarioNaEmpresa(id, request, username);
    }

    @GetMapping("/{id}/usuarios")
    public List<UsuarioEmpresaDTO> listarUsuarios(@PathVariable Long id,
                                                  Authentication authentication) {
        String username = authentication.getName();
        return empresaService.listarUsuariosDaEmpresa(id, username);
    }

    @GetMapping("/{id}/clientes")
    public List<ClienteEmpresaDTO> listarClientes(@PathVariable Long id,
                                                  Authentication authentication) {
        String username = authentication.getName();

        // garante que o usuário só acesse clientes da própria empresa
        empresaService.buscarEmpresaDoUsuario(id, username);

        return clienteEmpresaService.listarClientesDaEmpresa(id);
    }

    @PostMapping("/{id}/logo")
    public EmpresaDTO uploadLogo(@PathVariable Long id,
                                 @RequestParam("file") MultipartFile file,
                                 Authentication authentication) {
        String username = authentication.getName();
        return empresaService.uploadLogo(id, file, username);
    }

    @GetMapping("/{id}/analytics")
    public AnalyticsDTO analytics(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        return analyticsService.buscarAnalyticsEmpresa(id, username);
    }
}