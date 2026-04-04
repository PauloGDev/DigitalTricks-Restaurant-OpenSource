package com.ecommerce.digitaltricks.utils;

import com.ecommerce.digitaltricks.enums.pedido.MetodoPagamentoNaEntrega;
import com.ecommerce.digitaltricks.enums.pedido.StatusPagamento;
import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.enums.pedido.TipoEntrega;
import com.ecommerce.digitaltricks.enums.pedido.TipoPagamento;
import com.ecommerce.digitaltricks.enums.usuarios.StatusUsuario;
import com.ecommerce.digitaltricks.enums.usuarios.admin.PapelEmpresa;
import com.ecommerce.digitaltricks.enums.usuarios.admin.StatusEmpresa;
import com.ecommerce.digitaltricks.enums.usuarios.cliente.Genero;
import com.ecommerce.digitaltricks.model.*;
import com.ecommerce.digitaltricks.repository.*;
import com.ecommerce.digitaltricks.service.EnderecoGeocodingService;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Component
@Profile("!test")
public class ProdutoInitializer implements CommandLineRunner {

    private final ProdutoRepository produtoRepository;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioEmpresaRepository usuarioEmpresaRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteEmpresaRepository clienteEmpresaRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EnderecoGeocodingService enderecoGeocodingService;
    private final CategoriaRepository categoriaRepository;

    public ProdutoInitializer(
            ProdutoRepository produtoRepository,
            EmpresaRepository empresaRepository,
            UsuarioRepository usuarioRepository,
            UsuarioEmpresaRepository usuarioEmpresaRepository,
            ClienteRepository clienteRepository,
            ClienteEmpresaRepository clienteEmpresaRepository,
            PedidoRepository pedidoRepository,
            PasswordEncoder passwordEncoder,
            EnderecoGeocodingService enderecoGeocodingService,
            CategoriaRepository categoriaRepository) {
        this.produtoRepository = produtoRepository;
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioEmpresaRepository = usuarioEmpresaRepository;
        this.clienteRepository = clienteRepository;
        this.clienteEmpresaRepository = clienteEmpresaRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
        this.enderecoGeocodingService = enderecoGeocodingService;
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Empresa empresa = getOrCreateEmpresaSeed();

        inicializarUsuariosInternos(empresa);
        inicializarClientes(empresa);
        List<Categoria> categorias = criarCategorias(empresa);
        inicializarProdutos(empresa, categorias);

        gerarPedidosFake(empresa);
    }

    private Empresa getOrCreateEmpresaSeed() {
        return empresaRepository.findBySlugIgnoreCase("sabor-da-praca")
                .orElseGet(() -> {
                    Empresa empresa = new Empresa();
                    empresa.setNomeFantasia("Sabor da Praça");
                    empresa.setRazaoSocial("Sabor da Praça Alimentos Ltda");
                    empresa.setCnpj("11222333000181");
                    empresa.setSlug("sabor-da-praca");
                    empresa.setEmail("contato@sabordapraca.com");
                    empresa.setTelefone("85999999999");
                    empresa.setStatus(StatusEmpresa.ATIVA);

                    empresa.setMpContaConectada(false);

                    empresa.setCep("60040-531");
                    empresa.setLogradouro("Av. Treze de Maio");
                    empresa.setNumero("2081");
                    empresa.setBairro("Benfica");
                    empresa.setCidade("Fortaleza");
                    empresa.setUf("CE");
                    empresa.setComplemento(null);

                    empresa.setAceitaRetirada(true);
                    empresa.setAceitaDelivery(true);
                    empresa.setRaioEntregaKm(12.0);
                    empresa.setTaxaEntregaFixa(5.99);
                    empresa.setValorPorKm(1.50);
                    empresa.setPedidoMinimoDelivery(20.0);
                    empresa.setValorFreteGratis(80.0);

                    try {
                        enderecoGeocodingService.enriquecerEmpresa(empresa);
                    } catch (Exception ignored) {
                    }

                    return empresaRepository.save(empresa);
                });
    }

    private List<Categoria> criarCategorias(Empresa empresa) {
        List<Categoria> existentes = categoriaRepository.findByEmpresaId(empresa.getId());

        if (!existentes.isEmpty()) return existentes;

        List<Categoria> categorias = List.of(
                new Categoria("Lanches", empresa),
                new Categoria("Pizzas", empresa),
                new Categoria("Massas", empresa),
                new Categoria("Bebidas", empresa),
                new Categoria("Sobremesas", empresa)
        );

        return categoriaRepository.saveAll(categorias);
    }

