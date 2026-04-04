import { useEffect, useMemo, useState } from "react";

export const normalizeStatus = (s) => {
  const status = String(s || "").toUpperCase();

  // backend atual
  if (status === "AGUARDANDO_PAGAMENTO") return "PENDENTE";

  // compatibilidades
  if (status === "PAGAMENTO_APROVADO") return "PAGO";
  if (status === "DESPACHADO") return "ENVIADO";

  return status;
};

export default function useMeusPedidos({ apiUrlRaw, itemsPerPage = 6 }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);

  // url base
  const base = (apiUrlRaw || "").replace(/\/$/, "");
  const API_URL = base.endsWith("/api") ? base : `${base}/api`;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!apiUrlRaw) {
      console.error("VITE_API_URL não definido no .env");
      setLoading(false);
      return;
    }

    if (!token) {
      console.warn("Sem token no localStorage");
      setLoading(false);
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        const url = `${API_URL}/pedidos/me`;
        console.log("GET =>", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        console.log("STATUS =>", res.status);

        if (res.status === 401 || res.status === 403) {
          if (!alive) return;
          setPedidos([]);
          return;
        }

        if (!res.ok) {
          const err = await res.text().catch(() => "");
          throw new Error(err || `Erro ao buscar pedidos (${res.status})`);
        }

        const data = await res.json().catch(() => []);
        console.log("DATA =>", data[0]); 

        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.content)
          ? data.content
          : [];

        const ordenados = [...lista].sort(
          (a, b) => new Date(b.data) - new Date(a.data)
        );

        if (!alive) return;
        setPedidos(lista);
      } catch (e) {
        console.error("Erro fetch pedidos:", e);
        if (!alive) return;
        setPedidos([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [API_URL, apiUrlRaw]);

  const pedidosFiltrados = useMemo(() => {
    const q = search.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const statusNorm = normalizeStatus(pedido.status);

      const matchSearch =
        !q ||
        String(pedido.id).includes(q) ||
        (pedido.itens || []).some((item) =>
          String(item.nomeProduto || "").toLowerCase().includes(q)
        );

      const matchStatus =
        statusFilter === "TODOS" || statusNorm === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [pedidos, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(pedidosFiltrados.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pedidosPaginados = useMemo(() => {
    return pedidosFiltrados.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [pedidosFiltrados, currentPage, itemsPerPage]);

  return {
    // dados
    pedidos,
    pedidosFiltrados,
    pedidosPaginados,

    // ui state
    loading,
    search,
    statusFilter,
    currentPage,
    totalPages,

    // actions
    setSearch: (v) => {
      setSearch(v);
      setCurrentPage(1);
    },
    setStatusFilter: (v) => {
      setStatusFilter(v);
      setCurrentPage(1);
    },
    setCurrentPage,

    // helpers
    API_URL,
  };
}