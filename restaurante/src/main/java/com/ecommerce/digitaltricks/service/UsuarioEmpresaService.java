package com.ecommerce.digitaltricks.service;

import com.ecommerce.digitaltricks.dto.empresa.UsuarioEmpresaResponseDTO;
import com.ecommerce.digitaltricks.enums.usuarios.StatusUsuario;
import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.repository.UsuarioEmpresaRepository;
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