    private void inicializarUsuariosInternos(Empresa empresa) {
        Usuario admin = getOrCreateUsuario(
                "admin.demo",
                "Administrador Demo",
                "admin.demo@restaurante.com",
                "123456",
                Set.of("ROLE_ADMIN")
        );
        getOrCreateUsuarioEmpresa(admin, empresa, PapelEmpresa.DONO);

        Usuario atendente = getOrCreateUsuario(
                "atendente.demo",
                "Atendente Demo",
                "atendente.demo@restaurante.com",
                "123456",
                Set.of("ROLE_ADMIN")
        );
        getOrCreateUsuarioEmpresa(atendente, empresa, PapelEmpresa.ATENDENTE);
    }

    private Usuario getOrCreateUsuario(
            String username,
            String nome,
            String email,
            String senha,
            Set<String> roles
    ) {
        return usuarioRepository.findByUsername(username)
                .orElseGet(() -> {
                    Usuario usuario = new Usuario();
                    usuario.setUsername(username);
                    usuario.setNome(nome);
                    usuario.setEmail(email);
                    usuario.setPassword(passwordEncoder.encode(senha));
                    usuario.setRoles(roles);
                    usuario.setStatus(StatusUsuario.ATIVO);
                    return usuarioRepository.save(usuario);
                });
    }

    private void getOrCreateUsuarioEmpresa(Usuario usuario, Empresa empresa, PapelEmpresa papel) {
        UsuarioEmpresa rel = usuarioEmpresaRepository
                .findByUsuarioIdAndEmpresaId(usuario.getId(), empresa.getId())
                .orElseGet(() -> {
                    UsuarioEmpresa ue = new UsuarioEmpresa();
                    ue.setUsuario(usuario);
                    ue.setEmpresa(empresa);
                    return ue;
                });

        rel.setPapel(papel);
        rel.setAtivo(true);
        usuarioEmpresaRepository.save(rel);
    }

    private void inicializarClientes(Empresa empresa) {
        Cliente cliente1 = getOrCreateCliente(
                "85999991001",
                "123456",
                "Cliente Demo 1",
                "cliente1@email.com",
                LocalDate.of(1998, 5, 10),
                Genero.MASCULINO,
                "Rua Joaquim Torres",
                "120",
                "Joaquim Távora",
                "Fortaleza",
                "60135-130",
                "Apto 201",
                "CE"
        );

        Cliente cliente2 = getOrCreateCliente(
                "85999991002",
                "123456",
                "Cliente Demo 2",
                "cliente2@email.com",
                LocalDate.of(1994, 9, 3),
                Genero.FEMININO,
                "Rua Visconde do Rio Branco",
                "955",
                "Centro",
                "Fortaleza",
                "60055-170",
                null,
                "CE"
        );

        Cliente cliente3 = getOrCreateCliente(
                "85999991003",
                "123456",
                "Cliente Demo 3",
                null,
                null,
                Genero.PREFIRO_NAO_DIZER,
                "Rua Padre Valdevino",
                "430",
                "Aldeota",
                "Fortaleza",
                "60135-040",
                null,
                "CE"
        );

        Cliente cliente4 = getOrCreateCliente(
                "85999991004",
                "123456",
                "Cliente Demo 4",
                "cliente4@email.com",
                null,
                Genero.MASCULINO,
                "Av. da Universidade",
                "1550",
                "Benfica",
                "Fortaleza",
                "60020-181",
                "Casa",
                "CE"
        );

        getOrCreateClienteEmpresa(cliente1, empresa);
        getOrCreateClienteEmpresa(cliente2, empresa);
        getOrCreateClienteEmpresa(cliente3, empresa);
        getOrCreateClienteEmpresa(cliente4, empresa);
    }

