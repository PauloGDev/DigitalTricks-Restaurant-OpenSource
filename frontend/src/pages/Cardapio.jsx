import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import PageTitle from "../context/PageTitle";
import { useCarrinho } from "../context/CarrinhoContext";
import { useNotification } from "../context/NotificationContext";
import { XCircle, Gift } from "lucide-react";
import ProdutoCard from "./Produtos/ProdutoCard";

import { MOCK_CATEGORIAS, mockListarFiltroShop } from "../mock/mockCardapio";

import CategorySelector from "../components/cardapio/CategorySelector";
import MobileBottomNav from "../components/cardapio/MobileBottomNav";
import DesktopTopNav from "../components/Cardapio/DesktopTopNav";
import OfertasModal from "../components/Cardapio/OfertasModal";
import PedidosRestauranteModal from "../components/Cardapio/PedidosRestauranteModal";
import OfertasCarousel from "../components/cardapio/OfertasCarousel";
import RestaurantHero from "../components/Cardapio/RestaurantHero";
import CarrinhoPopup from "../context/CarrinhoPopup";
import FidelidadeModal from "../components/Cardapio/FidelidadeModal";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.03 } },
  exit: { opacity: 0 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

const OFFSET_TOP = 180;

const scrollToRef = (ref, offset = OFFSET_TOP) => {
  const el = ref?.current;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
};

const buildEmptyState = (cats) =>
  (cats || []).reduce((acc, cat) => {
    acc[cat] = {
      items: [],
      page: 0,
      hasMore: true,
      loading: false,
      error: null,
    };
    return acc;
  }, {});

const normalizeProduto = (p) => ({
  ...p,
  variacoes: Array.isArray(p?.variacoes) ? p.variacoes : [],
  gruposOpcionais: Array.isArray(p?.gruposOpcionais) ? p.gruposOpcionais : [],
  categorias: Array.isArray(p?.categorias) ? p.categorias.filter(Boolean) : [],
  permiteObservacao: Boolean(p?.permiteObservacao),
  maxObservacaoChars: Number.isFinite(p?.maxObservacaoChars)
    ? p.maxObservacaoChars
    : 0,
});

const normalizeList = (arr) =>
  Array.isArray(arr) ? arr.map(normalizeProduto) : [];

const buildParamsSerializer = (params) => {
  const usp = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          usp.append(key, String(item));
        }
      });
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      usp.append(key, String(value));
    }
  });

  return usp.toString();
};

const parseMoney = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return value;

  const raw = String(value).trim();
  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw.replace(/[^\d,.-]/g, "");

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMenorPrecoVariacao = (produto) => {
  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];

  const precos = variacoes
    .map((v) =>
      parseMoney(
        v?.precoPromocional ??
          v?.precoOferta ??
          v?.promocaoPreco ??
          v?.preco ??
          v?.precoBase ??
          0
      )
    )
    .filter((v) => v > 0);

  return precos.length ? Math.min(...precos) : 0;
};

const getPreco = (produto) => {
  const precoDireto = parseMoney(
    produto?.preco ??
      produto?.precoBase ??
      produto?.precoMinimo ??
      produto?.valor ??
      produto?.precoVenda ??
      0
  );

  if (precoDireto > 0) return precoDireto;

  return getMenorPrecoVariacao(produto);
};

const getPrecoPromocional = (produto) => {
  const promocionalDireto = parseMoney(
    produto?.precoPromocional ??
      produto?.valorPromocional ??
      produto?.precoOferta ??
      produto?.promocaoPreco ??
      0
  );

  if (promocionalDireto > 0) return promocionalDireto;

  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];

  const promocionais = variacoes
    .map((v) =>
      parseMoney(v?.precoPromocional ?? v?.precoOferta ?? v?.promocaoPreco ?? 0)
    )
    .filter((v) => v > 0);

  return promocionais.length ? Math.min(...promocionais) : 0;
};

