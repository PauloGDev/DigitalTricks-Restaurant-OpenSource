import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  Package2,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Tag,
  Boxes,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductForm from "./produtos/ProductForm";
import ProductList from "./produtos/ProductList";

const STORAGE_KEY = "filtrosGerenciarProdutos";

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const normalizeEmpresaId = (raw) => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "number" || typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.id !== undefined && parsed?.id !== null) {
      return parsed.id;
    }

    return raw;
  } catch {
    return raw;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
};

const getEstoqueTotal = (produto) =>
  produto?.variacoes?.length
    ? produto.variacoes.reduce((total, v) => total + Number(v?.estoque || 0), 0)
    : Number(produto?.estoque || 0);

const getPrecoMinimo = (produto) => {
  if (produto?.variacoes?.length) {
    const precos = produto.variacoes
      .map((v) => Number(v?.preco))
      .filter((p) => !Number.isNaN(p) && p >= 0);

    if (precos.length) return Math.min(...precos);
  }

  return Number(produto?.precoMinimo ?? produto?.precoBase ?? 0);
};

const extrairCategorias = (lista = []) => {
  const set = new Set();

  lista.forEach((produto) => {
    (produto?.categorias || []).forEach((cat) => {
      if (cat) set.add(cat);
    });
  });

  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
};

const extrairVariacoes = (lista = []) => {
  const set = new Set();

  lista.forEach((produto) => {
    (produto?.variacoes || []).forEach((v) => {
      if (v?.nome) set.add(v.nome);
    });
  });

  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR"));
};