    private Cliente getOrCreateCliente(
            String telefone,
            String senha,
            String nomeCompleto,
            String email,
            LocalDate dataNascimento,
            Genero genero,
            String logradouro,
            String numero,
            String bairro,
            String cidade,
            String cep,
            String complemento,
            String uf
    ) {
        return clienteRepository.findByTelefone(telefone)
                .orElseGet(() -> {
                    Cliente cliente = new Cliente();
                    cliente.setTelefone(telefone);
                    cliente.setPassword(passwordEncoder.encode(senha));
                    cliente.setStatus(StatusUsuario.ATIVO);

                    ClientePerfil perfil = new ClientePerfil();
                    perfil.setCliente(cliente);
                    perfil.setNomeCompleto(nomeCompleto);
                    perfil.setTelefone(telefone);
                    perfil.setEmail(email);
                    perfil.setDataNascimento(dataNascimento);
                    perfil.setGenero(genero);

                    Endereco endereco = new Endereco();
                    endereco.setLogradouro(logradouro);
                    endereco.setNumero(numero);
                    endereco.setBairro(bairro);
                    endereco.setCidade(cidade);
                    endereco.setCep(cep);
                    endereco.setComplemento(complemento);
                    endereco.setUf(uf);
                    endereco.setPadrao(true);
                    endereco.setPerfil(perfil);

                    perfil.getEnderecos().add(endereco);
                    cliente.setPerfil(perfil);

                    return clienteRepository.save(cliente);
                });
    }

    private void getOrCreateClienteEmpresa(Cliente cliente, Empresa empresa) {
        ClienteEmpresa rel = clienteEmpresaRepository
                .findByClienteIdAndEmpresaId(cliente.getId(), empresa.getId())
                .orElseGet(() -> {
                    ClienteEmpresa ce = new ClienteEmpresa();
                    ce.setCliente(cliente);
                    ce.setEmpresa(empresa);
                    ce.setAtivo(true);
                    ce.setBloqueado(false);
                    ce.setTotalPedidos(0);
                    ce.setTotalGasto(BigDecimal.ZERO);
                    return ce;
                });

        clienteEmpresaRepository.save(rel);
    }

    private void inicializarProdutos(Empresa empresa, List<Categoria> categorias){
        Categoria lanches = categorias.get(0);
        Categoria pizzas = categorias.get(1);
        Categoria massas = categorias.get(2);
        Categoria bebidas = categorias.get(3);
        Categoria sobremesas = categorias.get(4);

        upsertProduto(empresa, "X-Burger Especial", "...", new BigDecimal("24.90"), 120, true, lanches);
        upsertProduto(empresa, "Pizza Calabresa", "...", new BigDecimal("42.90"), 80, true, pizzas);
        upsertProduto(empresa, "Macarrão Artesanal", "...", new BigDecimal("29.90"), 60, true, massas);
        upsertProduto(empresa, "Refrigerante Lata", "...", new BigDecimal("6.50"), 200, false, bebidas);
        upsertProduto(empresa, "Brownie da Casa", "...", new BigDecimal("11.90"), 70, true, sobremesas);
    }

    private void upsertProduto(
            Empresa empresa,
            String nome,
            String descricao,
            BigDecimal precoBase,
            Integer estoque,
            boolean permiteObservacao,
            Categoria categoria
    ) {
        boolean exists = produtoRepository.findAll()
                .stream()
                .anyMatch(p ->
                        p.getEmpresa() != null
                                && p.getEmpresa().getId().equals(empresa.getId())
                                && nome.equalsIgnoreCase(p.getNome())
                );

        if (exists) return;

        Produto produto = new Produto();
        produto.setEmpresa(empresa);
        produto.setNome(nome);
        produto.setDescricao(descricao);
        produto.setPrecoBase(precoBase);
        produto.setEstoque(estoque);
        produto.setAtivo(true);
        produto.setPermiteObservacao(permiteObservacao);
        produto.setMaxObservacaoChars(180);

        produto.setCategorias(List.of(categoria));

        produtoRepository.save(produto);
    }

