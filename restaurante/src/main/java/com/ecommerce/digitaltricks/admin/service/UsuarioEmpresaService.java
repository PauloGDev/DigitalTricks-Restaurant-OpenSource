package com.ecommerce.digitaltricks.admin.service;

import com.ecommerce.digitaltricks.admin.dto.UsuarioEmpresaResponseDTO;
import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioEmpresaService {

    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    public UsuarioEmpresaService(UsuarioEmpresaRepository usuarioEmpresaRepository) {
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    public Page<UsuarioEmpresaResponseDTO> listarEquipeEmpresa(
            Long empresaId,
            StatusUsuario status,
            Pageable pageable
    ) {
        List<PapelEmpresa> papeisPermitidos = List.of(
                PapelEmpresa.DONO,
                PapelEmpresa.GERENTE,
                PapelEmpresa.ATENDENTE
        );

        Page<UsuarioEmpresa> page = (status == null)
                ? usuarioEmpresaRepository.findByEmpresaIdAndAtivoTrueAndPapelIn(
                empresaId, papeisPermitidos, pageable
        )
                : usuarioEmpresaRepository.findByEmpresaIdAndAtivoTrueAndPapelInAndUsuarioStatus(
                empresaId, papeisPermitidos, status, pageable
        );

        return page.map(this::toDTO);
    }

    private UsuarioEmpresaResponseDTO toDTO(UsuarioEmpresa ue) {
        Usuario u = ue.getUsuario();

        return new UsuarioEmpresaResponseDTO(
                u.getId(),
                ue.getId(),
                u.getUsername(),
                u.getNome(),
                u.getEmail(),
                u.getStatus(),
                u.getRoles(),
                ue.getPapel()
        );
    }
}