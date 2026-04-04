import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Search,
  Loader2,
  Tag,
  Sparkles,
} from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";

const cx = (...c) => c.filter(Boolean).join(" ");

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const CategoriaManager = ({
  empresaId,
  categoriasSelecionadas = [],
  onChange,
}) => {
  const { showNotification } = useNotification();

  const [theme, setTheme] = useState(getThemeState());
  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());
    window.addEventListener("storage", syncTheme);
    syncTheme();
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const API_URL_RAW = import.meta.env.VITE_API_URL || "";
  const base = API_URL_RAW.replace(/\/$/, "");
  const API_URL = base.endsWith("/api") ? base : `${base}/api`;

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [novoNome, setNovoNome] = useState("");

  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState(null);
  const [saving, setSaving] = useState(false);

  const selecionadasSet = useMemo(
    () => new Set(categoriasSelecionadas),
    [categoriasSelecionadas]
  );

  const endpointCategorias = empresaId
    ? `${API_URL}/empresas/${empresaId}/categorias`
    : null;

  useEffect(() => {
    const fetchCategorias = async () => {
      if (!empresaId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch(endpointCategorias, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erro ao carregar");

        const data = await res.json();
        setCategorias(data || []);
      } catch {
        showNotification("Erro ao carregar categorias", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [empresaId]);

  const categoriasFiltradas = useMemo(() => {
    const q = busca.toLowerCase();
    return categorias.filter((c) =>
      c.nome.toLowerCase().includes(q)
    );
  }, [categorias, busca]);

  const toggleCategoria = (nome) => {
    const atual = selecionadasSet.has(nome);
    onChange(
      atual
        ? categoriasSelecionadas.filter((c) => c !== nome)
        : [...categoriasSelecionadas, nome]
    );
  };

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const res = await fetch(endpointCategorias, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: novaCategoria }),
      });

      const nova = await res.json();

      setCategorias((prev) => [nova, ...prev]);
      setNovaCategoria("");

      showNotification("Categoria criada!", "success");
    } catch {
      showNotification("Erro ao criar categoria", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategoria = async (cat) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await fetch(`${endpointCategorias}/${cat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: novoNome }),
      });

      setCategorias((prev) =>
        prev.map((c) =>
          c.id === cat.id ? { ...c, nome: novoNome } : c
        )
      );

      setEditingId(null);
      showNotification("Categoria atualizada!", "success");
    } catch {
      showNotification("Erro ao editar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategoria = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      await fetch(`${endpointCategorias}/${categoriaParaExcluir.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategorias((prev) =>
        prev.filter((c) => c.id !== categoriaParaExcluir.id)
      );

      setCategoriaParaExcluir(null);
      showNotification("Removida!", "success");
    } catch {
      showNotification("Erro ao excluir", "error");
    } finally {
      setSaving(false);
    }
  };

  const containerClass = cx(
    "rounded-[28px] border p-4 sm:p-5 transition",
    isDark
      ? "border-white/10 bg-white/[0.04]"
      : "border-zinc-200 bg-white"
  );

  const inputClass = cx(
    "w-full bg-transparent outline-none text-sm",
    isDark ? "text-white placeholder:text-white/30" : "text-zinc-900"
  );

  return (
    <div className={containerClass}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 items-center">
          <Tag className="text-red-500" />
          <h3 className="font-extrabold text-sm">Categorias</h3>
        </div>

        <span className="text-xs opacity-60">
          {categoriasSelecionadas.length} selecionadas
        </span>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 mb-3 border rounded-2xl px-3 py-2">
        <Search className="w-4 h-4 opacity-50" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          className={inputClass}
        />
      </div>

      {/* ADD */}
      <div className="flex gap-2 mb-4">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          className={inputClass}
          placeholder="Nova categoria"
        />
        <button
          onClick={handleAddCategoria}
          className="bg-red-600 text-white px-3 rounded-xl"
        >
          <Plus />
        </button>
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="text-center py-6">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categoriasFiltradas.map((cat) => {
            const selected = selecionadasSet.has(cat.nome);

            return (
              <div
                key={cat.id}
                className={cx(
                  "px-3 py-1.5 rounded-full border flex items-center gap-2",
                  selected
                    ? "bg-red-600 text-white"
                    : isDark
                    ? "bg-white/5 border-white/10"
                    : "bg-white border-zinc-200"
                )}
              >
                <button onClick={() => toggleCategoria(cat.nome)}>
                  {cat.nome}
                </button>

                <Pencil
                  className="w-3 cursor-pointer"
                  onClick={() => {
                    setEditingId(cat.id);
                    setNovoNome(cat.nome);
                  }}
                />

                <Trash2
                  className="w-3 cursor-pointer"
                  onClick={() => setCategoriaParaExcluir(cat)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {categoriaParaExcluir && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-3xl">
            <p>Excluir categoria?</p>
            <button onClick={handleDeleteCategoria}>Confirmar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriaManager;