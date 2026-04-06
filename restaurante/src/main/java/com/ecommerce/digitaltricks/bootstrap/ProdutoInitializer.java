package com.ecommerce.digitaltricks.bootstrap;

import com.ecommerce.digitaltricks.admin.model.ClienteEmpresa;
import com.ecommerce.digitaltricks.admin.model.Empresa;
import com.ecommerce.digitaltricks.admin.repository.ClienteEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioEmpresaRepository;
import com.ecommerce.digitaltricks.admin.repository.UsuarioRepository;
import com.ecommerce.digitaltricks.customer.model.Cliente;
import com.ecommerce.digitaltricks.customer.model.ClientePerfil;
import com.ecommerce.digitaltricks.customer.model.Endereco;
import com.ecommerce.digitaltricks.admin.model.Usuario;
import com.ecommerce.digitaltricks.admin.model.UsuarioEmpresa;
import com.ecommerce.digitaltricks.customer.repository.ClienteRepository;
import com.ecommerce.digitaltricks.order.enums.MetodoPagamentoNaEntrega;
import com.ecommerce.digitaltricks.order.enums.StatusPagamento;
import com.ecommerce.digitaltricks.order.enums.StatusPedido;
import com.ecommerce.digitaltricks.order.enums.TipoCupomDesconto;
import com.ecommerce.digitaltricks.admin.enums.TipoDescontoPromocao;
import com.ecommerce.digitaltricks.order.enums.TipoEntrega;
import com.ecommerce.digitaltricks.order.enums.TipoItemPedidoOpcional;
import com.ecommerce.digitaltricks.order.enums.TipoPagamento;
import com.ecommerce.digitaltricks.order.model.*;
import com.ecommerce.digitaltricks.order.repository.CupomRepository;
import com.ecommerce.digitaltricks.order.repository.PedidoRepository;
import com.ecommerce.digitaltricks.product.enums.TipoGrupoProduto;
import com.ecommerce.digitaltricks.product.enums.TipoSelecaoOpcional;
import com.ecommerce.digitaltricks.admin.enums.StatusUsuario;
import com.ecommerce.digitaltricks.admin.enums.PapelEmpresa;
import com.ecommerce.digitaltricks.admin.enums.StatusEmpresa;
import com.ecommerce.digitaltricks.customer.enums.Genero;
import com.ecommerce.digitaltricks.product.model.*;
import com.ecommerce.digitaltricks.product.repository.CategoriaRepository;
import com.ecommerce.digitaltricks.product.repository.ProdutoRepository;
import com.ecommerce.digitaltricks.customer.service.EnderecoGeocodingService;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Inicializa dados de demonstracão para testes.
 *
 * Cria: 2 empresas, 6 usuários internos, 4 clientes por empresa,
 * 9 categorias, 20 produtos (com variações e opcionais),
 * 7 cupons e 40 pedidos distribuídos.
 */
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
    private final CupomRepository cupomRepository;

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
            CategoriaRepository categoriaRepository,
            CupomRepository cupomRepository) {
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
        this.cupomRepository = cupomRepository;
    }

    private static final String HORARIOS_PADRAO =
        "{\"segunda\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
        "\"terca\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
        "\"quarta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
        "\"quinta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
        "\"sexta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:59\"}," +
        "\"sabado\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:59\"}," +
        "\"domingo\":{\"aberto\":false,\"inicio\":\"18:00\",\"fim\":\"23:00\"}}";

    @Override
    @Transactional
    public void run(String... args) {
        Empresa saborDaPraca = getOrCreateEmpresaSeed();
        inicializarUsuariosInternos(saborDaPraca, PapelEmpresa.DONO);
        inicializarClientes(saborDaPraca);
        List<Categoria> categorias1 = criarCategorias(saborDaPraca);
        inicializarProdutos(saborDaPraca, categorias1);
        criarCupons(saborDaPraca);
        gerarPedidosFake(saborDaPraca);

        Empresa burgerKingDom = getOrCreateEmpresaBurgerKingDom();
        inicializarUsuariosInternos(burgerKingDom, PapelEmpresa.DONO);
        inicializarClientes(burgerKingDom);
        List<Categoria> categorias2 = criarCategoriasBurger(burgerKingDom);
        inicializarProdutosBurger(burgerKingDom, categorias2);
        criarCuponsBurger(burgerKingDom);
        gerarPedidosFake(burgerKingDom);

        migrarHorariosDeTodasEmpresas();
    }

    private void migrarHorariosDeTodasEmpresas() {
        empresaRepository.findAll().forEach(empresa -> {
            if (empresa.getHorariosFuncionamento() == null || empresa.getHorariosFuncionamento().isBlank()) {
                empresa.setHorariosFuncionamento(HORARIOS_PADRAO);
                empresaRepository.save(empresa);
                System.out.println("[ProdutoInitializer] Horarios definidos para empresa: " + empresa.getNomeFantasia());
            }
        });
    }

    // ──────────────────── EMPRESA 1: Sabor da Praça ────────────────────

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

                    empresa.setAceitaRetirada(true);
                    empresa.setAceitaDelivery(true);
                    empresa.setRaioEntregaKm(12.0);
                    empresa.setTaxaEntregaFixa(5.99);
                    empresa.setValorPorKm(1.50);
                    empresa.setPedidoMinimoDelivery(20.0);
                    empresa.setValorFreteGratis(80.0);
                    empresa.setHorariosFuncionamento(HORARIOS_PADRAO);

                    try {
                        enderecoGeocodingService.enriquecerEmpresa(empresa);
                    } catch (Exception ignored) {
                    }

                    return empresaRepository.save(empresa);
                });
    }

    // ──────────────────── EMPRESA 2: Burger King Dom ────────────────────

    private Empresa getOrCreateEmpresaBurgerKingDom() {
        return empresaRepository.findBySlugIgnoreCase("burger-king-dom")
                .orElseGet(() -> {
                    Empresa empresa = new Empresa();
                    empresa.setNomeFantasia("Burger King Dom");
                    empresa.setRazaoSocial("Burger King Dom Lanchonetes Ltda");
                    empresa.setCnpj("22333444000199");
                    empresa.setSlug("burger-king-dom");
                    empresa.setEmail("contato@burgerkingdom.com");
                    empresa.setTelefone("85988888888");
                    empresa.setStatus(StatusEmpresa.ATIVA);
                    empresa.setMpContaConectada(false);

                    empresa.setCep("60160-230");
                    empresa.setLogradouro("Av. Monsenhor Tabosa");
                    empresa.setNumero("750");
                    empresa.setBairro("Aldeota");
                    empresa.setCidade("Fortaleza");
                    empresa.setUf("CE");

                    empresa.setAceitaRetirada(true);
                    empresa.setAceitaDelivery(true);
                    empresa.setRaioEntregaKm(10.0);
                    empresa.setTaxaEntregaFixa(7.99);
                    empresa.setValorPorKm(2.00);
                    empresa.setPedidoMinimoDelivery(25.0);
                    empresa.setValorFreteGratis(100.0);

                    empresa.setHorariosFuncionamento(
                        "{\"segunda\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
                        "\"terca\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
                        "\"quarta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
                        "\"quinta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:00\"}," +
                        "\"sexta\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:59\"}," +
                        "\"sabado\":{\"aberto\":true,\"inicio\":\"18:00\",\"fim\":\"23:59\"}," +
                        "\"domingo\":{\"aberto\":false,\"inicio\":\"18:00\",\"fim\":\"23:00\"}}"
                    );

                    try {
                        enderecoGeocodingService.enriquecerEmpresa(empresa);
                    } catch (Exception ignored) {
                    }

                    return empresaRepository.save(empresa);
                });
    }

    // ──────────────────── USUÁRIOS ────────────────────

    private void inicializarUsuariosInternos(Empresa empresa, PapelEmpresa papelDono) {
        String suffix = empresa.getSlug().replace("-", ".");
        String emailBase = empresa.getSlug().replace("-", "");

        Usuario dono = getOrCreateUsuario(
                "admin." + suffix,
                "Administrador " + empresa.getNomeFantasia(),
                "admin@" + emailBase + ".com",
                "123456",
                Set.of("ROLE_ADMIN")
        );
        getOrCreateUsuarioEmpresa(dono, empresa, papelDono);

        Usuario gerente = getOrCreateUsuario(
                "gerente." + suffix,
                "Gerente " + empresa.getNomeFantasia(),
                "gerente@" + emailBase + ".com",
                "123456",
                Set.of("ROLE_ADMIN")
        );
        getOrCreateUsuarioEmpresa(gerente, empresa, PapelEmpresa.GERENTE);

        Usuario atendente = getOrCreateUsuario(
                "atendente." + suffix,
                "Atendente " + empresa.getNomeFantasia(),
                "atendente@" + emailBase + ".com",
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

    // ──────────────────── CLIENTES ────────────────────

    private void inicializarClientes(Empresa empresa) {
        Cliente cliente1 = getOrCreateCliente(
                "85999991001", "123456",
                "João da Silva", "cliente1@email.com",
                java.time.LocalDate.of(1998, 5, 10), Genero.MASCULINO,
                "Rua Joaquim Torres", "120", "Joaquim Távora",
                "Fortaleza", "60135-130", "Apto 201", "CE"
        );

        Cliente cliente2 = getOrCreateCliente(
                "85999991002", "123456",
                "Maria Santos", "cliente2@email.com",
                java.time.LocalDate.of(1994, 9, 3), Genero.FEMININO,
                "Rua Visconde do Rio Branco", "955", "Centro",
                "Fortaleza", "60055-170", null, "CE"
        );

        Cliente cliente3 = getOrCreateCliente(
                "85999991003", "123456",
                "Pedro Oliveira", null,
                null, Genero.PREFIRO_NAO_DIZER,
                "Rua Padre Valdevino", "430", "Aldeota",
                "Fortaleza", "60135-040", null, "CE"
        );

        Cliente cliente4 = getOrCreateCliente(
                "85999991004", "123456",
                "Ana Costa", "cliente4@email.com",
                null, Genero.FEMININO,
                "Av. da Universidade", "1550", "Benfica",
                "Fortaleza", "60020-181", "Casa", "CE"
        );

        getOrCreateClienteEmpresa(cliente1, empresa);
        getOrCreateClienteEmpresa(cliente2, empresa);
        getOrCreateClienteEmpresa(cliente3, empresa);
        getOrCreateClienteEmpresa(cliente4, empresa);
    }

    private Cliente getOrCreateCliente(
            String telefone, String senha,
            String nomeCompleto, String email,
            java.time.LocalDate dataNascimento, Genero genero,
            String logradouro, String numero, String bairro,
            String cidade, String cep, String complemento, String uf
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

    // ──────────────────── CATEGORIAS ────────────────────

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

    // ──────────────────── PRODUTOS ────────────────────

    private void inicializarProdutos(Empresa empresa, List<Categoria> categorias) {
        Categoria lanches = categorias.get(0);
        Categoria pizzas = categorias.get(1);
        Categoria massas = categorias.get(2);
        Categoria bebidas = categorias.get(3);
        Categoria sobremesas = categorias.get(4);

        long totalProdutos = produtoRepository.count();
        if (totalProdutos >= 12) return; // já inicializado

        /* ── 1. X-Burger Especial (com variação + opcional) ── */
        criarXBurger(empresa, lanches);

        /* ── 2. Pizza Calabresa (simples, sem variação) ── */
        criarPizzaCalabresa(empresa, pizzas);

        /* ── 3. Pizza Margherita (com opcional de borda) ── */
        criarPizzaMargherita(empresa, pizzas);

        /* ── 4. Macarrão Artesanal (sem variação) ── */
        criarMacarrao(empresa, massas);

        /* ── 5. Lasanha Bolonhesa (com variação) ── */
        criarLasanha(empresa, massas);

        /* ── 6. Refrigerante Lata (simples) ── */
        criarRefrigerante(empresa, bebidas);

        /* ── 7. Suco Natural (com variação de sabor) ── */
        criarSuco(empresa, bebidas);

        /* ── 8. Água Mineral (simples) ── */
        criarAgua(empresa, bebidas);

        /* ── 9. Brownie da Casa (com opcional) ── */
        criarBrownie(empresa, sobremesas);

        /* ── 10. Petit Gâteau (com opcional) ── */
        criarPetitGateau(empresa, sobremesas);

        /* ── 11. Combo Família (produto promocional) ── */
        criarComboFamilia(empresa, lanches);

        /* ── 12. Açaí 300ml (com variações de tamanho + opcionais de cobertura) ── */
        criarAcai(empresa, sobremesas);
    }

    // ─── Produto 1: X-Burger Especial ───

    private void criarXBurger(Empresa empresa, Categoria lanches) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("X-Burger Especial");
        p.setDescricao("Pão brioche, blend artesanal 180g, queijo cheddar, bacon crocante, alface e tomate.");
        p.setPrecoBase(new BigDecimal("24.90"));
        p.setEstoque(120);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(180);
        p.setCategorias(List.of(lanches));

        // Variação de tamanho
        Variacao vP = new Variacao();
        vP.setNome("P — 150g");
        vP.setPreco(new BigDecimal("19.90"));
        vP.setEstoque(120);
        p.getVariacoes().add(vP);
        p.atualizarPrecoMinimo();

        // Grupo: Ponto da Carne
        ProdutoOpcionalGrupo pontoGrupo = new ProdutoOpcionalGrupo();
        pontoGrupo.setNome("Ponto da carne");
        pontoGrupo.setObrigatorio(true);
        pontoGrupo.setMinSelecionaveis(1);
        pontoGrupo.setMaxSelecionaveis(1);
        pontoGrupo.setTipoSelecao(TipoSelecaoOpcional.SINGLE);
        pontoGrupo.setOrdem(1);

        pontoGrupo.getItens().add(makeOpcionalItem("Ao ponto", BigDecimal.ZERO, 1));
        pontoGrupo.getItens().add(makeOpcionalItem("Bem passado", BigDecimal.ZERO, 2));
        pontoGrupo.getItens().add(makeOpcionalItem("Mal passado", BigDecimal.ZERO, 3));

        p.getGruposOpcionais().add(pontoGrupo);

        produtoRepository.save(p);
    }

    // ─── Produto 2: Pizza Calabresa ───

    private void criarPizzaCalabresa(Empresa empresa, Categoria pizzas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Pizza Calabresa");
        p.setDescricao("Calabresa fatiada, cebola roxa, azeitonas pretas, orégano e molho de tomate artesanal.");
        p.setPrecoBase(new BigDecimal("42.90"));
        p.setEstoque(80);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(pizzas));

        // Variação de tamanho
        Variacao m = new Variacao();
        m.setNome("Média — 6 fatias");
        m.setPreco(new BigDecimal("42.90"));
        m.setEstoque(80);
        p.getVariacoes().add(m);

        Variacao g = new Variacao();
        g.setNome("Grande — 8 fatias");
        g.setPreco(new BigDecimal("52.90"));
        g.setEstoque(80);
        p.getVariacoes().add(g);

        Variacao gg = new Variacao();
        gg.setNome("GG — 12 fatias");
        gg.setPreco(new BigDecimal("62.90"));
        gg.setEstoque(60);
        p.getVariacoes().add(gg);

        p.atualizarPrecoMinimo();
        produtoRepository.save(p);
    }

    // ─── Produto 3: Pizza Margherita ───

    private void criarPizzaMargherita(Empresa empresa, Categoria pizzas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Pizza Margherita");
        p.setDescricao("Molho de tomate San Marzano, mussarela de búfala fresca, manjericão e azeite trufado.");
        p.setPrecoBase(new BigDecimal("39.90"));
        p.setEstoque(80);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(pizzas));

        Variacao v = new Variacao("Grande — 8 fatias", new BigDecimal("39.90"), 80, p);
        p.getVariacoes().add(v);
        p.atualizarPrecoMinimo();

        // Opcional: Borda
        ProdutoOpcionalGrupo borda = new ProdutoOpcionalGrupo();
        borda.setNome("Borda recheada");
        borda.setObrigatorio(false);
        borda.setMinSelecionaveis(0);
        borda.setMaxSelecionaveis(1);
        borda.setTipoSelecao(TipoSelecaoOpcional.SINGLE);
        borda.setOrdem(1);

        borda.getItens().add(makeOpcionalItem("Borda de catupiry", new BigDecimal("6.00"), 1));
        borda.getItens().add(makeOpcionalItem("Borda de cheddar", new BigDecimal("6.00"), 2));

        p.getGruposOpcionais().add(borda);
        produtoRepository.save(p);
    }

    // ─── Produto 4: Macarrão Artesanal ───

    private void criarMacarrao(Empresa empresa, Categoria massas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Macarrão Artesanal");
        p.setDescricao("Fettucine fresco com molho bolonhesa da casa, parmesão ralado e ervas finas.");
        p.setPrecoBase(new BigDecimal("29.90"));
        p.setEstoque(60);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setCategorias(List.of(massas));
        produtoRepository.save(p);
    }

    // ─── Produto 5: Lasanha Bolonhesa ───

    private void criarLasanha(Empresa empresa, Categoria massas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Lasanha Bolonhesa");
        p.setDescricao("Camadas generosas de massa fresca, bolonhesa artesanal, bechamel e gratinado de parmesão.");
        p.setPrecoBase(new BigDecimal("34.90"));
        p.setEstoque(50);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(massas));

        Variacao indiv = new Variacao();
        indiv.setNome("Individual");
        indiv.setPreco(new BigDecimal("34.90"));
        indiv.setEstoque(50);
        p.getVariacoes().add(indiv);

        Variacao dupla = new Variacao();
        dupla.setNome("Serve 2 pessoas");
        dupla.setPreco(new BigDecimal("54.90"));
        dupla.setEstoque(40);
        p.getVariacoes().add(dupla);

        Variacao familia = new Variacao();
        familia.setNome("Serve 4 pessoas");
        familia.setPreco(new BigDecimal("79.90"));
        familia.setEstoque(30);
        p.getVariacoes().add(familia);

        p.atualizarPrecoMinimo();
        produtoRepository.save(p);
    }

    // ─── Produto 6: Refrigerante Lata ───

    private void criarRefrigerante(Empresa empresa, Categoria bebidas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Refrigerante Lata");
        p.setDescricao("Refrigerante gelado à sua escolha — 350ml.");
        p.setPrecoBase(new BigDecimal("6.50"));
        p.setEstoque(200);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(bebidas));
        produtoRepository.save(p);
    }

    // ─── Produto 7: Suco Natural ───

    private void criarSuco(Empresa empresa, Categoria bebidas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Suco Natural");
        p.setDescricao("Suco natural da fruta, feito na hora — 400ml.");
        p.setPrecoBase(new BigDecimal("9.90"));
        p.setEstoque(150);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(bebidas));

        Variacao laranja = new Variacao("Laranja", new BigDecimal("9.90"), 150, p);
        Variacao limao = new Variacao("Limão", new BigDecimal("9.90"), 150, p);
        Variacao maracuja = new Variacao("Maracujá", new BigDecimal("10.90"), 100, p);
        Variacao abacaxi = new Variacao("Abacaxi com hortelã", new BigDecimal("10.90"), 100, p);

        p.getVariacoes().addAll(List.of(laranja, limao, maracuja, abacaxi));
        p.atualizarPrecoMinimo();
        produtoRepository.save(p);
    }

    // ─── Produto 8: Água Mineral ───

    private void criarAgua(Empresa empresa, Categoria bebidas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Água Mineral");
        p.setDescricao("Água sem gás — 500ml.");
        p.setPrecoBase(new BigDecimal("3.50"));
        p.setEstoque(500);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(bebidas));
        produtoRepository.save(p);
    }

    // ─── Produto 9: Brownie da Casa ───

    private void criarBrownie(Empresa empresa, Categoria sobremesas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Brownie da Casa");
        p.setDescricao("Brownie de chocolate belga com nozes, úmido por dentro e crocante por fora.");
        p.setPrecoBase(new BigDecimal("11.90"));
        p.setEstoque(70);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setCategorias(List.of(sobremesas));

        // Opcional: Cobertura
        ProdutoOpcionalGrupo cobertura = new ProdutoOpcionalGrupo();
        cobertura.setNome("Cobertura extra");
        cobertura.setObrigatorio(false);
        cobertura.setMinSelecionaveis(0);
        cobertura.setMaxSelecionaveis(3);
        cobertura.setTipoSelecao(TipoSelecaoOpcional.MULTIPLE);
        cobertura.setOrdem(1);

        cobertura.getItens().add(makeOpcionalItem("Calda de chocolate", new BigDecimal("3.50"), 1));
        cobertura.getItens().add(makeOpcionalItem("Creme de leite ninho", new BigDecimal("4.00"), 2));
        cobertura.getItens().add(makeOpcionalItem("Sorvete de baunilha", new BigDecimal("5.00"), 3));

        p.getGruposOpcionais().add(cobertura);
        produtoRepository.save(p);
    }

    // ─── Produto 10: Petit Gâteau ───

    private void criarPetitGateau(Empresa empresa, Categoria sobremesas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Petit Gâteau");
        p.setDescricao("Bolo de chocolate com recheio cremoso, servido com sorvete de creme e frutas vermelhas.");
        p.setPrecoBase(new BigDecimal("16.90"));
        p.setEstoque(50);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setCategorias(List.of(sobremesas));
        produtoRepository.save(p);
    }

    // ─── Produto 11: Combo Família (promocional) ───

    private void criarComboFamilia(Empresa empresa, Categoria lanches) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Combo Família");
        p.setDescricao("2 pizzas grandes + 1 refrigerante 2L + 1 sobremesa do dia. Economia de até 30%.");
        p.setPrecoBase(new BigDecimal("139.90"));
        p.setEstoque(30);
        p.setAtivo(true);
        p.setEmOferta(true);
        p.setTipoDesconto(TipoDescontoPromocao.PERCENTUAL);
        p.setValorDesconto(new BigDecimal("20"));
        p.setTituloOferta("20% OFF Combo Família!");
        p.setInicioOferta(LocalDateTime.now().minusDays(1));
        p.setFimOferta(LocalDateTime.now().plusDays(30));
        p.setPermiteObservacao(true);
        p.setCategorias(List.of(lanches));
        produtoRepository.save(p);
    }

    // ─── Produto 12: Açaí 300ml ───

    private void criarAcai(Empresa empresa, Categoria sobremesas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Açaí");
        p.setDescricao("Açaí cremoso da Amazônia com granola, banana e leite condensado.");
        p.setPrecoBase(new BigDecimal("14.90"));
        p.setEstoque(100);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setCategorias(List.of(sobremesas));

        // Variação de tamanho
        Variacao v300 = new Variacao();
        v300.setNome("300ml");
        v300.setPreco(new BigDecimal("14.90"));
        v300.setEstoque(100);
        p.getVariacoes().add(v300);

        Variacao v400 = new Variacao();
        v400.setNome("400ml");
        v400.setPreco(new BigDecimal("18.90"));
        v400.setEstoque(80);
        p.getVariacoes().add(v400);

        Variacao v500 = new Variacao();
        v500.setNome("500ml");
        v500.setPreco(new BigDecimal("22.90"));
        v500.setEstoque(60);
        p.getVariacoes().add(v500);

        p.atualizarPrecoMinimo();

        // Opcional: Coberturas
        ProdutoOpcionalGrupo coberturas = new ProdutoOpcionalGrupo();
        coberturas.setNome("Coberturas extras");
        coberturas.setObrigatorio(false);
        coberturas.setMinSelecionaveis(0);
        coberturas.setMaxSelecionaveis(5);
        coberturas.setTipoSelecao(TipoSelecaoOpcional.MULTIPLE);
        coberturas.setTipoGrupo(TipoGrupoProduto.OPCIONAL_SELECAO);
        coberturas.setOrdem(1);

        coberturas.getItens().add(makeOpcionalItem("Leite Ninho", new BigDecimal("4.00"), 1));
        coberturas.getItens().add(makeOpcionalItem("Morango", new BigDecimal("3.00"), 2));
        coberturas.getItens().add(makeOpcionalItem("Paçoca", new BigDecimal("2.00"), 3));
        coberturas.getItens().add(makeOpcionalItem("Granola extra", new BigDecimal("1.50"), 4));
        coberturas.getItens().add(makeOpcionalItem("Mel", new BigDecimal("1.50"), 5));

        p.getGruposOpcionais().add(coberturas);

        produtoRepository.save(p);
    }

    // ─── Categorias Burger King Dom ───

    private List<Categoria> criarCategoriasBurger(Empresa empresa) {
        List<Categoria> existentes = categoriaRepository.findByEmpresaId(empresa.getId());
        if (!existentes.isEmpty()) return existentes;

        List<Categoria> categorias = List.of(
                new Categoria("Burgers", empresa),
                new Categoria("Batatas Fritas", empresa),
                new Categoria("Milkshakes", empresa),
                new Categoria("Combos", empresa)
        );

        return categoriaRepository.saveAll(categorias);
    }

    // ─── Produtos Burger King Dom ───

    private void inicializarProdutosBurger(Empresa empresa, List<Categoria> categorias) {
        Categoria burgers = categorias.get(0);
        Categoria batatas = categorias.get(1);
        Categoria shakes = categorias.get(2);
        Categoria combos = categorias.get(3);

        long existentes = produtoRepository.findByEmpresaId(empresa.getId(), org.springframework.data.domain.PageRequest.of(0, 100)).getTotalElements();
        if (existentes >= 8) return;

        criarSmashBurgerDuplo(empresa, burgers);
        criarBurgerChickenCrispy(empresa, burgers);
        criarBaconMasterBurger(empresa, burgers);
        criarVeggieBurger(empresa, burgers);
        criarBatataCheddarBacon(empresa, batatas);
        criarBatataParmegiana(empresa, batatas);
        criarMilkshakeNutella(empresa, shakes);
        criarComboSmash(empresa, combos);
    }

    private void criarSmashBurgerDuplo(Empresa empresa, Categoria burgers) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Smash Burger Duplo");
        p.setDescricao("Dois smash de 90g, queijo cheddar derretido, picles, cebola caramelizada e molho especial da casa no pão brioche.");
        p.setPrecoBase(new BigDecimal("29.90"));
        p.setEstoque(100);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(180);
        p.setCategorias(List.of(burgers));

        Variacao simples = new Variacao("Simples", new BigDecimal("24.90"), 100, p);
        Variacao duplo = new Variacao("Duplo", new BigDecimal("29.90"), 100, p);
        Variacao triplo = new Variacao("Triplo", new BigDecimal("36.90"), 80, p);
        p.getVariacoes().addAll(List.of(simples, duplo, triplo));
        p.atualizarPrecoMinimo();

        ProdutoOpcionalGrupo adicionais = new ProdutoOpcionalGrupo();
        adicionais.setNome("Adicionais");
        adicionais.setObrigatorio(false);
        adicionais.setMinSelecionaveis(0);
        adicionais.setMaxSelecionaveis(4);
        adicionais.setTipoSelecao(TipoSelecaoOpcional.MULTIPLE);
        adicionais.setOrdem(1);

        adicionais.getItens().add(makeOpcionalItem("Bacon extra", new BigDecimal("4.00"), 1));
        adicionais.getItens().add(makeOpcionalItem("Cheddar extra", new BigDecimal("3.50"), 2));
        adicionais.getItens().add(makeOpcionalItem("Ovo", new BigDecimal("2.50"), 3));
        adicionais.getItens().add(makeOpcionalItem("Cebola crispy", new BigDecimal("3.00"), 4));
        p.getGruposOpcionais().add(adicionais);

        produtoRepository.save(p);
    }

    private void criarBurgerChickenCrispy(Empresa empresa, Categoria burgers) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Chicken Crispy Burger");
        p.setDescricao("Frango empanado crocante, maionese de ervas finas, alface crespa e tomate no pão de gergelim.");
        p.setPrecoBase(new BigDecimal("26.90"));
        p.setEstoque(90);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(150);
        p.setCategorias(List.of(burgers));
        produtoRepository.save(p);
    }

    private void criarBaconMasterBurger(Empresa empresa, Categoria burgers) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Bacon Master Burger");
        p.setDescricao("Blend 200g, muito bacon crocante, onion rings, cheddar fundido e molho barbecue defumado.");
        p.setPrecoBase(new BigDecimal("34.90"));
        p.setEstoque(70);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(180);
        p.setCategorias(List.of(burgers));
        produtoRepository.save(p);
    }

    private void criarVeggieBurger(Empresa empresa, Categoria burgers) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Veggie Burger");
        p.setDescricao("Hambúrguer de grão-de-bico e cogumelos, rúcula, tomate seco, cream cheese vegano no pão integral.");
        p.setPrecoBase(new BigDecimal("27.90"));
        p.setEstoque(60);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(180);
        p.setCategorias(List.of(burgers));
        produtoRepository.save(p);
    }

    private void criarBatataCheddarBacon(Empresa empresa, Categoria batatas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Batata Cheddar & Bacon");
        p.setDescricao("Batatas fritas crocantes cobertas com cheddar cremoso e bacon crocante.");
        p.setPrecoBase(new BigDecimal("18.90"));
        p.setEstoque(150);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(batatas));

        Variacao p1 = new Variacao("Pessoa", new BigDecimal("18.90"), 150, p);
        Variacao p2 = new Variacao("Pessoas", new BigDecimal("28.90"), 100, p);
        Variacao p4 = new Variacao("4+ Pessoas", new BigDecimal("39.90"), 60, p);
        p.getVariacoes().addAll(List.of(p1, p2, p4));
        p.atualizarPrecoMinimo();
        produtoRepository.save(p);
    }

    private void criarBatataParmegiana(Empresa empresa, Categoria batatas) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Batata Parmegiana");
        p.setDescricao("Batatas fritas com molho de tomate caseiro, mussarela gratinada e manjericão fresco.");
        p.setPrecoBase(new BigDecimal("22.90"));
        p.setEstoque(120);
        p.setAtivo(true);
        p.setPermiteObservacao(false);
        p.setCategorias(List.of(batatas));
        produtoRepository.save(p);
    }

    private void criarMilkshakeNutella(Empresa empresa, Categoria shakes) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Milkshake Nutella");
        p.setDescricao("Milkshake cremoso de Nutella com chantilly e calda de chocolate belga.");
        p.setPrecoBase(new BigDecimal("19.90"));
        p.setEstoque(100);
        p.setAtivo(true);
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(150);
        p.setCategorias(List.of(shakes));

        Variacao v300 = new Variacao("300ml", new BigDecimal("19.90"), 100, p);
        Variacao v400 = new Variacao("400ml", new BigDecimal("24.90"), 80, p);
        Variacao v500 = new Variacao("500ml", new BigDecimal("29.90"), 50, p);
        p.getVariacoes().addAll(List.of(v300, v400, v500));
        p.atualizarPrecoMinimo();
        produtoRepository.save(p);
    }

    private void criarComboSmash(Empresa empresa, Categoria combos) {
        Produto p = new Produto();
        p.setEmpresa(empresa);
        p.setNome("Combo Smash Duplo");
        p.setDescricao("Smash Burger Duplo + Batata Cheddar & Bacon + Milkshake 300ml. Economia de 15%.");
        p.setPrecoBase(new BigDecimal("55.90"));
        p.setEstoque(50);
        p.setAtivo(true);
        p.setEmOferta(true);
        p.setTipoDesconto(TipoDescontoPromocao.PERCENTUAL);
        p.setValorDesconto(new BigDecimal("15"));
        p.setTituloOferta("15% OFF Combo Smash!");
        p.setInicioOferta(LocalDateTime.now().minusDays(3));
        p.setFimOferta(LocalDateTime.now().plusDays(30));
        p.setPermiteObservacao(true);
        p.setMaxObservacaoChars(150);
        p.setCategorias(List.of(combos));
        produtoRepository.save(p);
    }

    // ─── Cupons Burger King Dom ───

    private void criarCuponsBurger(Empresa empresa) {
        if (cupomRepository.findByEmpresaId(empresa.getId()).size() >= 3) return;

        Cupom cupomPct = new Cupom();
        cupomPct.setEmpresa(empresa);
        cupomPct.setCodigo("BURGER15");
        cupomPct.setNome("Desconto Burger");
        cupomPct.setDescricao("15% OFF em qualquer pedido");
        cupomPct.setAtivo(true);
        cupomPct.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
        cupomPct.setValorDesconto(new BigDecimal("15"));
        cupomPct.setValorMaximoDesconto(new BigDecimal("20"));
        cupomPct.setValorMinimoPedido(new BigDecimal("40"));
        cupomPct.setApenasPrimeiraCompra(false);
        cupomPct.setLimiteUsoTotal(200);
        cupomPct.setLimiteUsoPorUsuario(3);
        cupomPct.setTotalUsado(0);
        cupomPct.setDataInicio(LocalDateTime.now());
        cupomPct.setDataFim(LocalDateTime.now().plusMonths(6));
        cupomRequestValidateFields(cupomPct);
        cupomRepository.save(cupomPct);

        Cupom cupomFrete = new Cupom();
        cupomFrete.setEmpresa(empresa);
        cupomFrete.setCodigo("FRETEFREE");
        cupomFrete.setNome("Frete Grátis");
        cupomFrete.setDescricao("Frete grátis para pedidos acima de R$ 60");
        cupomFrete.setAtivo(true);
        cupomFrete.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
        cupomFrete.setValorDesconto(new BigDecimal("100"));
        cupomFrete.setValorMaximoDesconto(new BigDecimal("10"));
        cupomFrete.setValorMinimoPedido(new BigDecimal("60"));
        cupomFrete.setFreteGratis(true);
        cupomFrete.setLimiteUsoTotal(null);
        cupomFrete.setLimiteUsoPorUsuario(null);
        cupomFrete.setTotalUsado(0);
        cupomFrete.setDataInicio(LocalDateTime.now());
        cupomFrete.setDataFim(LocalDateTime.now().plusMonths(4));
        cupomRequestValidateFields(cupomFrete);
        cupomRepository.save(cupomFrete);

        Cupom cupomFixo = new Cupom();
        cupomFixo.setEmpresa(empresa);
        cupomFixo.setCodigo("KING20");
        cupomFixo.setNome("R$ 20 OFF");
        cupomFixo.setDescricao("R$ 20 de desconto em pedidos acima de R$ 80");
        cupomFixo.setAtivo(true);
        cupomFixo.setTipoDesconto(TipoCupomDesconto.VALOR_FIXO);
        cupomFixo.setValorDesconto(new BigDecimal("20"));
        cupomFixo.setValorMinimoPedido(new BigDecimal("80"));
        cupomFixo.setLimiteUsoTotal(100);
        cupomFixo.setLimiteUsoPorUsuario(2);
        cupomFixo.setTotalUsado(0);
        cupomFixo.setDataInicio(LocalDateTime.now());
        cupomFixo.setDataFim(LocalDateTime.now().plusMonths(3));
        cupomRequestValidateFields(cupomFixo);
        cupomRepository.save(cupomFixo);
    }

    // ─── Helper: Criar item opcional ───

    private ProdutoOpcionalItem makeOpcionalItem(String nome, BigDecimal precoExtra, int ordem) {
        ProdutoOpcionalItem item = new ProdutoOpcionalItem();
        item.setNome(nome);
        item.setPrecoExtra(precoExtra);
        item.setAtivo(true);
        item.setOrdem(ordem);
        return item;
    }

    // ──────────────────── CUPONS ────────────────────

    private void criarCupons(Empresa empresa) {
        if (cupomRepository.findByEmpresaId(empresa.getId()).size() >= 3) return;

        // 1. Cupom percentual
        Cupom cupomPct = new Cupom();
        cupomPct.setEmpresa(empresa);
        cupomPct.setCodigo("BEMVINDO10");
        cupomPct.setNome("Boas-vindas");
        cupomPct.setDescricao("10% de desconto no primeiro pedido");
        cupomPct.setAtivo(true);
        cupomPct.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
        cupomPct.setValorDesconto(new BigDecimal("10"));
        cupomPct.setValorMaximoDesconto(new BigDecimal("15"));
        cupomPct.setValorMinimoPedido(new BigDecimal("30"));
        cupomPct.setApenasPrimeiraCompra(true);
        cupomPct.setLimiteUsoTotal(100);
        cupomPct.setLimiteUsoPorUsuario(1);
        cupomPct.setTotalUsado(0);
        cupomPct.setDataInicio(LocalDateTime.now());
        cupomPct.setDataFim(LocalDateTime.now().plusMonths(6));
        cupomRequestValidateFields(cupomPct);
        cupomRepository.save(cupomPct);

        // 2. Cupom frete grátis
        Cupom cupomFrete = new Cupom();
        cupomFrete.setEmpresa(empresa);
        cupomFrete.setCodigo("FRETEGRATIS");
        cupomFrete.setNome("Frete Grátis");
        cupomFrete.setDescricao("Frete grátis para pedidos a partir de R$ 50");
        cupomFrete.setAtivo(true);
        cupomFrete.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
        cupomFrete.setValorDesconto(new BigDecimal("100"));
        cupomFrete.setValorMaximoDesconto(new BigDecimal("15"));
        cupomFrete.setValorMinimoPedido(new BigDecimal("50"));
        cupomFrete.setFreteGratis(true);
        cupomFrete.setLimiteUsoTotal(null);
        cupomFrete.setLimiteUsoPorUsuario(null);
        cupomFrete.setTotalUsado(0);
        cupomFrete.setDataInicio(LocalDateTime.now());
        cupomRequestValidateFields(cupomFrete);
        cupomRepository.save(cupomFrete);

        // 3. Cupom valor fixo
        Cupom cupomFixo = new Cupom();
        cupomFixo.setEmpresa(empresa);
        cupomFixo.setCodigo("DESCONTO10");
        cupomFixo.setNome("R$ 10 OFF");
        cupomFixo.setDescricao("Desconto fixo de R$ 10 no pedido");
        cupomFixo.setAtivo(true);
        cupomFixo.setTipoDesconto(TipoCupomDesconto.VALOR_FIXO);
        cupomFixo.setValorDesconto(new BigDecimal("10"));
        cupomFixo.setValorMinimoPedido(new BigDecimal("60"));
        cupomFixo.setLimiteUsoTotal(50);
        cupomFixo.setLimiteUsoPorUsuario(2);
        cupomFixo.setTotalUsado(0);
        cupomFixo.setDataInicio(LocalDateTime.now());
        cupomFixo.setDataFim(LocalDateTime.now().plusMonths(3));
        cupomRequestValidateFields(cupomFixo);
        cupomRepository.save(cupomFixo);

        // 4. Cupom percentual
        Cupom cupom99 = new Cupom();
        cupom99.setEmpresa(empresa);
        cupom99.setCodigo("100");
        cupom99.setNome("Boas-vindas");
        cupom99.setDescricao("100% de desconto no primeiro pedido");
        cupom99.setAtivo(true);
        cupom99.setTipoDesconto(TipoCupomDesconto.PERCENTUAL);
        cupom99.setValorDesconto(new BigDecimal("100"));
        cupom99.setValorMaximoDesconto(new BigDecimal("18.9"));
        cupom99.setApenasPrimeiraCompra(false);
        cupom99.setLimiteUsoTotal(100);
        cupom99.setLimiteUsoPorUsuario(1);
        cupom99.setTotalUsado(0);
        cupom99.setDataInicio(LocalDateTime.now());
        cupom99.setDataFim(LocalDateTime.now().plusMonths(6));
        cupomRequestValidateFields(cupom99);
        cupomRepository.save(cupom99);
    }

    /**
     * Helper para preencher campos null obrigatórios do Cupom.
     */
    private void cupomRequestValidateFields(Cupom cupom) {
        // Campos boolean que podem ser null
        if (cupom.getApenasPrimeiraCompra() == null) cupom.setApenasPrimeiraCompra(false);
        if (cupom.getApenasNovoUsuario() == null) cupom.setApenasNovoUsuario(false);
        if (cupom.getAplicaEmItensPromocionais() == null) cupom.setAplicaEmItensPromocionais(true);
        if (cupom.getFreteGratis() == null) cupom.setFreteGratis(false);
    }

    // ──────────────────── PEDIDOS FAKES ────────────────────

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
            int sorteio = randomInt(1, 100);
            if (sorteio <= 40) tipoPagamento = TipoPagamento.PIX;
            else if (sorteio <= 70) tipoPagamento = TipoPagamento.CREDIT_CARD;
            else tipoPagamento = TipoPagamento.PAY_ON_DELIVERY;

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
            }

            configurarPagamentoFake(pedido);
            criarItensFake(pedido, produtos);

            definirStatusFake(pedido);
            Pedido salvo = pedidoRepository.save(pedido);

            // Atualiza stats do cliente-empresa
            ClienteEmpresa ce = clienteEmpresaRepository
                    .findByClienteIdAndEmpresaId(cliente.getId(), empresa.getId())
                    .orElse(null);
            if (ce != null) {
                ce.setTotalPedidos((ce.getTotalPedidos() != null ? ce.getTotalPedidos() : 0) + 1);
                ce.setTotalGasto(
                        (ce.getTotalGasto() != null ? ce.getTotalGasto() : BigDecimal.ZERO)
                                .add(salvo.getTotal() != null ? salvo.getTotal() : BigDecimal.ZERO));
                ce.setUltimoPedidoEm(salvo.getData());
                clienteEmpresaRepository.save(ce);
            }
        }

        System.out.println("[ProdutoInitializer] " + pedidoRepository.count() + " pedidos criados no total.");
    }

    private void criarItensFake(Pedido pedido, List<Produto> produtos) {
        int numItens = randomInt(1, 3);
        List<ItemPedido> itens = new ArrayList<>();

        for (int j = 0; j < numItens; j++) {
            Produto produto = produtos.get(randomInt(0, produtos.size() - 1));

            // Escolhe variação se existir
            Variacao variacao = null;
            BigDecimal precoUnitario = produto.getPrecoBase();
            if (produto.getVariacoes() != null && !produto.getVariacoes().isEmpty()) {
                variacao = produto.getVariacoes().get(randomInt(0, produto.getVariacoes().size() - 1));
                precoUnitario = variacao.getPreco() != null ? variacao.getPreco() : produto.getPrecoBase();
            }

            int quantidade = randomInt(1, 2);
            ItemPedido item = new ItemPedido();
            item.setProduto(produto);
            item.setNomeProduto(produto.getNome());
            item.setQuantidade(quantidade);
            item.setPrecoUnitario(precoUnitario);
            item.setImagemUrl(produto.getImagemUrl());
            item.setVariacao(variacao);

            // Observação aleatória
            if (produto.isPermiteObservacao() && randomInt(1, 100) <= 25) {
                item.setObservacao("Sem cebola / molho à parte");
            }

            // Adiciona opcionais se o produto tem grupos e o item for selecionado
            if (!produto.getGruposOpcionais().isEmpty() && randomInt(1, 100) <= 40) {
                for (ProdutoOpcionalGrupo grupo : produto.getGruposOpcionais()) {
                    if (grupo.isObrigatorio() || randomInt(1, 100) <= 50) {
                        // Escolhe 1 item obrigatório ou 1-2 opcionais aleatórios
                        int numSelecionados = grupo.isObrigatorio() ? 1 : (grupo.getTipoSelecao() == TipoSelecaoOpcional.MULTIPLE ? randomInt(1, Math.min(2, grupo.getItens().size())) : 1);
                        for (int k = 0; k < numSelecionados && k < grupo.getItens().size(); k++) {
                            ProdutoOpcionalItem opcItem = grupo.getItens().get(k);
                            ItemPedidoOpcional itemOpcional = new ItemPedidoOpcional();
                            itemOpcional.setOpcionalItemId(opcItem.getId());
                            itemOpcional.setNome(opcItem.getNome());
                            itemOpcional.setPrecoExtra(opcItem.getPrecoExtra());
                            itemOpcional.setQuantidade(1);
                            itemOpcional.setTipo(TipoItemPedidoOpcional.OPCIONAL_SELECAO);
                            itemOpcional.setGrupoId(grupo.getId());
                            itemOpcional.setGrupoNome(grupo.getNome());
                            item.addOpcional(itemOpcional);
                        }
                    }
                }
            }

            itens.add(item);
        }

        pedido.setItens(itens);

        BigDecimal subtotal = itens.stream()
                .map(ItemPedido::getTotalItem)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        pedido.setSubtotal(subtotal);
        pedido.setDescontoCupom(BigDecimal.ZERO);
        pedido.setCupomCodigo(null);

        BigDecimal frete = BigDecimal.valueOf(pedido.getValorFrete() != null ? pedido.getValorFrete() : 0.0);
        pedido.setTotal(subtotal.add(frete));
    }

    private void configurarPagamentoFake(Pedido pedido) {
        pedido.setPagamentoNaEntrega(null);
        pedido.setMpStatus(null);
        pedido.setMpPaymentId(null);
        pedido.setPaymentProvider(null);
        pedido.setStripeSessionId(null);

        if (pedido.getTipoPagamento() == TipoPagamento.PAY_ON_DELIVERY) {
            PagamentoNaEntrega pne = new PagamentoNaEntrega();
            int s = randomInt(1, 100);
            if (s <= 50) {
                pne.setMetodo(MetodoPagamentoNaEntrega.CASH);
                pne.setPrecisaTroco(randomInt(1, 100) <= 35);
                pne.setTrocoPara(Boolean.TRUE.equals(pne.getPrecisaTroco()) ? new BigDecimal("100.00") : null);
            } else if (s <= 75) {
                pne.setMetodo(MetodoPagamentoNaEntrega.DEBIT_CARD);
                pne.setPrecisaTroco(false);
            } else {
                pne.setMetodo(MetodoPagamentoNaEntrega.CREDIT_CARD);
                pne.setPrecisaTroco(false);
            }
            pedido.setPagamentoNaEntrega(pne);
            return;
        }

        if (pedido.getTipoPagamento() == TipoPagamento.PIX) {
            pedido.setPaymentProvider("MERCADO_PAGO");
            pedido.setMpPaymentId("MP-" + System.nanoTime());
            pedido.setMpStatus("approved");
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
            if (chance <= 15) pedido.setStatus(StatusPedido.RECEBIDO);
            else if (chance <= 35) pedido.setStatus(StatusPedido.EM_PREPARO);
            else if (chance <= 55) pedido.setStatus(StatusPedido.PRONTO);
            else if (chance <= 75) pedido.setStatus(StatusPedido.AGUARDANDO_RETIRADA);
            else if (chance <= 90) pedido.setStatus(StatusPedido.RETIRADO);
            else {
                pedido.setStatus(StatusPedido.CANCELADO);
                pedido.setStatusPagamento(StatusPagamento.CANCELADO);
                return;
            }
            pedido.setStatusPagamento(resolvePagamento(pedido));
            return;
        }

        if (chance <= 20) pedido.setStatus(StatusPedido.RECEBIDO);
        else if (chance <= 45) pedido.setStatus(StatusPedido.EM_PREPARO);
        else if (chance <= 65) pedido.setStatus(StatusPedido.PRONTO);
        else if (chance <= 82) pedido.setStatus(StatusPedido.SAIU_PARA_ENTREGA);
        else if (chance <= 95) pedido.setStatus(StatusPedido.ENTREGUE);
        else {
            pedido.setStatus(StatusPedido.CANCELADO);
            pedido.setStatusPagamento(StatusPagamento.CANCELADO);
            return;
        }
        pedido.setStatusPagamento(resolvePagamento(pedido));
    }

    private StatusPagamento resolvePagamento(Pedido pedido) {
        if (pedido.getTipoPagamento() == TipoPagamento.PIX
                || pedido.getTipoPagamento() == TipoPagamento.CREDIT_CARD) {
            return StatusPagamento.APROVADO;
        }
        return StatusPagamento.PENDENTE;
    }

    private LocalDateTime gerarDataPedidoFake() {
        int minutosAtras = randomInt(5, 120);
        return LocalDateTime.now()
                .minusMinutes(minutosAtras);
    }

    private int randomInt(int min, int max) {
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }
}