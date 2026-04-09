package com.ecommerce.digitaltricks.admin.service;

import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeRequestDTO;
import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.RecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.RecompensaFidelidadeRepository;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecompensaFidelidadeService {

    private final RecompensaFidelidadeRepository recompensaRepository;
    private final EmpresaRepository empresaRepository;
    private final ProdutoRepository produtoRepository;

    public RecompensaFidelidadeService(
            RecompensaFidelidadeRepository recompensaRepository,
            EmpresaRepository empresaRepository,
            ProdutoRepository produtoRepository) {
        this.recompensaRepository = recompensaRepository;
        this.empresaRepository = empresaRepository;
        this.produtoRepository = produtoRepository;
    }

    public List<RecompensaFidelidadeResponseDTO> listarPorEmpresa(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        return recompensaRepository.findByEmpresaOrderByValorPontosAsc(empresa)
                .stream()
                .map(RecompensaFidelidadeResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RecompensaFidelidadeResponseDTO> listarDisponiveisPorEmpresa(Long empresaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        return recompensaRepository.findDisponiveis(empresa, LocalDateTime.now())
                .stream()
                .map(RecompensaFidelidadeResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<RecompensaFidelidadeResponseDTO> listarDisponiveisPorPontos(Long empresaId, Integer pontosCliente) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        return recompensaRepository.findDisponiveisPorPontos(empresa, pontosCliente, LocalDateTime.now())
                .stream()
                .map(RecompensaFidelidadeResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public RecompensaFidelidadeResponseDTO buscarPorId(Long empresaId, Long recompensaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        return RecompensaFidelidadeResponseDTO.fromEntity(recompensa);
    }

    @Transactional
    public RecompensaFidelidadeResponseDTO criar(Long empresaId, RecompensaFidelidadeRequestDTO request) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        validarRequest(request);

        RecompensaFidelidade recompensa = new RecompensaFidelidade();
        recompensa.setEmpresa(empresa);
        recompensa.setNome(request.getNome());
        recompensa.setDescricao(request.getDescricao());
        recompensa.setTipo(request.getTipo());
        recompensa.setValorPontos(request.getValorPontos());
        recompensa.setDescontoPercentual(request.getDescontoPercentual());
        recompensa.setDescontoValorFixo(request.getDescontoValorFixo());
        recompensa.setProdutoId(request.getProdutoId());
        recompensa.setImagemUrl(request.getImagemUrl());
        recompensa.setAtivo(request.getAtivo());
        recompensa.setEstoque(request.getEstoque());
        recompensa.setEstoqueUtilizado(0);
        recompensa.setDataInicio(request.getDataInicio());
        recompensa.setDataFim(request.getDataFim());
        recompensa.setCriadoEm(LocalDateTime.now());
        recompensa.setAtualizadoEm(LocalDateTime.now());

        RecompensaFidelidade saved = recompensaRepository.save(recompensa);
        return RecompensaFidelidadeResponseDTO.fromEntity(saved);
    }

    @Transactional
    public RecompensaFidelidadeResponseDTO atualizar(Long empresaId, Long recompensaId, RecompensaFidelidadeRequestDTO request) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        validarRequest(request);

        recompensa.setNome(request.getNome());
        recompensa.setDescricao(request.getDescricao());
        recompensa.setTipo(request.getTipo());
        recompensa.setValorPontos(request.getValorPontos());
        recompensa.setDescontoPercentual(request.getDescontoPercentual());
        recompensa.setDescontoValorFixo(request.getDescontoValorFixo());
        recompensa.setProdutoId(request.getProdutoId());
        recompensa.setImagemUrl(request.getImagemUrl());
        recompensa.setAtivo(request.getAtivo());
        recompensa.setEstoque(request.getEstoque());
        recompensa.setDataInicio(request.getDataInicio());
        recompensa.setDataFim(request.getDataFim());
        recompensa.setAtualizadoEm(LocalDateTime.now());

        RecompensaFidelidade saved = recompensaRepository.save(recompensa);
        return RecompensaFidelidadeResponseDTO.fromEntity(saved);
    }

    @Transactional
    public void deletar(Long empresaId, Long recompensaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        recompensaRepository.delete(recompensa);
    }

    @Transactional
    public RecompensaFidelidadeResponseDTO alterarStatus(Long empresaId, Long recompensaId, Boolean ativo) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        recompensa.setAtivo(ativo);
        recompensa.setAtualizadoEm(LocalDateTime.now());

        RecompensaFidelidade saved = recompensaRepository.save(recompensa);
        return RecompensaFidelidadeResponseDTO.fromEntity(saved);
    }

    @Transactional
    public RecompensaFidelidadeResponseDTO registrarUso(Long empresaId, Long recompensaId) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        if (recompensa.getEstoque() > 0) {
            if (recompensa.getEstoqueUtilizado() >= recompensa.getEstoque()) {
                throw new IllegalStateException("Estoque esgotado para esta recompensa");
            }
            recompensa.setEstoqueUtilizado(recompensa.getEstoqueUtilizado() + 1);
        }

        recompensa.setAtualizadoEm(LocalDateTime.now());
        RecompensaFidelidade saved = recompensaRepository.save(recompensa);
        return RecompensaFidelidadeResponseDTO.fromEntity(saved);
    }

    private void validarRequest(RecompensaFidelidadeRequestDTO request) {
        if (request.getTipo() == TipoRecompensaFidelidade.DESCONTO_PERCENTUAL) {
            if (request.getDescontoPercentual() == null || request.getDescontoPercentual().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Desconto percentual é obrigatório e deve ser maior que zero");
            }
            if (request.getDescontoPercentual().compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Desconto percentual não pode ser maior que 100%");
            }
        } else if (request.getTipo() == TipoRecompensaFidelidade.DESCONTO_VALOR_FIXO) {
            if (request.getDescontoValorFixo() == null || request.getDescontoValorFixo().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Desconto valor fixo é obrigatório e deve ser maior que zero");
            }
        } else if (request.getTipo() == TipoRecompensaFidelidade.PRODUTO_GRATIS) {
            if (request.getProdutoId() == null) {
                throw new IllegalArgumentException("Produto ID é obrigatório para recompensa de produto grátis");
            }
            produtoRepository.findById(request.getProdutoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado"));
        }
    }
}