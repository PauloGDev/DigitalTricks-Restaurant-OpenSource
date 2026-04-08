import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, matchPath } from "react-router-dom";

const CarrinhoContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "carrinho_local";
const SYNCED_FLAG = "carrinho_synced_flag";
const MESA_KEY = "carrinho_mesa";

const brNumber = (v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const getHeaders = () => {
  const t = localStorage.getItem("token");
  return t ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` } : null;
};

const lerLocal = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
};

const gravarLocal = (itens) => localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
const limparLocal = () => localStorage.removeItem(STORAGE_KEY);

const normalizarItem = (item) => {
  const b = item && typeof item === "object" ? item : {};
  return {
    ...b,
    quantidade: Math.max(1, parseInt(b.quantidade, 10) || 1),
    precoUnitario: brNumber(b.precoUnitario),
    subtotal: brNumber(b.subtotal),
    opcionais: Array.isArray(b.opcionais) ? b.opcionais : [],
    opcionaisDetalhados: Array.isArray(b.opcionaisDetalhados) ? b.opcionaisDetalhados : [],
    opcionaisResumo: Array.isArray(b.opcionaisResumo) ? b.opcionaisResumo : [],
  };
};

const normalizarCarrinho = (data) => {
  const b = data && typeof data === "object" ? data : {};
  const itens = Array.isArray(b.itens) ? b.itens.map(normalizarItem) : [];
  const subtotal = brNumber(b.subtotal);
  const totalCalc = Math.max(
    brNumber(b.total) > 0 ? brNumber(b.total) : itens.reduce((a, i) => a + brNumber(i.subtotal), 0),
    0
  );
  return { ...b, itens, subtotal, descontoCupom: brNumber(b.descontoCupom), total: totalCalc, cupom: b.cupom ?? null, motivoCupomInvalido: b.motivoCupomInvalido ?? null, codigoErroCupom: b.codigoErroCupom ?? null };
};

const carrinhoLocal = (itens) => {
  const subtotal = itens.reduce((a, i) => a + brNumber(i.subtotal || i.precoUnitario || 0) * Math.max(1, Number(i.quantidade) || 1), 0);
  return { itens, subtotal, descontoCupom: 0, total: subtotal, cupom: null, motivoCupomInvalido: null, codigoErroCupom: null, isLocal: true };
};

const carrinhoVazio = () => ({ itens: [], subtotal: 0, descontoCupom: 0, total: 0, cupom: null, motivoCupomInvalido: null, codigoErroCupom: null });

const getSlug = (pathname) => {
  const m = matchPath("/restaurante/:slug/*", pathname) || matchPath("/restaurante/:slug", pathname);
  return m?.params?.slug || null;
};

export const CarrinhoProvider = ({ children }) => {
  const location = useLocation();
  const slug = useMemo(() => getSlug(location.pathname), [location.pathname]);

  const [carrinho, setCarrinho] = useState(() => {
    const itens = lerLocal();
    return itens.length > 0 ? carrinhoLocal(itens) : carrinhoVazio();
  });
  const [loading, setLoading] = useState(false);
  const [numeroMesa, setNumeroMesa] = useState(() => {
    try { return localStorage.getItem(MESA_KEY) || ""; } catch { return ""; }
  });

  const setNumeroMesaPersisted = useCallback((value) => {
    setNumeroMesa(value);
    try { if (value) localStorage.setItem(MESA_KEY, String(value)); else localStorage.removeItem(MESA_KEY); } catch {}
  }, []);

  /* Track login state */
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = localStorage.getItem("token");
      if (t !== token) setToken(t);
    }, 500);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t !== token) setToken(t);
  }, [location.pathname, token]);

  const logado = !!token;

  // Track last restaurant for cart
  useEffect(() => {
    if (slug) localStorage.setItem("carrinho_last_rest", slug);
  }, [slug]);

  /* ── Montar item local ── */
  const montarItemLocal = (p) => ({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    produtoId: Number(p.produtoId),
    variacaoId: p.variacaoId != null ? Number(p.variacaoId) : null,
    quantidade: Math.max(1, Number(p.quantidade ?? 1)),
    observacao: p.observacao || null,
    opcionais: Array.isArray(p.opcionais) ? p.opcionais : [],
    nomeProduto: p.nomeProduto || p.produtoNombre || p.nome || null,
    variacaoNome: p.variacaoNome || p.variacao || null,
    precoUnitario: brNumber(p.precoUnitario),
    imagemUrl: p.imagemUrl || p.produtoImagemUrl || null,
  });

  /* ── Flag para sync (só sync uma vez por sessão) ── */
  const syncDoneRef = useRef(false);
  const processingRef = useRef(false);

  /* ── Carregar carrinho ── */
  const carregarCarrinho = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    const s = slug || localStorage.getItem("carrinho_last_rest");

    // ─── Guest: apenas lê localStorage ───
    if (!logado) {
      const itens = lerLocal();
      setCarrinho(itens.length > 0 ? carrinhoLocal(itens) : carrinhoVazio());
      processingRef.current = false;
      return;
    }

    setLoading(true);

    // ─── Logado: sync + busca backend ───
    const locais = lerLocal();

    // Sync só na PRIMEIRA vez que loga (evita duplicação)
    if (s && locais.length > 0 && !syncDoneRef.current) {
      syncDoneRef.current = true; // TRAVA antes de async

      let allOk = true;
      for (let i = 0; i < locais.length; i++) {
        const item = locais[i];
        try {
          const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/adicionar`, {
            method: "POST",
            headers: getHeaders() || {},
            body: JSON.stringify({
              produtoId: Number(item.produtoId),
              variacaoId: item.variacaoId != null ? Number(item.variacaoId) : null,
              quantidade: Math.max(1, Number(item.quantidade) || 1),
              observacao: item.observacao || null,
              opcionais: Array.isArray(item.opcionais) ? item.opcionais : [],
            }),
          });
          if (!res.ok) { allOk = false; break; }
        } catch { allOk = false; break; }
      }

      if (allOk) {
        limparLocal();
      }
    }

    // Busca backend
    if (s) {
      try {
        const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.itens && data.itens.length > 0) {
            setCarrinho(normalizarCarrinho(data));
            setLoading(false);
            processingRef.current = false;
            return;
          }
        }
      } catch (err) {
        console.warn("Backend indisponivel:", err.message);
      }
    }

    // Fallback
    const itens = lerLocal();
    setCarrinho(itens.length > 0 ? carrinhoLocal(itens) : carrinhoVazio());
    setLoading(false);
    processingRef.current = false;
  // eslint-disable-next-line
  }, [logado, slug]);

  /* ── SINGLE effect to trigger carregamento ── */
  useEffect(() => {
    carregarCarrinho();
  }, [carregarCarrinho]);

  /* ── Adicionar ── */
  async function adicionarAoCarrinho(payloadOrId, variacaoId, quantidade = 1) {
    const payload = typeof payloadOrId === "object" && payloadOrId !== null
      ? payloadOrId
      : { produtoId: payloadOrId, variacaoId, quantidade };

    const s = payload.slug || slug || localStorage.getItem("carrinho_last_rest");
    if (!s) throw new Error("Slug nao informado");
    if (s) localStorage.setItem("carrinho_last_rest", s);

    if (!logado) {
      const itens = lerLocal();
      itens.push(montarItemLocal(payload));
      gravarLocal(itens);
      setCarrinho(carrinhoLocal(itens));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/adicionar`, {
        method: "POST",
        headers: getHeaders() || {},
        body: JSON.stringify({
          produtoId: Number(payload.produtoId),
          variacaoId: payload.variacaoId != null ? Number(payload.variacaoId) : null,
          quantidade: Number(payload.quantidade ?? 1),
          ...(payload.observacao ? { observacao: String(payload.observacao) } : {}),
          ...(Array.isArray(payload.opcionais) ? { opcionais: payload.opcionais } : {}),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCarrinho(normalizarCarrinho(data));
      }
    } catch (e) {
      console.warn("Erro adicionar:", e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Operar em item ── */
  async function incrementarItem(itemId, slugOverride = null) {
    const s = slugOverride || slug;
    if (!s || !logado) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/item/${itemId}/aumentar`, { method: "POST", headers: getHeaders() || {} });
      if (res.ok) setCarrinho(normalizarCarrinho(await res.json()));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  async function decrementarItem(itemId, slugOverride = null) {
    const s = slugOverride || slug;
    if (!s || !logado) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/item/${itemId}/diminuir`, { method: "POST", headers: getHeaders() || {} });
      if (res.ok) setCarrinho(normalizarCarrinho(await res.json()));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  async function removerDoCarrinho(itemId, slugOverride = null) {
    const s = slugOverride || slug;
    if (!s || !logado) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/item/${itemId}`, { method: "DELETE", headers: getHeaders() || {} });
      if (res.ok) setCarrinho(normalizarCarrinho(await res.json()));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }

  /* ── Limpar ── */
  async function limparCarrinho(slugOverride = null) {
    limparLocal();
    setCarrinho(carrinhoVazio());
    syncDoneRef.current = false;
    if (logado) {
      const s = slugOverride || slug;
      if (s) try { await fetch(`${API_URL}/restaurantes/${s}/carrinho/limpar`, { method: "POST", headers: getHeaders() || {} }); } catch {}
    }
  }

  /* ── Cupom ── */
  async function aplicarCupom(codigo, slugOverride = null) {
    if (!logado) { const e = new Error("Faca login para aplicar cupom"); e.status = 401; throw e; }
    const s = slugOverride || slug;
    if (!s) throw new Error("Slug nao informado");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/cupom/aplicar`, {
        method: "POST", headers: getHeaders() || {}, body: JSON.stringify({ codigo }),
      });
      let data = null, text = "";
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) data = await res.json().catch(() => null);
      else text = await res.text().catch(() => "");
      if (!res.ok) {
        const p = data && typeof data === "object" ? data : { message: text || "Erro ao aplicar cupom" };
        const err = new Error(p.message || p.erro || p.error || p.mensagem || "Erro");
        err.status = res.status; err.response = { data: p }; throw err;
      }
      setCarrinho(normalizarCarrinho(data));
      return normalizarCarrinho(data);
    } finally { setLoading(false); }
  }

  async function removerCupom(slugOverride = null) {
    if (!logado) { const itens = lerLocal(); setCarrinho(itens.length > 0 ? carrinhoLocal(itens) : carrinhoVazio()); return; }
    const s = slugOverride || slug;
    if (!s) throw new Error("Slug nao informado");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/restaurantes/${s}/carrinho/cupom/remover`, { method: "DELETE", headers: getHeaders() || {} });
      let data = null, text = "";
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) data = await res.json().catch(() => null);
      else text = await res.text().catch(() => "");
      if (!res.ok) {
        const p = data && typeof data === "object" ? data : { message: text || "Erro" };
        const err = new Error(p.message || p.erro || p.error || "Erro");
        err.status = res.status; err.response = { data: p }; throw err;
      }
      setCarrinho(normalizarCarrinho(data));
      return normalizarCarrinho(data);
    } finally { setLoading(false); }
  }

  const sincronizarComBackend = async () => { syncDoneRef.current = false; await carregarCarrinho(); };
  const limparEstadoLocal = useCallback(() => {
    limparLocal();
    syncDoneRef.current = false;
    setCarrinho(carrinhoVazio());
  }, []);

  return (
    <CarrinhoContext.Provider value={{
      carrinho, setCarrinho, numeroMesa, setNumeroMesa: setNumeroMesaPersisted,
      adicionarAoCarrinho, removerDoCarrinho,
      incrementarItem, decrementarItem, limparCarrinho, carregarCarrinho,
      aplicarCupom, removerCupom, loading, normalizarCarrinho,
      restauranteSlug: slug, limparEstadoLocal, sincronizarComBackend,
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = () => useContext(CarrinhoContext);