const GerenciarProdutos = ({user}) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [theme, setTheme] = useState(getThemeState());
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const filtrosSalvos = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }, []);

  const [search, setSearch] = useState(filtrosSalvos.search || "");
  const [filtroEstoque, setFiltroEstoque] = useState(
    filtrosSalvos.filtroEstoque || "todos"
  );
  const [ordenacao, setOrdenacao] = useState(
    filtrosSalvos.ordenacao || "nome"
  );
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(
    filtrosSalvos.categoriaSelecionada || ""
  );
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(
    filtrosSalvos.variacaoSelecionada || ""
  );

  const [paginaAtual, setPaginaAtual] = useState(
    filtrosSalvos.paginaAtual || 1
  );
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);

  const [todasCategorias, setTodasCategorias] = useState([]);
  const [todasVariacoes, setTodasVariacoes] = useState([]);

  const itensPorPagina = 20;

  const containerRef = useRef(null);
  const listaRef = useRef(null);

  const empresaId = user?.empresaId;

  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        search,
        filtroEstoque,
        ordenacao,
        categoriaSelecionada,
        variacaoSelecionada,
        paginaAtual,
      })
    );
  }, [
    search,
    filtroEstoque,
    ordenacao,
    categoriaSelecionada,
    variacaoSelecionada,
    paginaAtual,
  ]);

  const carregarProdutos = useCallback(
    async (pagina = 1) => {
      try {
        setLoading(true);

        if (!empresaId) {
          setProdutos([]);
          setTotalPaginas(1);
          setTotalProdutos(0);
          setTodasCategorias([]);
          setTodasVariacoes([]);
          return;
        }

        const params = new URLSearchParams({
          page: String(pagina - 1),
          size: String(itensPorPagina),
        });

        if (search.trim()) params.append("search", search.trim());

        if (categoriaSelecionada) {
          params.append("categoria", categoriaSelecionada);
        }

        const res = await fetch(
          `${API_URL}/empresas/${empresaId}/produtos?${params.toString()}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Erro ao carregar produtos");
        }

        const data = await res.json();

        const listaProdutos = Array.isArray(data?.produtos) ? data.produtos : [];

        setProdutos(listaProdutos);
        setTotalPaginas(Number(data?.totalPaginas || 1));
        setTotalProdutos(Number(data?.totalProdutos || 0));

        setTodasCategorias(extrairCategorias(listaProdutos));
        setTodasVariacoes(extrairVariacoes(listaProdutos));
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        setProdutos([]);
        setTotalPaginas(1);
        setTotalProdutos(0);
        setTodasCategorias([]);
        setTodasVariacoes([]);
      } finally {
        setLoading(false);
      }
    },
    [API_URL, empresaId, search, categoriaSelecionada]
  );

  useEffect(() => {
    if (!empresaId) {
      setProdutos([]);
      setTotalPaginas(1);
      setTotalProdutos(0);
      setTodasCategorias([]);
      setTodasVariacoes([]);
      return;
    }

    carregarProdutos(paginaAtual);
  }, [empresaId, paginaAtual, carregarProdutos]);

  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos];

    if (filtroEstoque === "disponivel") {
      lista = lista.filter((p) => getEstoqueTotal(p) > 0);
    } else if (filtroEstoque === "esgotado") {
      lista = lista.filter((p) => getEstoqueTotal(p) === 0);
    }

    if (variacaoSelecionada) {
      lista = lista.filter((p) =>
        p?.variacoes?.some((v) => v?.nome === variacaoSelecionada)
      );
    }

    lista.sort((a, b) => {
      switch (ordenacao) {
        case "precoMenor":
          return getPrecoMinimo(a) - getPrecoMinimo(b);
        case "precoMaior":
          return getPrecoMinimo(b) - getPrecoMinimo(a);
        case "estoque":
          return getEstoqueTotal(b) - getEstoqueTotal(a);
        default:
          return String(a?.nome || "").localeCompare(String(b?.nome || ""), "pt-BR");
      }
    });

    return lista;
  }, [produtos, filtroEstoque, variacaoSelecionada, ordenacao]);

  const filtrosLocaisAtivos =
    filtroEstoque !== "todos" ||
    !!variacaoSelecionada ||
    ordenacao !== "nome";

  const produtosPaginados = produtosFiltrados;

  const totalPaginasExibidas = filtrosLocaisAtivos
    ? Math.max(1, Math.ceil(produtosFiltrados.length / itensPorPagina))
    : totalPaginas;

  const totalExibido = filtrosLocaisAtivos ? produtosFiltrados.length : totalProdutos;

  const handleTrocarPagina = (novaPagina) => {
    if (novaPagina < 1 || novaPagina > totalPaginasExibidas) return;

    setPaginaAtual(novaPagina);

    if (listaRef.current) {
      const y = listaRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleProdutoAtualizado = (produtoAtualizado) => {
    if (!produtoAtualizado?.id) {
      carregarProdutos(paginaAtual);
      setProdutoEditando(null);
      return;
    }

    setProdutos((prev) =>
      prev.map((p) => (p.id === produtoAtualizado.id ? produtoAtualizado : p))
    );

    setTodasCategorias((prev) =>
      [...new Set([...prev, ...(produtoAtualizado.categorias || [])])].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      )
    );

    setTodasVariacoes((prev) =>
      [
        ...new Set([
          ...prev,
          ...((produtoAtualizado.variacoes || []).map((v) => v.nome).filter(Boolean)),
        ]),
      ].sort((a, b) => a.localeCompare(b, "pt-BR"))
    );

    setProdutoEditando(null);
  };

  const handleProdutoCriado = (produtoSalvo) => {
    if (produtoSalvo?.id) {
      setProdutos((prev) => [produtoSalvo, ...prev]);
      setTotalProdutos((prev) => prev + 1);

      setTodasCategorias((prev) =>
        [...new Set([...prev, ...(produtoSalvo.categorias || [])])].sort((a, b) =>
          a.localeCompare(b, "pt-BR")
        )
      );

      setTodasVariacoes((prev) =>
        [
          ...new Set([
            ...prev,
            ...((produtoSalvo.variacoes || []).map((v) => v.nome).filter(Boolean)),
          ]),
        ].sort((a, b) => a.localeCompare(b, "pt-BR"))
      );
    } else {
      carregarProdutos(paginaAtual);
    }

    setProdutoEditando(null);
  };

  const resetFiltros = () => {
    setSearch("");
    setFiltroEstoque("todos");
    setOrdenacao("nome");
    setCategoriaSelecionada("");
    setVariacaoSelecionada("");
    setPaginaAtual(1);
  };

  const panelClass = [
    "rounded-[28px] border transition-colors duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
      : "border-zinc-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
  ].join(" ");

  const inputShellClass = [
    "flex h-11 items-center rounded-2xl border px-3 transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white"
      : "border-zinc-200 bg-white text-zinc-900",
  ].join(" ");

  const selectClass = [
    "h-11 rounded-2xl border px-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white"
      : "border-zinc-200 bg-white text-zinc-700",
  ].join(" ");

  return (
    <div
      ref={containerRef}
      className={[
        "min-h-screen p-4 sm:p-6",
        isDark ? "bg-transparent text-white" : "bg-transparent text-zinc-900",
      ].join(" ")}
    >
      <ProductForm
        empresaId={empresaId}
        produtoInicial={produtoEditando}
        onSaved={(produtoSalvo) => {
          if (produtoEditando?.id) {
            handleProdutoAtualizado(produtoSalvo);
          } else {
            handleProdutoCriado(produtoSalvo);
          }

          carregarProdutos(paginaAtual);
        }}
        onCancel={() => setProdutoEditando(null)}
      />

      <div className={`mb-8 mt-8 p-4 sm:p-5 ${panelClass}`}>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3
              className={[
                "text-lg font-extrabold",
                isDark ? "text-white" : "text-zinc-900",
              ].join(" ")}
            >
              Catálogo de produtos
            </h3>
            <p
              className={[
                "text-sm",
                isDark ? "text-white/50" : "text-zinc-600",
              ].join(" ")}
            >
              Busque, filtre e organize os itens do seu cardápio.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFiltros}
            className={[
              "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-extrabold transition",
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            <RefreshCcw className="h-4 w-4" />
            Limpar filtros
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.7fr_repeat(4,minmax(0,1fr))]">
          <form
            onSubmit={(e) => e.preventDefault()}
            className={inputShellClass}
          >
            <Search
              className={[
                "h-5 w-5",
                isDark ? "text-white/35" : "text-zinc-500",
              ].join(" ")}
            />
            <input
              type="text"
              placeholder="Buscar por nome..."
              className="w-full bg-transparent px-2 text-sm outline-none placeholder:opacity-70"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPaginaAtual(1);
              }}
            />
          </form>

          <select
            className={selectClass}
            value={filtroEstoque}
            onChange={(e) => {
              setFiltroEstoque(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="todos">Todos os estoques</option>
            <option value="disponivel">Disponíveis</option>
            <option value="esgotado">Esgotados</option>
          </select>

          <select
            className={selectClass}
            value={categoriaSelecionada}
            onChange={(e) => {
              setCategoriaSelecionada(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="">Todas as categorias</option>
            {todasCategorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={variacaoSelecionada}
            onChange={(e) => {
              setVariacaoSelecionada(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="">Todas as variações</option>
            {todasVariacoes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            className={selectClass}
            value={ordenacao}
            onChange={(e) => {
              setOrdenacao(e.target.value);
              setPaginaAtual(1);
            }}
          >
            <option value="nome">Ordenar por nome</option>
            <option value="precoMenor">Menor preço</option>
            <option value="precoMaior">Maior preço</option>
            <option value="estoque">Maior estoque</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold",
              isDark
                ? "border-white/10 bg-white/5 text-white/75"
                : "border-zinc-200 bg-zinc-50 text-zinc-700",
            ].join(" ")}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {totalExibido} produto(s) encontrado(s)
          </span>

          {categoriaSelecionada ? (
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                isDark
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              <Tag className="h-3.5 w-3.5" />
              {categoriaSelecionada}
            </span>
          ) : null}

          {variacaoSelecionada ? (
            <span
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold",
                isDark
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700",
              ].join(" ")}
            >
              <Boxes className="h-3.5 w-3.5" />
              {variacaoSelecionada}
            </span>
          ) : null}
        </div>
      </div>

      <div ref={listaRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${paginaAtual}-${filtrosLocaisAtivos ? "local" : "backend"}-${search}-${categoriaSelecionada}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <ProductList
              produtos={produtosPaginados}
              onChange={() => carregarProdutos(paginaAtual)}
              onEdit={setProdutoEditando}
              onProdutoAtualizado={handleProdutoAtualizado}
              loading={loading}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={[
          "mt-6 flex flex-col gap-3 rounded-[24px] border p-4 sm:flex-row sm:items-center sm:justify-between",
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-zinc-200 bg-white",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center gap-2 text-sm",
            isDark ? "text-white/60" : "text-zinc-600",
          ].join(" ")}
        >
          <Package2 className="h-4 w-4" />
          <p>
            Exibindo{" "}
            <span
              className={[
                "font-extrabold",
                isDark ? "text-white" : "text-zinc-900",
              ].join(" ")}
            >
              {produtosPaginados.length}
            </span>{" "}
            de{" "}
            <span
              className={[
                "font-extrabold",
                isDark ? "text-white" : "text-zinc-900",
              ].join(" ")}
            >
              {totalExibido}
            </span>{" "}
            produtos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTrocarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-extrabold transition",
              paginaAtual === 1
                ? isDark
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                : isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <span
            className={[
              "rounded-2xl px-3 text-sm font-bold",
              isDark ? "text-white/70" : "text-zinc-700",
            ].join(" ")}
          >
            Página {paginaAtual} de {totalPaginasExibidas || 1}
          </span>

          <button
            onClick={() => handleTrocarPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginasExibidas}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-extrabold transition",
              paginaAtual === totalPaginasExibidas
                ? isDark
                  ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                  : "cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400"
                : isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GerenciarProdutos;