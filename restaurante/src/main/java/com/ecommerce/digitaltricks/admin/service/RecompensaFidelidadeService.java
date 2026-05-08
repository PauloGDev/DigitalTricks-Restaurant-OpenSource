package com.ecommerce.digitaltricks.admin.service;

import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResgateResponseDTO;
import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeRequestDTO;
import com.ecommerce.digitaltricks.admin.dto.RecompensaFidelidadeResponseDTO;
import com.ecommerce.digitaltricks.admin.enums.TipoRecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.model.RecompensaFidelidade;
import com.ecommerce.digitaltricks.admin.repository.ClienteEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.RecompensaFidelidadeRepository;
import com.ecommerce.digitaltricks.cart.model.Carrinho;
import com.ecommerce.digitaltricks.cart.repository.CarrinhoRepository;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.order.enums.TipoCupomDesconto;
import com.ecommerce.digitaltricks.order.model.Cupom;
import com.ecommerce.digitaltricks.order.repository.CupomRepository;
import com.ecommerce.digitaltricks.order.service.CupomService;
import com.ecommerce.digitaltricks.product.model.Produto;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
/**
 * Gerencia recompensas e resgates do programa de fidelidade.
 *
 * <p>O service atende tanto o painel administrativo quanto o fluxo publico do
 * cliente, garantindo consistencia entre pontos, estoque e cupom gerado.</p>
 */
public class RecompensaFidelidadeService {

    private final RecompensaFidelidadeRepository recompensaRepository;
    private final EmpresaRepository empresaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteEmpresaRepository clienteEmpresaRepository;
    private final CupomRepository cupomRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final CupomService cupomService;

