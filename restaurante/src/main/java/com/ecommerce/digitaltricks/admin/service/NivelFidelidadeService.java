package com.ecommerce.digitaltricks.admin.service;

import com.ecommerce.digitaltricks.admin.dto.NivelFidelidadeRequestDTO;
import com.ecommerce.digitaltricks.admin.dto.NivelFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.NivelFidelidade;
import com.ecommerce.digitaltricks.admin.model.RecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.NivelFidelidadeRepository;
import com.ecommerce.digitaltricks.admin.repository.RecompensaFidelidadeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
/**
 * Mantem a configuracao dos niveis de fidelidade por empresa.
 *
 * <p>Os niveis sao persistidos como configuracao da loja e podem apontar para
 * recompensas existentes, sempre respeitando o contexto da mesma empresa.</p>
 */
public class NivelFidelidadeService {

    private final EmpresaRepository empresaRepository;
    private final NivelFidelidadeRepository nivelFidelidadeRepository;
    private final RecompensaFidelidadeRepository recompensaFidelidadeRepository;

    public NivelFidelidadeService(
            EmpresaRepository empresaRepository,
            NivelFidelidadeRepository nivelFidelidadeRepository,
            RecompensaFidelidadeRepository recompensaFidelidadeRepository
    ) {
        this.empresaRepository = empresaRepository;
        this.nivelFidelidadeRepository = nivelFidelidadeRepository;
        this.recompensaFidelidadeRepository = recompensaFidelidadeRepository;
    }

    @Transactional
    public List<NivelFidelidadeResponseDTO> listarPorEmpresa(Long empresaId) {
        Empresa empresa = buscarEmpresa(empresaId);
        List<NivelFidelidade> niveis = nivelFidelidadeRepository.findByEmpresaOrderByMinPontosAscOrdemExibicaoAsc(empresa);

        if (niveis.isEmpty()) {
            // A criacao lazy evita exigir setup manual logo no primeiro acesso
            // ao modulo de fidelidade.
            niveis = criarNiveisPadrao(empresa);
        }

        return niveis.stream().map(NivelFidelidadeResponseDTO::fromEntity).toList();
    }

    @Transactional
    public List<NivelFidelidadeResponseDTO> salvarTodos(Long empresaId, List<NivelFidelidadeRequestDTO> request) {
        Empresa empresa = buscarEmpresa(empresaId);

        if (request == null || request.isEmpty()) {
            throw new IllegalArgumentException("Envie ao menos um nível de fidelidade");
        }

        nivelFidelidadeRepository.deleteByEmpresa(empresa);

        // O dashboard envia a lista inteira e o backend recria a configuracao
        // para manter ordem e associacoes em um estado previsivel.
        List<NivelFidelidade> niveis = new ArrayList<>();
        for (int i = 0; i < request.size(); i++) {
            NivelFidelidadeRequestDTO dto = request.get(i);
            validarRequest(empresa, dto);

            NivelFidelidade nivel = new NivelFidelidade();
            nivel.setEmpresa(empresa);
            nivel.setNome(dto.getNome().trim());
            nivel.setMinPontos(dto.getMinPontos());
            nivel.setCor(dto.getCor());
            nivel.setDescricao(dto.getDescricao());
            nivel.setRecompensaId(dto.getRecompensaId());
            nivel.setOrdemExibicao(i);
            niveis.add(nivel);
        }

        List<NivelFidelidade> salvos = nivelFidelidadeRepository.saveAll(niveis);
        return salvos.stream().map(NivelFidelidadeResponseDTO::fromEntity).toList();
    }

    private Empresa buscarEmpresa(Long empresaId) {
        return empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));
    }

    private void validarRequest(Empresa empresa, NivelFidelidadeRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Nível inválido");
        }

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome do nível é obrigatório");
        }

        if (dto.getMinPontos() == null || dto.getMinPontos() < 0) {
            throw new IllegalArgumentException("Pontos mínimos inválidos");
        }

        if (dto.getRecompensaId() != null) {
            RecompensaFidelidade recompensa = recompensaFidelidadeRepository
                    .findByEmpresaAndId(empresa, dto.getRecompensaId())
                    .orElseThrow(() -> new EntityNotFoundException("Recompensa associada não encontrada"));

            if (Boolean.FALSE.equals(recompensa.getAtivo())) {
                throw new IllegalStateException("A recompensa associada precisa estar ativa");
            }
        }
    }

    private List<NivelFidelidade> criarNiveisPadrao(Empresa empresa) {
        List<NivelFidelidade> niveis = new ArrayList<>();
        niveis.add(criarNivelPadrao(empresa, "Bronze", 0, "#f97316", "Cliente inicial", 0));
        niveis.add(criarNivelPadrao(empresa, "Prata", 5, "#71717a", "Cliente frequente", 1));
        niveis.add(criarNivelPadrao(empresa, "Ouro", 10, "#f59e0b", "Cliente VIP", 2));
        niveis.add(criarNivelPadrao(empresa, "Mestre", 15, "#8b5cf6", "Cliente Mestre", 3));
        return nivelFidelidadeRepository.saveAll(niveis);
    }

    private NivelFidelidade criarNivelPadrao(
            Empresa empresa,
            String nome,
            int minPontos,
            String cor,
            String descricao,
            int ordemExibicao
    ) {
        NivelFidelidade nivel = new NivelFidelidade();
        nivel.setEmpresa(empresa);
        nivel.setNome(nome);
        nivel.setMinPontos(minPontos);
        nivel.setCor(cor);
        nivel.setDescricao(descricao);
        nivel.setRecompensaId(null);
        nivel.setOrdemExibicao(ordemExibicao);
        return nivel;
    }
}