    private void gerarPedidosFake(Empresa empresa) {
        if (pedidoRepository.count() >= 30) return;

        List<Cliente> clientes = clienteRepository.findAll()
                .stream()
                .filter(c -> c.getPerfil() != null)
                .toList();

        List<Produto> produtos = produtoRepository.findAll()
                .stream()
                .filter(p -> p.getEmpresa() != null && p.getEmpresa().getId().equals(empresa.getId()))
                .filter(Produto::isAtivo)
                .toList();

        if (clientes.isEmpty() || produtos.isEmpty()) return;

        for (int i = 0; i < 20; i++) {
            Cliente cliente = clientes.get(randomInt(0, clientes.size() - 1));
            ClientePerfil perfil = cliente.getPerfil();

            if (perfil == null) continue;

            Pedido pedido = new Pedido();
            pedido.setEmpresa(empresa);
            pedido.setCliente(cliente);
            pedido.setData(gerarDataPedidoFake());

            TipoEntrega tipoEntrega = randomInt(1, 100) <= 70
                    ? TipoEntrega.DELIVERY
                    : TipoEntrega.RETIRADA;

            TipoPagamento tipoPagamento;
            int sorteioPagamento = randomInt(1, 100);
            if (sorteioPagamento <= 40) {
                tipoPagamento = TipoPagamento.PIX;
            } else if (sorteioPagamento <= 70) {
                tipoPagamento = TipoPagamento.CREDIT_CARD;
            } else {
                tipoPagamento = TipoPagamento.PAY_ON_DELIVERY;
            }

            pedido.setTipoEntrega(tipoEntrega);
            pedido.setTipoPagamento(tipoPagamento);
            pedido.setNomeCompleto(perfil.getNomeCompleto());
            pedido.setTelefone(perfil.getTelefone());
            pedido.setEmail(perfil.getEmail());

            if (tipoEntrega == TipoEntrega.DELIVERY) {
                Endereco endereco = perfil.getEnderecos().stream()
                        .filter(Endereco::isPadrao)
                        .findFirst()
                        .orElse(perfil.getEnderecos().isEmpty() ? null : perfil.getEnderecos().get(0));

                pedido.setEnderecoEntrega(endereco);
                pedido.setServicoFrete("Entrega padrão");
                pedido.setValorFrete(empresa.getTaxaEntregaFixa() != null ? empresa.getTaxaEntregaFixa() : 5.99);
                pedido.setPrazoFrete("30-45 min");
            } else {
                pedido.setEnderecoEntrega(null);
                pedido.setServicoFrete(null);
                pedido.setValorFrete(0.0);
                pedido.setPrazoFrete(null);
            }

            configurarPagamentoFake(pedido);

            int quantidadeItens = randomInt(1, 3);
            List<ItemPedido> itens = new ArrayList<>();

            for (int j = 0; j < quantidadeItens; j++) {
                Produto produto = produtos.get(randomInt(0, produtos.size() - 1));
                int quantidade = randomInt(1, 2);

                ItemPedido item = new ItemPedido(
                        produto,
                        produto.getNome(),
                        quantidade,
                        produto.getPrecoBase(),
                        produto.getImagemUrl()
                );

                if (produto.isPermiteObservacao() && randomInt(1, 100) <= 25) {
                    item.setObservacao("Sem cebola / molho à parte");
                }

                item.recalcularTotalOpcionais();
                itens.add(item);
            }

            pedido.setItens(itens);

            BigDecimal subtotal = itens.stream()
                    .map(ItemPedido::getTotalItem)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            pedido.setSubtotal(subtotal);
            pedido.setDescontoCupom(BigDecimal.ZERO);
            pedido.setCupomCodigo(null);

            BigDecimal total = subtotal.add(BigDecimal.valueOf(
                    pedido.getValorFrete() != null ? pedido.getValorFrete() : 0.0
            ));
            pedido.setTotal(total);

            definirStatusFake(pedido);

            Pedido salvo = pedidoRepository.save(pedido);

            ClienteEmpresa clienteEmpresa = clienteEmpresaRepository
                    .findByClienteIdAndEmpresaId(cliente.getId(), empresa.getId())
                    .orElse(null);

            if (clienteEmpresa != null) {
                clienteEmpresa.setTotalPedidos(
                        (clienteEmpresa.getTotalPedidos() != null ? clienteEmpresa.getTotalPedidos() : 0) + 1
                );
                clienteEmpresa.setTotalGasto(
                        (clienteEmpresa.getTotalGasto() != null ? clienteEmpresa.getTotalGasto() : BigDecimal.ZERO)
                                .add(salvo.getTotal() != null ? salvo.getTotal() : BigDecimal.ZERO)
                );
                clienteEmpresa.setUltimoPedidoEm(salvo.getData());
                clienteEmpresaRepository.save(clienteEmpresa);
            }
        }
    }