    public RecompensaFidelidadeService(
            RecompensaFidelidadeRepository recompensaRepository,
            EmpresaRepository empresaRepository,
            ProdutoRepository produtoRepository,
            ClienteRepository clienteRepository,
            ClienteEmpresaRepository clienteEmpresaRepository,
            CupomRepository cupomRepository,
            CarrinhoRepository carrinhoRepository,
            CupomService cupomService) {
        this.recompensaRepository = recompensaRepository;
        this.empresaRepository = empresaRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.clienteEmpresaRepository = clienteEmpresaRepository;
        this.cupomRepository = cupomRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.cupomService = cupomService;
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

    @Transactional
    public RecompensaFidelidadeResgateResponseDTO resgatarParaCliente(
            Long empresaId,
            Long recompensaId,
            String telefoneCliente
    ) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        Cliente cliente = clienteRepository.findByTelefone(telefoneCliente)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado"));

        ClienteEmpresa clienteEmpresa = clienteEmpresaRepository
                .findByClienteIdAndEmpresaId(cliente.getId(), empresaId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente não possui relacionamento com a empresa"));

        RecompensaFidelidade recompensa = recompensaRepository.findByEmpresaAndId(empresa, recompensaId)
                .orElseThrow(() -> new EntityNotFoundException("Recompensa não encontrada"));

        LocalDateTime agora = LocalDateTime.now();
        if (!recompensa.estaDisponivel(agora)) {
            throw new IllegalStateException("Recompensa indisponível no momento");
        }

        int pontosAtuais = clienteEmpresa.getPontosFidelidade() != null
                ? clienteEmpresa.getPontosFidelidade()
                : 0;

        if (pontosAtuais < recompensa.getValorPontos()) {
            throw new IllegalStateException("Pontos insuficientes para resgatar esta recompensa");
        }

        if (recompensa.getEstoque() > 0) {
            int estoqueUtilizadoAtual = recompensa.getEstoqueUtilizado() != null
                    ? recompensa.getEstoqueUtilizado()
                    : 0;
            recompensa.setEstoqueUtilizado(estoqueUtilizadoAtual + 1);
        }

        clienteEmpresa.setPontosFidelidade(pontosAtuais - recompensa.getValorPontos());
        recompensa.setAtualizadoEm(agora);

        Produto produtoGratis = buscarProdutoGratisSeExistir(recompensa);
        Cupom cupomGerado = criarCupomDaRecompensa(empresa, recompensa, produtoGratis, agora);

        boolean cupomAplicadoNoCarrinho = false;
        Carrinho carrinho = carrinhoRepository
                .findByClienteIdAndEmpresaId(cliente.getId(), empresaId)
                .orElse(null);

        if (carrinho != null && carrinho.getSubtotal() != null && carrinho.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
            cupomService.aplicarNoCarrinho(carrinho, cupomGerado, cliente, null, null);
            carrinhoRepository.save(carrinho);
            cupomAplicadoNoCarrinho = true;
        }

        clienteEmpresaRepository.save(clienteEmpresa);
        RecompensaFidelidade saved = recompensaRepository.save(recompensa);

        return new RecompensaFidelidadeResgateResponseDTO(
                RecompensaFidelidadeResponseDTO.fromEntity(saved),
                clienteEmpresa.getPontosFidelidade(),
                cupomAplicadoNoCarrinho
                        ? "Recompensa resgatada e aplicada no carrinho"
                        : "Recompensa resgatada com sucesso",
                cupomGerado.getCodigo(),
                cupomAplicadoNoCarrinho
        );
    }

    private Produto buscarProdutoGratisSeExistir(RecompensaFidelidade recompensa) {
        if (recompensa.getTipo() != TipoRecompensaFidelidade.PRODUTO_GRATIS || recompensa.getProdutoId() == null) {
            return null;
        }

        return produtoRepository.findById(recompensa.getProdutoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto da recompensa n\u00e3o encontrado"));
    }

    private Cupom criarCupomDaRecompensa(
            Empresa empresa,
            RecompensaFidelidade recompensa,
            Produto produtoGratis,
            LocalDateTime agora
    ) {
        Cupom cupom = new Cupom();
        cupom.setEmpresa(empresa);
        cupom.setCodigo(gerarCodigoCupomFidelidade(empresa.getId()));
        cupom.setNome("Fidelidade - " + recompensa.getNome());
        cupom.setDescricao(montarDescricaoCupom(recompensa, produtoGratis));
        cupom.setAtivo(true);
        cupom.setApenasPrimeiraCompra(false);
        cupom.setApenasNovoUsuario(false);
        cupom.setFreteGratis(false);
        cupom.setAplicaEmItensPromocionais(true);
        cupom.setValorMinimoPedido(BigDecimal.ZERO);
        cupom.setLimiteUsoTotal(1);
        cupom.setLimiteUsoPorUsuario(1);
        cupom.setTotalUsado(0);
        cupom.setDataInicio(agora);
        cupom.setDataFim(agora.plusDays(30));
        cupom.setCumulativo(false);

        if (recompensa.getTipo() == TipoRecompensaFidelidade.DESCONTO_PERCENTUAL) {
            cupom.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
            cupom.setValorDesconto(recompensa.getDescontoPercentual());
            cupom.setValorMaximoDesconto(null);
        } else {
            cupom.setTipoDesconto(TipoCupomDesconto.VALOR_FIXO);
            cupom.setValorDesconto(resolverValorDesconto(recompensa, produtoGratis));
            cupom.setValorMaximoDesconto(null);
        }

        return cupomRepository.save(cupom);
    }

    private BigDecimal resolverValorDesconto(RecompensaFidelidade recompensa, Produto produtoGratis) {
        if (recompensa.getTipo() == TipoRecompensaFidelidade.DESCONTO_VALOR_FIXO) {
            return recompensa.getDescontoValorFixo();
        }

        if (produtoGratis != null) {
            BigDecimal valorProduto = produtoGratis.isOfertaVigente()
                    ? produtoGratis.getPrecoPromocionalCalculado()
                    : produtoGratis.getPrecoBaseCalculo();
            return valorProduto != null ? valorProduto : BigDecimal.ZERO;
        }

        return BigDecimal.ZERO;
    }

    private String montarDescricaoCupom(RecompensaFidelidade recompensa, Produto produtoGratis) {
        if (recompensa.getTipo() == TipoRecompensaFidelidade.PRODUTO_GRATIS && produtoGratis != null) {
            return "Cupom de fidelidade equivalente a 1x " + produtoGratis.getNome();
        }

        return recompensa.getDescricao() != null && !recompensa.getDescricao().isBlank()
                ? recompensa.getDescricao()
                : "Cupom gerado a partir de recompensa de fidelidade";
    }

    private String gerarCodigoCupomFidelidade(Long empresaId) {
        String prefixo = "FID" + empresaId;

        for (int tentativa = 0; tentativa < 10; tentativa++) {
            String sufixo = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase(Locale.ROOT);
            String codigo = prefixo + sufixo;

            if (!cupomRepository.existsByEmpresaIdAndCodigoIgnoreCase(empresaId, codigo)) {
                return codigo;
            }
        }

        throw new IllegalStateException("N\u00e3o foi poss\u00edvel gerar um cupom exclusivo para a recompensa");
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