const Cardapio = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const USE_MOCK = String(import.meta.env.VITE_USE_MOCK) === "true";

  const api = useMemo(() => {
    const baseURL = (API_URL || "").replace(/\/$/, "");
    return axios.create({ baseURL });
  }, [API_URL]);

  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();

  const { showNotification } = useNotification();
  const { adicionarAoCarrinho } = useCarrinho();

  const paramsUrl = new URLSearchParams(location.search);
  const categoriaInicial = paramsUrl.get("categoria");

  const [restaurante, setRestaurante] = useState(null);
  const [restauranteErro, setRestauranteErro] = useState(false);

  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [categoriaAtual, setCategoriaAtual] = useState(categoriaInicial || "");
  const [loadingInicial, setLoadingInicial] = useState(true);

  const [filtros, setFiltros] = useState({
    search: "",
    ordenarPor: "maisVendidos",
  });

  const [batchSize, setBatchSize] = useState(12);
  const [porCategoria, setPorCategoria] = useState({});
  const porCategoriaRef = useRef({});

  const [searchList, setSearchList] = useState([]);
  const [searchPage, setSearchPage] = useState(0);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);

  const [showOfertas, setShowOfertas] = useState(false);
  const [showPedidos, setShowPedidos] = useState(false);
  const [showFidelidade, setShowFidelidade] = useState(false);
  const [fidelidade, setFidelidade] = useState({ pontos: 0, totalPedidos: 0, totalGasto: 0 });

  // Fechar modal anterior quando outro abre
  useEffect(() => {
    if (showOfertas) { setShowPedidos(false); setShowFidelidade(false); }
  }, [showOfertas]);

  useEffect(() => {
    if (showPedidos) { setShowOfertas(false); setShowFidelidade(false); }
  }, [showPedidos]);

  useEffect(() => {
    if (showFidelidade) { setShowOfertas(false); setShowPedidos(false); }
  }, [showFidelidade]);

  const cancelSearch = useRef(null);
  const cancelByCat = useRef({});
  const sectionEls = useRef({});
  const sentinels = useRef({});
  const searchSentinelRef = useRef(null);

  const isSearchMode = (filtros.search || "").trim().length > 0;

  useEffect(() => {
    porCategoriaRef.current = porCategoria;
  }, [porCategoria]);

  const restauranteFallback = {
    nome: "Restaurante",
    capa:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    logo:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=300&auto=format&fit=crop",
    slug: slug || "",
    avaliacao: 4.8,
    tempoEntrega: "25-40 min",
    taxaEntrega: "R$ 6,99",
    horariosFuncionamento: null,
    abertoAgora: true,
    horarios: [],
    categorias: [],
  };

  const restauranteView = {
    ...restauranteFallback,
    ...(restaurante || {}),
    categorias: categoriasDisponiveis,
  };

  const categoriasVisiveis = useMemo(
    () => categoriasDisponiveis,
    [categoriasDisponiveis]
  );