    private void configurarPagamentoFake(Pedido pedido) {
        pedido.setPagamentoNaEntrega(null);
        pedido.setMpStatus(null);
        pedido.setMpPaymentId(null);
        pedido.setPaymentProvider(null);
        pedido.setStripeSessionId(null);

        if (pedido.getTipoPagamento() == TipoPagamento.PAY_ON_DELIVERY) {
            PagamentoNaEntrega pne = new PagamentoNaEntrega();

            int sorteio = randomInt(1, 100);
            if (sorteio <= 50) {
                pne.setMetodo(MetodoPagamentoNaEntrega.CASH);
                pne.setPrecisaTroco(randomInt(1, 100) <= 35);
                pne.setTrocoPara(Boolean.TRUE.equals(pne.getPrecisaTroco()) ? new BigDecimal("100.00") : null);
            } else if (sorteio <= 75) {
                pne.setMetodo(MetodoPagamentoNaEntrega.DEBIT_CARD);
                pne.setPrecisaTroco(false);
                pne.setTrocoPara(null);
            } else {
                pne.setMetodo(MetodoPagamentoNaEntrega.CREDIT_CARD);
                pne.setPrecisaTroco(false);
                pne.setTrocoPara(null);
            }

            pedido.setPagamentoNaEntrega(pne);
            return;
        }

        if (pedido.getTipoPagamento() == TipoPagamento.PIX) {
            pedido.setPaymentProvider("MERCADO_PAGO");
            pedido.setMpPaymentId("MP-" + System.nanoTime());
            pedido.setMpStatus("approved");
            return;
        }

        if (pedido.getTipoPagamento() == TipoPagamento.CREDIT_CARD) {
            pedido.setPaymentProvider("STRIPE");
            pedido.setStripeSessionId("cs_test_" + System.nanoTime());
            pedido.setMpStatus("approved");
        }
    }

    private void definirStatusFake(Pedido pedido) {
        int chance = randomInt(1, 100);

        if (pedido.getTipoPagamento() == TipoPagamento.PIX || pedido.getTipoPagamento() == TipoPagamento.CREDIT_CARD) {
            if (chance <= 10) {
                pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
                pedido.setStatusPagamento(StatusPagamento.PENDENTE);
                return;
            }
        }

        if (pedido.getTipoEntrega() == TipoEntrega.RETIRADA) {
            if (chance <= 20) {
                pedido.setStatus(StatusPedido.RECEBIDO);
                pedido.setStatusPagamento(StatusPagamento.PENDENTE);
            } else if (chance <= 45) {
                pedido.setStatus(StatusPedido.EM_PREPARO);
                pedido.setStatusPagamento(resolvePagamento(pedido));
            } else if (chance <= 65) {
                pedido.setStatus(StatusPedido.PRONTO);
                pedido.setStatusPagamento(resolvePagamento(pedido));
            } else if (chance <= 90) {
                pedido.setStatus(StatusPedido.RETIRADO);
                pedido.setStatusPagamento(StatusPagamento.APROVADO);
            } else {
                pedido.setStatus(StatusPedido.CANCELADO);
                pedido.setStatusPagamento(StatusPagamento.CANCELADO);
            }
            return;
        }

        if (chance <= 20) {
            pedido.setStatus(StatusPedido.RECEBIDO);
            pedido.setStatusPagamento(StatusPagamento.PENDENTE);
        } else if (chance <= 45) {
            pedido.setStatus(StatusPedido.EM_PREPARO);
            pedido.setStatusPagamento(resolvePagamento(pedido));
        } else if (chance <= 65) {
            pedido.setStatus(StatusPedido.PRONTO);
            pedido.setStatusPagamento(resolvePagamento(pedido));
        } else if (chance <= 82) {
            pedido.setStatus(StatusPedido.SAIU_PARA_ENTREGA);
            pedido.setStatusPagamento(resolvePagamento(pedido));
        } else if (chance <= 95) {
            pedido.setStatus(StatusPedido.ENTREGUE);
            pedido.setStatusPagamento(StatusPagamento.APROVADO);
        } else {
            pedido.setStatus(StatusPedido.CANCELADO);
            pedido.setStatusPagamento(StatusPagamento.CANCELADO);
        }
    }

    private StatusPagamento resolvePagamento(Pedido pedido) {
        if (pedido.getTipoPagamento() == TipoPagamento.PIX || pedido.getTipoPagamento() == TipoPagamento.CREDIT_CARD) {
            return StatusPagamento.APROVADO;
        }
        return StatusPagamento.PENDENTE;
    }

    private LocalDateTime gerarDataPedidoFake() {
        int diasAtras = randomInt(0, 14);
        int hora = randomInt(11, 22);
        int minuto = randomInt(0, 59);

        return LocalDateTime.now()
                .minusDays(diasAtras)
                .withHour(hora)
                .withMinute(minuto)
                .withSecond(0)
                .withNano(0);
    }

    private int randomInt(int min, int max) {
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }
}