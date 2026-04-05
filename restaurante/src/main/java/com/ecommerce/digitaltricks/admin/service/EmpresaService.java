package com.ecommerce.digitaltricks.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.digitaltricks.dto.empresa.*;
import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import com.ecommerce.digitaltricks.shared.exception.BadRequestException;
import com.ecommerce.digitaltricks.shared.exception.ForbiddenException;
import com.ecommerce.digitaltricks.shared.exception.NotFoundException;
import com.ecommerce.digitaltricks.model.Empresa;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EmpresaService {

    private static final Set<String> CONTENT_TYPES_PERMITIDOS = Set.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp"
    );

    private static final long TAMANHO_MAXIMO_LOGO = 5 * 1024 * 1024;

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;

    @Autowired
    private Cloudinary cloudinary;

    public EmpresaService(EmpresaRepository empresaRepository,
                          UsuarioRepository usuarioRepository,
                          UsuarioEmpresaRepository usuarioEmpresaRepository) {
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
    }

    @Transactional
    public EmpresaDTO criarEmpresa(CriarEmpresaRequest request, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        String cnpjNormalizado = normalizarDocumento(request.cnpj());

        if (cnpjNormalizado == null || cnpjNormalizado.isBlank()) {
            throw new BadRequestException("CNPJ é obrigatório");
        }

        if (empresaRepository.existsByCnpj(cnpjNormalizado)) {
            throw new BadRequestException("Já existe uma empresa cadastrada com este CNPJ");
        }

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(request.nomeFantasia());
        empresa.setRazaoSocial(request.razaoSocial());
        empresa.setCnpj(cnpjNormalizado);
        empresa.setEmail(request.email());
        empresa.setTelefone(request.telefone());

        empresa.setCep(request.cep());
        empresa.setLogradouro(request.logradouro());
        empresa.setNumero(request.numero());
        empresa.setBairro(request.bairro());
        empresa.setCidade(request.cidade());
        empresa.setComplemento(request.complemento());
        empresa.setUf(request.uf());
        empresa.setLatitude(request.latitude());
        empresa.setLongitude(request.longitude());

        empresa.setAceitaRetirada(request.aceitaRetirada() != null ? request.aceitaRetirada() : true);
        empresa.setAceitaDelivery(request.aceitaDelivery() != null ? request.aceitaDelivery() : true);
        empresa.setRaioEntregaKm(request.raioEntregaKm());
        empresa.setTaxaEntregaFixa(request.taxaEntregaFixa());
        empresa.setValorPorKm(request.valorPorKm());
        empresa.setPedidoMinimoDelivery(request.pedidoMinimoDelivery());
        empresa.setValorFreteGratis(request.valorFreteGratis());

        String slugBase = gerarSlug(request.nomeFantasia());
        empresa.setSlug(gerarSlugUnico(slugBase, null));

        Empresa empresaSalva = empresaRepository.save(empresa);

        UsuarioEmpresa vinculo = new UsuarioEmpresa();
        vinculo.setUsuario(usuario);
        vinculo.setEmpresa(empresaSalva);
        vinculo.setPapel(PapelEmpresa.DONO);
        vinculo.setAtivo(true);

        usuarioEmpresaRepository.save(vinculo);

        return toDTO(empresaSalva);
    }

    @Transactional
    public UsuarioEmpresaDTO adicionarUsuarioNaEmpresa(Long empresaId,
                                                       AdicionarUsuarioEmpresaRequest request,
                                                       String usernameLogado) {
        Usuario usuarioLogado = usuarioRepository.findByUsername(usernameLogado)
                .orElseThrow(() -> new NotFoundException("Usuário logado não encontrado"));

        UsuarioEmpresa vinculoLogado = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuarioLogado.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        if (vinculoLogado.getPapel() != PapelEmpresa.DONO) {
            throw new ForbiddenException("Somente o DONO pode adicionar usuários à empresa");
        }

        if (request.papel() != PapelEmpresa.GERENTE && request.papel() != PapelEmpresa.ATENDENTE) {
            throw new BadRequestException("Só é permitido adicionar usuários como GERENTE ou ATENDENTE");
        }

        Usuario usuario = usuarioRepository.findById(request.usuarioId())
                .orElseThrow(() -> new NotFoundException("Usuário a ser vinculado não encontrado"));

        if (usuarioEmpresaRepository.existsByUsuarioIdAndEmpresaId(usuario.getId(), empresaId)) {
            throw new BadRequestException("Usuário já está vinculado a esta empresa");
        }

        UsuarioEmpresa novoVinculo = new UsuarioEmpresa();
        novoVinculo.setUsuario(usuario);
        novoVinculo.setEmpresa(vinculoLogado.getEmpresa());
        novoVinculo.setPapel(request.papel());
        novoVinculo.setAtivo(true);

        UsuarioEmpresa salvo = usuarioEmpresaRepository.save(novoVinculo);

        return toUsuarioEmpresaDTO(salvo);
    }

    public List<EmpresaDTO> listarMinhasEmpresas(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        return usuarioEmpresaRepository.findByUsuarioIdAndAtivoTrue(usuario.getId())
                .stream()
                .map(UsuarioEmpresa::getEmpresa)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public EmpresaDTO buscarEmpresaDoUsuario(Long empresaId, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        UsuarioEmpresa vinculo = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuario.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        return toDTO(vinculo.getEmpresa());
    }

    @Transactional
    public EmpresaDTO atualizarEmpresa(Long empresaId, AtualizarEmpresaRequest request, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        UsuarioEmpresa vinculo = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuario.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        if (vinculo.getPapel() != PapelEmpresa.DONO) {
            throw new ForbiddenException("Somente o DONO pode atualizar os dados da empresa");
        }

        Empresa empresa = vinculo.getEmpresa();

        String novoCnpj = normalizarDocumento(request.cnpj());
        if (novoCnpj == null || novoCnpj.isBlank()) {
            throw new BadRequestException("CNPJ é obrigatório");
        }

        if (!empresa.getCnpj().equals(novoCnpj) && empresaRepository.existsByCnpj(novoCnpj)) {
            throw new BadRequestException("Já existe outra empresa cadastrada com este CNPJ");
        }

        String slugFinal;
        if (request.slug() != null && !request.slug().isBlank()) {
            slugFinal = gerarSlug(request.slug());
        } else if (request.nomeFantasia() != null && !request.nomeFantasia().isBlank()) {
            slugFinal = gerarSlug(request.nomeFantasia());
        } else {
            slugFinal = empresa.getSlug();
        }

        if (!slugFinal.equalsIgnoreCase(empresa.getSlug())) {
            slugFinal = gerarSlugUnico(slugFinal, empresa.getId());
        }

        if (request.horariosFuncionamento() != null) {
            try {
                String json = new ObjectMapper().writeValueAsString(request.horariosFuncionamento());
                empresa.setHorariosFuncionamento(json);
            } catch (Exception e) {
                throw new BadRequestException("Erro ao salvar horários");
            }
        }

        empresa.setNomeFantasia(request.nomeFantasia());
        empresa.setRazaoSocial(request.razaoSocial());
        empresa.setCnpj(novoCnpj);
        empresa.setSlug(slugFinal);
        empresa.setEmail(request.email());
        empresa.setTelefone(request.telefone());
        empresa.setCep(request.cep());
        empresa.setLogradouro(request.logradouro());
        empresa.setNumero(request.numero());
        empresa.setBairro(request.bairro());
        empresa.setCidade(request.cidade());
        empresa.setComplemento(request.complemento());
        empresa.setUf(request.uf());

        empresa.setLogoUrl(request.logoUrl());
        empresa.setCategoriaPreview(request.categoriaPreview());

        empresa.setAceitaRetirada(request.aceitaRetirada() != null ? request.aceitaRetirada() : empresa.getAceitaRetirada());
        empresa.setAceitaDelivery(request.aceitaDelivery() != null ? request.aceitaDelivery() : empresa.getAceitaDelivery());
        empresa.setRaioEntregaKm(request.raioEntregaKm());
        empresa.setTaxaEntregaFixa(request.taxaEntregaFixa());
        empresa.setValorPorKm(request.valorPorKm());
        empresa.setPedidoMinimoDelivery(request.pedidoMinimoDelivery());
        empresa.setValorFreteGratis(request.valorFreteGratis());

        Empresa salva = empresaRepository.save(empresa);
        return toDTO(salva);
    }

    @Transactional
    public UsuarioEmpresaDTO atualizarUsuarioDaEmpresa(Long empresaId,
                                                       Long usuarioEmpresaId,
                                                       AtualizarUsuarioEmpresaRequest request,
                                                       String usernameLogado) {
        Usuario usuarioLogado = usuarioRepository.findByUsername(usernameLogado)
                .orElseThrow(() -> new NotFoundException("Usuário logado não encontrado"));

        UsuarioEmpresa vinculoLogado = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuarioLogado.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        if (vinculoLogado.getPapel() != PapelEmpresa.DONO) {
            throw new ForbiddenException("Somente o DONO pode atualizar usuários da empresa");
        }

        UsuarioEmpresa vinculoAlvo = usuarioEmpresaRepository.findById(usuarioEmpresaId)
                .orElseThrow(() -> new NotFoundException("Vínculo do usuário não encontrado"));

        if (!vinculoAlvo.getEmpresa().getId().equals(empresaId)) {
            throw new BadRequestException("Usuário não pertence a esta empresa");
        }

        if (request.papel() != null) {
            if (request.papel() != PapelEmpresa.DONO
                    && request.papel() != PapelEmpresa.GERENTE
                    && request.papel() != PapelEmpresa.ATENDENTE) {
                throw new BadRequestException("Papel inválido para a equipe");
            }
            vinculoAlvo.setPapel(request.papel());
        }

        if (request.ativo() != null) {
            vinculoAlvo.setAtivo(request.ativo());
        }

        UsuarioEmpresa salvo = usuarioEmpresaRepository.save(vinculoAlvo);
        return toUsuarioEmpresaDTO(salvo);
    }

    @Transactional
    public void removerUsuarioDaEmpresa(Long empresaId,
                                        Long usuarioEmpresaId,
                                        String usernameLogado) {
        Usuario usuarioLogado = usuarioRepository.findByUsername(usernameLogado)
                .orElseThrow(() -> new NotFoundException("Usuário logado não encontrado"));

        UsuarioEmpresa vinculoLogado = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuarioLogado.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Você não tem acesso a esta empresa"));

        if (vinculoLogado.getPapel() != PapelEmpresa.DONO) {
            throw new ForbiddenException("Somente o DONO pode remover usuários da empresa");
        }

        UsuarioEmpresa vinculoAlvo = usuarioEmpresaRepository.findById(usuarioEmpresaId)
                .orElseThrow(() -> new NotFoundException("Vínculo do usuário não encontrado"));

        if (!vinculoAlvo.getEmpresa().getId().equals(empresaId)) {
            throw new BadRequestException("Usuário não pertence a esta empresa");
        }

        if (vinculoAlvo.getPapel() == PapelEmpresa.DONO) {
            throw new BadRequestException("Não é permitido remover o DONO da empresa");
        }

        vinculoAlvo.setAtivo(false);
        usuarioEmpresaRepository.save(vinculoAlvo);
    }

    public List<UsuarioEmpresaDTO> listarUsuariosDaEmpresa(Long empresaId, String usernameLogado) {
        Usuario usuarioLogado = usuarioRepository.findByUsername(usernameLogado)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        boolean possuiAcesso = usuarioEmpresaRepository
                .existsByUsuarioIdAndEmpresaIdAndAtivoTrue(usuarioLogado.getId(), empresaId);

        if (!possuiAcesso) {
            throw new ForbiddenException("Você não tem acesso a esta empresa");
        }

        return usuarioEmpresaRepository.findByEmpresaIdAndAtivoTrue(empresaId)
                .stream()
                .filter(v -> v.getPapel() == PapelEmpresa.DONO
                        || v.getPapel() == PapelEmpresa.GERENTE
                        || v.getPapel() == PapelEmpresa.ATENDENTE)
                .map(this::toUsuarioEmpresaDTO)
                .collect(Collectors.toList());
    }

    public EmpresaDTO uploadLogo(Long empresaId, MultipartFile file, String username) {
        validarArquivoLogo(file);

        Empresa empresa = buscarEmpresaEntity(empresaId, username);

        try {
            var upload = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "empresas/logos")
            );

            String url = upload.get("secure_url").toString();

            empresa.setLogoUrl(url);

            Empresa salva = empresaRepository.save(empresa);
            return toDTO(salva);

        } catch (Exception e) {
            throw new BadRequestException("Erro ao fazer upload da logo");
        }
    }

    public EmpresaDTO toDTO(Empresa empresa) {
        return new EmpresaDTO(
                empresa.getId(),
                empresa.getNomeFantasia(),
                empresa.getRazaoSocial(),
                empresa.getCnpj(),
                empresa.getEmail(),
                empresa.getTelefone(),
                empresa.getStatus(),
                empresa.getMpContaConectada(),
                empresa.getLogoUrl(),
                empresa.getCategoriaPreview(),
                empresa.getHorariosFuncionamento(),
                empresa.getCep(),
                empresa.getLogradouro(),
                empresa.getNumero(),
                empresa.getBairro(),
                empresa.getCidade(),
                empresa.getComplemento(),
                empresa.getUf(),
                empresa.getAceitaRetirada(),
                empresa.getAceitaDelivery(),
                empresa.getRaioEntregaKm(),
                empresa.getTaxaEntregaFixa(),
                empresa.getValorPorKm(),
                empresa.getPedidoMinimoDelivery(),
                empresa.getValorFreteGratis(),
                empresa.isAbertoAgora()
        );
    }

    public UsuarioEmpresaDTO toUsuarioEmpresaDTO(UsuarioEmpresa usuarioEmpresa) {
        return new UsuarioEmpresaDTO(
                usuarioEmpresa.getId(),
                usuarioEmpresa.getUsuario().getId(),
                usuarioEmpresa.getUsuario().getUsername(),
                usuarioEmpresa.getUsuario().getNome(),
                usuarioEmpresa.getUsuario().getEmail(),
                usuarioEmpresa.getEmpresa().getId(),
                usuarioEmpresa.getEmpresa().getNomeFantasia(),
                usuarioEmpresa.getPapel(),
                usuarioEmpresa.getAtivo()
        );
    }

    private String normalizarDocumento(String valor) {
        if (valor == null) {
            return null;
        }
        return valor.replaceAll("\\D", "");
    }

    private void validarArquivoLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Arquivo da logo é obrigatório");
        }

        if (file.getContentType() == null || !CONTENT_TYPES_PERMITIDOS.contains(file.getContentType())) {
            throw new BadRequestException("Formato de imagem não permitido");
        }

        if (file.getSize() > TAMANHO_MAXIMO_LOGO) {
            throw new BadRequestException("A logo deve ter no máximo 5MB");
        }
    }

    public Empresa buscarEmpresaEntity(Long empresaId, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        UsuarioEmpresa vinculo = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaIdAndAtivoTrue(usuario.getId(), empresaId)
                .orElseThrow(() -> new ForbiddenException("Acesso negado"));

        return vinculo.getEmpresa();
    }

    private String gerarSlug(String valor) {
        if (valor == null || valor.isBlank()) {
            throw new BadRequestException("Slug inválido");
        }

        String normalizado = Normalizer.normalize(valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        String slug = normalizado.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        if (slug.isBlank()) {
            throw new BadRequestException("Slug inválido");
        }

        return slug;
    }

    private String gerarSlugUnico(String baseSlug, Long empresaAtualId) {
        String slug = baseSlug;
        int contador = 2;

        while (true) {
            var existente = empresaRepository.findBySlugIgnoreCase(slug);

            if (existente.isEmpty()) {
                return slug;
            }

            if (empresaAtualId != null && existente.get().getId().equals(empresaAtualId)) {
                return slug;
            }

            slug = baseSlug + "-" + contador;
            contador++;
        }
    }
}