const produtosEmOferta = useMemo(() => {
  const todos = Object.values(porCategoria || {}).flatMap(
    (sec) => sec?.items || []
  );

  const unicos = Array.from(new Map(todos.map((p) => [p.id, p])).values());

  return unicos
    .filter((p) => {
      const preco = getPreco(p);
      const promocional = getPrecoPromocional(p);

      return (
        p?.ofertaVigente === true ||
        p?.emOferta === true ||
        (preco > 0 && promocional > 0 && promocional < preco)
      );
    })
    .slice(0, 12);
}, [porCategoria]);

  useEffect(() => {
    const update = () => setBatchSize(window.innerWidth < 768 ? 8 : 12);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const fetchEnderecoPadrao = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setEnderecoSelecionado(null);
          return;
        }

        const res = await api.get("/enderecos/me/padrao", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEnderecoSelecionado(res.data || null);
      } catch (err) {
        console.error("Erro ao carregar endereço padrão:", err);
        setEnderecoSelecionado(null);
      }
    };

    fetchEnderecoPadrao();
  }, [api]);

  const fetchFidelidade = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token || !slug) return;

    const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const apiUrl = base.endsWith("/api") ? base : `${base}/api`;

    axios
      .get(`${apiUrl}/restaurantes/${slug}/pedidos/fidelidade`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setFidelidade(res.data || { pontos: 0, totalPedidos: 0, totalGasto: 0 }))
      .catch(() => setFidelidade({ pontos: 0, totalPedidos: 0, totalGasto: 0 }));
  }, [slug]);

  useEffect(() => {
    fetchFidelidade();
  }, [fetchFidelidade]);

  const fetchRestaurante = useCallback(async () => {
    try {
      setRestauranteErro(false);

      if (!USE_MOCK && !slug) {
        setRestauranteErro(true);
        showNotification("Restaurante não identificado.", "error");
        return;
      }

      if (USE_MOCK) {
        setRestaurante(restauranteFallback);
        return;
      }

      const res = await api.get(`/public/restaurantes/${slug}`);
      const data = res.data || {};

      setRestaurante({
  id: data.id,
  nome: data.nomeFantasia || "Restaurante",
  slug,

  email: data.email || null,
  telefone: data.telefone || null,

  logoUrl: data.logoUrl,
  logo: data.logoUrl || restauranteFallback.logo,

  capa: restauranteFallback.capa,

  avaliacao: data.avaliacao || 4.8,
  tempoEntrega: data.tempoEntrega || "25-40 min",
  taxaEntrega: data.taxaEntrega || "R$ 6,99",

  abertoAgora:
    typeof data.abertoAgora === "boolean" ? data.abertoAgora : true,

  horariosFuncionamento: data.horariosFuncionamento || null,
});
    } catch (err) {
      console.error("[ERRO] restaurante público:", err);
      setRestauranteErro(true);
      showNotification("Erro ao carregar restaurante.", "error");
    }
  }, [USE_MOCK, api, slug, showNotification]);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoadingInicial(true);

      if (!USE_MOCK && !slug) {
        showNotification("Restaurante não identificado.", "error");
        setCategoriasDisponiveis([]);
        return;
      }

      if (USE_MOCK) {
        setCategoriasDisponiveis(MOCK_CATEGORIAS || []);
        return;
      }

      const res = await api.get(`/public/restaurantes/${slug}/categorias`);
      const nomes = (res.data || []).map((c) => c?.nome).filter(Boolean);

      setCategoriasDisponiveis(nomes);
    } catch (err) {
      console.error("[ERRO] categorias públicas:", err);

      try {
        const resFallback = await api.get(
          `/public/restaurantes/${slug}/produtos/listarFiltroShop`,
          {
            params: {
              page: 0,
              size: 100,
              ordenarPor: filtros.ordenarPor || "maisVendidos",
            },
            paramsSerializer: buildParamsSerializer,
          }
        );

        const produtos = normalizeList(resFallback.data?.produtos || []);
        const categoriasExtraidas = Array.from(
          new Set(produtos.flatMap((p) => p.categorias || []).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b, "pt-BR"));

        setCategoriasDisponiveis(categoriasExtraidas);
      } catch {
        showNotification("Erro ao carregar categorias.", "error");
        setCategoriasDisponiveis([]);
      }
    } finally {
      setLoadingInicial(false);
    }
  }, [USE_MOCK, api, slug, filtros.ordenarPor, showNotification]);

  const loadCategoriaPage = useCallback(
    async (cat) => {
      const curr =
        porCategoriaRef.current?.[cat] || {
          items: [],
          page: 0,
          hasMore: true,
          loading: false,
          error: null,
        };

      if (curr.loading || !curr.hasMore) return;
      if (!USE_MOCK && !slug) return;

      const pageToLoad = curr.page;

      setPorCategoria((prev) => ({
        ...prev,
        [cat]: { ...(prev[cat] || curr), loading: true, error: null },
      }));

      try {
        if (USE_MOCK) {
          const data = mockListarFiltroShop({
            page: pageToLoad,
            size: batchSize,
            categoria: cat,
            search: "",
            ordenarPor: filtros.ordenarPor || "maisVendidos",
          });

          const novos = normalizeList(data?.produtos || []);
          const totalPaginas = Number(data?.totalPaginas || 1);
          const hasMore = novos.length > 0 && pageToLoad + 1 < totalPaginas;

          setPorCategoria((prev) => {
            const prevCat = prev[cat] || curr;
            return {
              ...prev,
              [cat]: {
                ...prevCat,
                items: [...(prevCat.items || []), ...novos],
                page: pageToLoad + 1,
                hasMore,
                loading: false,
                error: null,
              },
            };
          });

          return;
        }

        if (cancelByCat.current[cat]) {
          cancelByCat.current[cat].cancel("Nova requisição desta categoria");
        }
        cancelByCat.current[cat] = axios.CancelToken.source();

        const res = await api.get(
          `/public/restaurantes/${slug}/produtos/listarFiltroShop`,
          {
            params: {
              page: pageToLoad,
              size: batchSize,
              categoria: [cat],
              ordenarPor: filtros.ordenarPor || "maisVendidos",
            },
            cancelToken: cancelByCat.current[cat].token,
            paramsSerializer: buildParamsSerializer,
          }
        );

        const data = res.data || {};
        const novos = normalizeList(data.produtos || []);
        const totalPaginas = Number(data.totalPaginas);

        let hasMore = false;
        if (Number.isFinite(totalPaginas)) {
          hasMore = novos.length > 0 && pageToLoad + 1 < totalPaginas;
        } else {
          hasMore = novos.length === batchSize;
        }
        if (novos.length === 0) hasMore = false;

        setPorCategoria((prev) => {
          const prevCat = prev[cat] || curr;
          return {
            ...prev,
            [cat]: {
              ...prevCat,
              items: [...(prevCat.items || []), ...novos],
              page: pageToLoad + 1,
              hasMore,
              loading: false,
              error: null,
            },
          };
        });
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(`[ERRO] cat="${cat}" page=${pageToLoad}:`, err);
          showNotification("Erro ao carregar itens do cardápio.", "error");
        }

        setPorCategoria((prev) => ({
          ...prev,
          [cat]: {
            ...(prev[cat] || curr),
            loading: false,
            error: true,
            hasMore: false,
          },
        }));
      }
    },
    [USE_MOCK, api, slug, batchSize, filtros.ordenarPor, showNotification]
  );

  const loadSearchPage = useCallback(
    async (reset = false) => {
      if (searchLoading) return;
      if (!searchHasMore && !reset) return;
      if (!USE_MOCK && !slug) return;

      setSearchLoading(true);

      try {
        const pageToLoad = reset ? 0 : searchPage;

        if (USE_MOCK) {
          const data = mockListarFiltroShop({
            page: pageToLoad,
            size: batchSize,
            categoria: undefined,
            search: filtros.search || "",
            ordenarPor: filtros.ordenarPor || "maisVendidos",
          });

          const novos = normalizeList(data?.produtos || []);
          const totalPaginas = Number(data?.totalPaginas || 1);

          setSearchList((prev) => (reset ? novos : [...prev, ...novos]));
          setSearchPage(pageToLoad + 1);
          setSearchHasMore(novos.length > 0 && pageToLoad + 1 < totalPaginas);
          return;
        }

        if (cancelSearch.current) {
          cancelSearch.current.cancel("Nova busca");
        }
        cancelSearch.current = axios.CancelToken.source();

        const res = await api.get(
          `/public/restaurantes/${slug}/produtos/listarFiltroShop`,
          {
            params: {
              page: pageToLoad,
              size: batchSize,
              ...(filtros.search && { search: filtros.search }),
              ordenarPor: filtros.ordenarPor || "maisVendidos",
            },
            cancelToken: cancelSearch.current.token,
            paramsSerializer: buildParamsSerializer,
          }
        );

        const data = res.data || {};
        const novos = normalizeList(data.produtos || []);
        const totalPaginas = Number(data.totalPaginas || 1);

        setSearchList((prev) => (reset ? novos : [...prev, ...novos]));
        setSearchPage(pageToLoad + 1);
        setSearchHasMore(novos.length > 0 && pageToLoad + 1 < totalPaginas);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("[ERRO] SEARCH:", err);
          showNotification("Erro ao carregar itens do cardápio.", "error");
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [
      USE_MOCK,
      api,
      slug,
      batchSize,
      filtros.search,
      filtros.ordenarPor,
      searchPage,
      searchHasMore,
      searchLoading,
      showNotification,
    ]
  );

  useEffect(() => {
    fetchRestaurante();
  }, [fetchRestaurante]);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  useEffect(() => {
    if (!categoriasDisponiveis.length) return;

    if (categoriaInicial && categoriasDisponiveis.includes(categoriaInicial)) {
      setCategoriaAtual(categoriaInicial);
      return;
    }

    if (!categoriaAtual) {
      setCategoriaAtual(categoriasDisponiveis[0]);
    }
  }, [categoriasDisponiveis, categoriaInicial, categoriaAtual]);

  useEffect(() => {
    if (categoriasDisponiveis.length === 0 && !isSearchMode) return;

    setLoadingInicial(true);

    if (isSearchMode) {
      setSearchList([]);
      setSearchPage(0);
      setSearchHasMore(true);
      loadSearchPage(true).finally(() => setLoadingInicial(false));
      return;
    }

    Object.values(cancelByCat.current || {}).forEach((src) => {
      try {
        src?.cancel?.("Reset");
      } catch {}
    });
    cancelByCat.current = {};

    const cats = categoriasVisiveis;
    if (!cats || cats.length === 0) {
      setPorCategoria({});
      setLoadingInicial(false);
      return;
    }

    const nextState = buildEmptyState(cats);
    porCategoriaRef.current = nextState;
    setPorCategoria(nextState);

    Promise.allSettled(cats.map((cat) => loadCategoriaPage(cat))).finally(() =>
      setLoadingInicial(false)
    );
  }, [
    categoriasDisponiveis,
    categoriasVisiveis,
    filtros.ordenarPor,
    isSearchMode,
    batchSize,
    loadCategoriaPage,
    loadSearchPage,
  ]);

  useEffect(() => {
    if (isSearchMode) return;

    const cats = categoriasVisiveis;
    if (!cats || cats.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cat = entry.target.getAttribute("data-cat");
          if (!cat) return;
          loadCategoriaPage(cat);
        });
      },
      { root: null, rootMargin: "600px 0px", threshold: 0.01 }
    );

    cats.forEach((cat) => {
      const el = sentinels.current[cat];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categoriasVisiveis, isSearchMode, loadCategoriaPage]);

  useEffect(() => {
    if (!isSearchMode) return;
    const el = searchSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadSearchPage(false);
      },
      { root: null, rootMargin: "700px 0px", threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isSearchMode, loadSearchPage]);

  useEffect(() => {
    if (!categoriasVisiveis.length || isSearchMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibles.length > 0) {
          const cat = visibles[0].target.getAttribute("data-cat");
          if (cat) setCategoriaAtual(cat);
        }
      },
      {
        root: null,
        rootMargin: "-120px 0px -55% 0px",
        threshold: [0.1, 0.2, 0.35, 0.5, 0.7],
      }
    );

    categoriasVisiveis.forEach((cat) => {
      const el = sectionEls.current[cat];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categoriasVisiveis, isSearchMode]);

  const handleAdicionar = async (
    payloadOrProdutoId,
    variacaoId = null,
    quantidade = 1
  ) => {
    try {
      if (!slug && !USE_MOCK) {
        showNotification("Restaurante não identificado.", "error");
        return;
      }

      const payload =
        typeof payloadOrProdutoId === "object"
          ? { slug, ...payloadOrProdutoId }
          : { slug, produtoId: payloadOrProdutoId, variacaoId, quantidade };

      await adicionarAoCarrinho(payload);
      showNotification("Item adicionado ao carrinho.", "success");
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      showNotification("Não foi possível adicionar o item.", "error");
    }
  };

  const irParaCategoria = (cat) => {
    const el = sectionEls.current[cat];
    if (!el) return;

    setCategoriaAtual(cat);
    scrollToRef({ current: el });
  };

  if (!USE_MOCK && restauranteErro) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24 md:pb-10">
        <PageTitle title="Restaurante não encontrado" />
        <div className="mx-auto max-w-3xl px-4 py-24">
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-black text-zinc-900">
              Restaurante não encontrado
            </h1>
            <p className="mb-6 text-zinc-500">
              Verifique o link do cardápio ou tente novamente mais tarde.
            </p>
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl bg-zinc-900 px-5 py-3 font-semibold text-white"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 md:pb-10">
      <PageTitle title={`Cardápio | ${restauranteView.nome}`} />

      <DesktopTopNav
        slug={slug}
        onOfertas={() => setShowOfertas(true)}
        onPedidos={() => setShowPedidos(true)}
        onFidelidade={() => setShowFidelidade(true)}
      />

      <RestaurantHero
        restaurante={restauranteView}
        endereco={enderecoSelecionado}
        fidelidadePontos={fidelidade.pontos}
        onAbrirFidelidade={() => setShowFidelidade(true)}
        onTrocarEndereco={() => navigate(`/restaurante/${restauranteView.slug}/carrinho`)}
        onVerPerfil={() => navigate(`/restaurante/${restauranteView.slug}`)}
        onVerPedido={() =>
          navigate(`/restaurante/${restauranteView.slug}/carrinho`)
        }
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <OfertasCarousel
          produtos={produtosEmOferta}
          onAdicionar={handleAdicionar}
        />
      </div>

      <section className="sticky top-0 z-30 mt-6 border-b border-zinc-200/80 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <CategorySelector
            categorias={categoriasDisponiveis}
            categoriaAtual={categoriaAtual}
            disabled={isSearchMode}
            onSelectCategoria={async (cat) => {
              if (isSearchMode) return;
              await loadCategoriaPage(cat);
              irParaCategoria(cat);
            }}
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isSearchMode ? (
          <div className="space-y-5">
            <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-zinc-500">
                Resultados para{" "}
                <span className="font-bold text-zinc-900">
                  “{filtros.search}”
                </span>
              </p>
            </div>

            {loadingInicial && searchList.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
                Carregando…
              </div>
            ) : searchList.length === 0 ? (
              <div className="flex items-center justify-center gap-2 rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-600 shadow-sm">
                <XCircle className="h-6 w-6" />
                Nenhum item encontrado.
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3"
              >
                {searchList.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    variants={cardVariants}
                    onClick={() =>
                      navigate(`/restaurante/${slug}/produtos/${produto.slug}`)
                    }
                    onAdicionar={handleAdicionar}
                  />
                ))}
              </motion.div>
            )}

            <div ref={searchSentinelRef} className="h-8" />

            {searchLoading && (
              <div className="py-6 text-center text-zinc-500">
                Carregando mais…
              </div>
            )}

            {!searchHasMore && searchList.length > 0 && (
              <p className="py-6 text-center text-sm text-zinc-400">
                Você chegou ao fim dos resultados.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {loadingInicial && categoriasVisiveis.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
                Carregando…
              </div>
            ) : categoriasVisiveis.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-600 shadow-sm">
                Nenhuma categoria disponível.
              </div>
            ) : (
              categoriasVisiveis.map((cat) => {
                const sec = porCategoria[cat] || {
                  items: [],
                  loading: false,
                  hasMore: true,
                  error: null,
                };

                return (
                  <section
                    key={cat}
                    data-cat={cat}
                    ref={(el) => {
                      sectionEls.current[cat] = el;
                    }}
                    className="scroll-mt-[260px]"
                  >
                    <div className="mb-5 flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900">
                          {cat}
                        </h2>
                      </div>
                    </div>

                    {sec.items.length === 0 && sec.loading ? (
                      <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-zinc-500 shadow-sm">
                        Carregando…
                      </div>
                    ) : sec.items.length === 0 ? (
                      <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-zinc-500 shadow-sm">
                        {sec.error
                          ? "Erro ao carregar itens."
                          : "Nenhum item nesta categoria."}
                      </div>
                    ) : (
                      <motion.div
                        variants={containerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3"
                      >
                        {sec.items.map((produto) => (
                          <ProdutoCard
                            key={produto.id}
                            produto={produto}
                            variants={cardVariants}
                            onClick={() =>
                              navigate(
                                `/restaurante/${slug}/produtos/${produto.slug}`
                              )
                            }
                            onAdicionar={handleAdicionar}
                          />
                        ))}
                      </motion.div>
                    )}

                    <div
                      ref={(el) => (sentinels.current[cat] = el)}
                      className="h-10"
                    />

                    {sec.loading && sec.items.length > 0 && (
                      <div className="py-6 text-center text-zinc-500">
                        Carregando mais…
                      </div>
                    )}

                    {!sec.hasMore && sec.items.length > 0 && (
                      <div className="pt-8">
                        <div className="h-px w-full bg-zinc-200" />
                      </div>
                    )}
                  </section>
                );
              })
            )}
          </div>
        )}
      </div>
      <CarrinhoPopup/>

      {showOfertas && (
        <OfertasModal
          produtos={Object.values(porCategoria).flatMap(s => s?.items || [])}
          slug={slug}
          onClose={() => setShowOfertas(false)}
          onAdicionar={handleAdicionar}
        />
      )}

      {showPedidos && (
        <PedidosRestauranteModal
          slug={slug}
          onClose={() => setShowPedidos(false)}
        />
      )}

      {showFidelidade && (
        <FidelidadeModal
          pontos={fidelidade.pontos}
          totalPedidos={fidelidade.totalPedidos}
          totalGasto={fidelidade.totalGasto}
          empresaId={restauranteView.id ?? null}
          onResgateSuccess={fetchFidelidade}
          onClose={() => setShowFidelidade(false)}
        />
      )}

      <MobileBottomNav
        slug={slug}
        onOfertas={() => setShowOfertas(true)}
        onPedidos={() => setShowPedidos(true)}
        onFidelidade={() => setShowFidelidade(true)}
      />
    </div>
  );
};

export default Cardapio;
