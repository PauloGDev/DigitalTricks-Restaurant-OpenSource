package com.ecommerce.digitaltricks.order.controller;

import com.ecommerce.digitaltricks.order.model.Cupom;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.order.repository.CupomRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/empresas/{empresaId}/cupons")
@CrossOrigin(origins = "*")
public class CupomController {

    private final CupomRepository cupomRepository;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public CupomController(CupomRepository cupomRepository,
                           EmpresaRepository empresaRepository,
                           UsuarioRepository usuarioRepository,
                           UsuarioEmpresaRepository usuarioEmpresaRepository) {
        this.cupomRepository = cupomRepository;
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    private Usuario getUsuario(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }

        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
    }

    private void validarAcessoEmpresa(Long empresaId, Usuario usuario) {
        boolean isAdmin = usuario.getRoles() != null &&
                usuario.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equalsIgnoreCase(r));

        if (isAdmin) {
            return;
        }

        boolean pertence = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaId(usuario.getId(), empresaId)
                .filter(ue -> Boolean.TRUE.equals(ue.getAtivo()))
                .isPresent();

        if (!pertence) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado para esta empresa");
        }
    }

    @GetMapping
    public ResponseEntity<List<Cupom>> listar(@PathVariable Long empresaId,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        validarAcessoEmpresa(empresaId, usuario);

        return ResponseEntity.ok(cupomRepository.findByEmpresaIdOrderByIdDesc(empresaId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cupom> buscar(@PathVariable Long empresaId,
                                        @PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        validarAcessoEmpresa(empresaId, usuario);

        Cupom cupom = cupomRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado"));

        return ResponseEntity.ok(cupom);
    }

    @PostMapping
    public ResponseEntity<Cupom> criar(@PathVariable Long empresaId,
                                       @RequestBody Cupom cupom,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        validarAcessoEmpresa(empresaId, usuario);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Empresa não encontrada"));

        if (cupom.getCodigo() != null) {
            cupom.setCodigo(cupom.getCodigo().trim().toUpperCase());
        }

        if (cupomRepository.existsByEmpresaIdAndCodigoIgnoreCase(empresaId, cupom.getCodigo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um cupom com esse código nesta empresa.");
        }

        cupom.setEmpresa(empresa);

        return ResponseEntity.ok(cupomRepository.save(cupom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cupom> atualizar(@PathVariable Long empresaId,
                                           @PathVariable Long id,
                                           @RequestBody Cupom dto,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        validarAcessoEmpresa(empresaId, usuario);

        Cupom cupom = cupomRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado"));

        String novoCodigo = dto.getCodigo() != null ? dto.getCodigo().trim().toUpperCase() : null;

        if (novoCodigo != null &&
                !novoCodigo.equalsIgnoreCase(cupom.getCodigo()) &&
                cupomRepository.existsByEmpresaIdAndCodigoIgnoreCase(empresaId, novoCodigo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Já existe um cupom com esse código nesta empresa.");
        }

        cupom.setCodigo(novoCodigo);
        cupom.setNome(dto.getNome());
        cupom.setDescricao(dto.getDescricao());
        cupom.setAtivo(dto.isAtivo());
        cupom.setTipoDesconto(dto.getTipoDesconto());
        cupom.setValorDesconto(dto.getValorDesconto());
        cupom.setValorMaximoDesconto(dto.getValorMaximoDesconto());
        cupom.setValorMinimoPedido(dto.getValorMinimoPedido());
        cupom.setLimiteUsoTotal(dto.getLimiteUsoTotal());
        cupom.setLimiteUsoPorUsuario(dto.getLimiteUsoPorUsuario());
        cupom.setDataInicio(dto.getDataInicio());
        cupom.setDataFim(dto.getDataFim());
        cupom.setTipoEntregaPermitida(dto.getTipoEntregaPermitida());
        cupom.setTipoPagamentoPermitido(dto.getTipoPagamentoPermitido());
        cupom.setCumulativo(dto.isCumulativo());

        return ResponseEntity.ok(cupomRepository.save(cupom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long empresaId,
                                        @PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = getUsuario(userDetails);
        validarAcessoEmpresa(empresaId, usuario);

        Cupom cupom = cupomRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cupom não encontrado"));

        cupomRepository.delete(cupom);
        return ResponseEntity.noContent().build();
    }
}