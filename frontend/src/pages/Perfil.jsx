import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  ShoppingBag,
  Plus,
  Pencil,
  X,
  LogOut,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageTitle from "../context/PageTitle";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const formatPhone = (phone) => {
  if (!phone) return "";
  const c = phone.replace(/\D/g, "");
  if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`;
  if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`;
  return phone;
};

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatMoney = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));

const STATUS_STYLE = {
  AGUARDANDO_PAGAMENTO: "text-yellow-700 bg-yellow-50 border-yellow-200",
  RECEBIDO: "text-amber-700 bg-amber-50 border-amber-200",
  EM_PREPARO: "text-orange-700 bg-orange-50 border-orange-200",
  PRONTO: "text-emerald-700 bg-emerald-50 border-emerald-200",
  SAIU_PARA_ENTREGA: "text-blue-700 bg-blue-50 border-blue-200",
  ENTREGUE: "text-zinc-500 bg-zinc-50 border-zinc-200",
  RETIRADO: "text-zinc-500 bg-zinc-50 border-zinc-200",
  CANCELADO: "text-red-700 bg-red-50 border-red-200",
};

const STATUS_LABEL = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagto.",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu p/ Entrega",
  ENTREGUE: "Entregue",
  RETIRADO: "Retirado",
  CANCELADO: "Cancelado",
};

/* ─────────────────────────── COMPONENT ─────────────────────────── */

export default function Perfil() {
  const { user, logout: authLogout, loadingAuth } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("perfil");
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Profile form */
  const [editingPerfil, setEditingPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState({});
  const [savingPerfil, setSavingPerfil] = useState(false);

  /* Address modal */
  const [modalEndereco, setModalEndereco] = useState(null);
  const [formEndereco, setFormEndereco] = useState({});
  const [savingEndereco, setSavingEndereco] = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loadingAuth, navigate]);

  /* ── Data fetching ── */
  const fetchPerfil = useCallback(async () => {
    if (!token) return;
    try {
      const url = `${API_URL}/clientes/me`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      const perfil = data?.perfil || {};
      setPerfil(perfil);
      setFormPerfil({
        nomeCompleto: perfil.nomeCompleto || "",
        email: data?.email || perfil.email || "",
        telefone: data?.telefone || perfil.telefone || user?.username || "",
        dataNascimento: perfil.dataNascimento || "",
      });
    } catch (e) {
      console.error("[PERFIL] Erro ao buscar perfil:", e);
    }
  }, [token, user?.username]);

  const fetchPedidos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/pedidos/me`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) return;
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao buscar pedidos:", e);
    }
  }, [token]);

  const fetchEnderecos = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/enderecos/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setEnderecos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Erro ao buscar endereços:", e);
    }
  }, [token]);

  const reloadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchPerfil(), fetchPedidos(), fetchEnderecos()]);
    setLoading(false);
  }, [fetchPerfil, fetchPedidos, fetchEnderecos]);

  useEffect(() => {
    if (user) reloadData();
  }, [user, reloadData]);

  /* ── Profile save ── */
  const salvarPerfil = async () => {
    setSavingPerfil(true);
    try {
      const payload = {
        nomeCompleto: formPerfil.nomeCompleto,
        email: formPerfil.email,
        telefone: formPerfil.telefone,
        dataNascimento: formPerfil.dataNascimento,
      };
      const res = await fetch(`${API_URL}/clientes/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erro ao atualizar perfil");
      toast.success("Perfil atualizado!");
      setEditingPerfil(false);
      await reloadData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingPerfil(false);
    }
  };

  const cancelPerfil = () => {
    setEditingPerfil(false);
    setFormPerfil({
      nomeCompleto: perfil?.nomeCompleto || "",
      email: perfil?.email || "",
      telefone: perfil?.telefone || "",
      dataNascimento: perfil?.dataNascimento || "",
    });
  };

  /* ── Address CRUD ── */
  const salvarEndereco = async () => {
    if (!formEndereco.logradouro || !formEndereco.numero) {
      toast.error("Preencha rua e número");
      return;
    }
    setSavingEndereco(true);
    try {
      const method = formEndereco.id ? "PUT" : "POST";
      const url = formEndereco.id
        ? `${API_URL}/enderecos/${formEndereco.id}`
        : `${API_URL}/enderecos/me`;
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formEndereco),
      });
      if (!res.ok) throw new Error("Erro ao salvar endereço");
      toast.success(formEndereco.id ? "Endereço atualizado!" : "Endereço adicionado!");
      setModalEndereco(null);
      setFormEndereco({});
      await reloadData();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingEndereco(false);
    }
  };

  const togglePadrao = async (end) => {
    try {
      const res = await fetch(`${API_URL}/enderecos/${end.id}/padrao`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao tornar padrão");
      toast.success("Endereço padrão alterado!");
      await reloadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deletarEndereco = async (id) => {
    try {
      const res = await fetch(`${API_URL}/enderecos/me/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar endereço");
      toast.success("Endereço removido!");
      await reloadData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  /* ── Logout ── */
  const handleLogout = () => {
    authLogout?.();
    navigate("/login", { replace: true });
  };

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = pedidos.length;
    const entregues = pedidos.filter((p) =>
      ["ENTREGUE", "RETIRADO"].includes(p.status)
    ).length;
    const cancelados = pedidos.filter((p) => p.status === "CANCELADO").length;
    const totalGasto = pedidos
      .filter((p) => ["ENTREGUE", "RETIRADO"].includes(p.status))
      .reduce((acc, p) => acc + Number(p.total || 0), 0);
    return { total, entregues, cancelados, totalGasto };
  }, [pedidos]);

  /* ── Loading ── */
  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-zinc-200 border-t-zinc-500 rounded-full animate-spin" />
      </div>
    );
  }

  /* ─────────────────────────── RENDER ─────────────────────────── */

  const TABS = [
    { key: "perfil", label: "Perfil", Icon: User },
    { key: "endereco", label: "Endereços", Icon: MapPin },
    { key: "pedidos", label: "Pedidos", Icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <PageTitle title="Meu Perfil" />

      {/* ── Header ── */}
      <div className="border-b border-zinc-200 pt-20 pb-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">Meu Perfil</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Gerencie seus dados, endereços e pedidos
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-white/10 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-500/15 transition"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total de pedidos", value: stats.total },
              { label: "Entregues", value: stats.entregues, tone: "emerald" },
              { label: "Cancelados", value: stats.cancelados, tone: "red" },
              { label: "Total gasto", value: formatMoney(stats.totalGasto) },
            ].map((s, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-4 ${
                  s.tone === "emerald"
                    ? "border-emerald-200 bg-emerald-50"
                    : s.tone === "red"
                    ? "border-red-200 bg-red-50"
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-[0.12em] ${
                  s.tone === "emerald" ? "text-emerald-700" :
                  s.tone === "red" ? "text-red-700" : "text-zinc-900/35"
                }`}>
                  {s.label}
                </div>
                <div className="mt-2 text-xl font-extrabold sm:text-2xl">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setModalEndereco(null); }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === key
                    ? "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-zinc-900 shadow-[0_12px_28px_rgba(229,37,42,0.25)]"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-900/70 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* ═══════ PERFIL ═══════ */}
        {activeTab === "perfil" && (
          <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Dados pessoais</h2>
              {!editingPerfil && (
                <button
                  onClick={() => setEditingPerfil(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-zinc-900/70 hover:bg-white/10 transition"
                >
                  <Pencil className="h-4 w-4" /> Editar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Nome */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Nome completo</label>
                {editingPerfil ? (
                  <input
                    type="text"
                    value={formPerfil.nomeCompleto || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, nomeCompleto: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-900/25 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    {perfil?.nomeCompleto || "—"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">E-mail</label>
                {editingPerfil ? (
                  <input
                    type="email"
                    value={formPerfil.email || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-900/25 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-900/25" />
                    {perfil?.email || "—"}
                  </div>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Telefone</label>
                <div className="mt-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-zinc-900/25" />
                  {formatPhone(perfil?.telefone || user?.username)}
                </div>
              </div>

              {/* Data Nasc */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Data de nascimento</label>
                {editingPerfil ? (
                  <input
                    type="date"
                    value={formPerfil.dataNascimento || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, dataNascimento: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    {formatDate(perfil?.dataNascimento)}
                  </div>
                )}
              </div>
            </div>

            {editingPerfil && (
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={salvarPerfil}
                  disabled={savingPerfil}
                  className="rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-2.5 text-sm font-bold text-zinc-900 disabled:opacity-50 shadow-[0_12px_28px_rgba(229,37,42,0.25)] transition"
                >
                  {savingPerfil ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={cancelPerfil}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-sm font-bold text-zinc-900/70 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════ ENDEREÇOS ═══════ */}
        {activeTab === "endereco" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Seus endereços</h2>
              <button
                onClick={() => { setFormEndereco({}); setModalEndereco(true); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E5252A] px-4 py-2 text-sm font-bold text-zinc-900 shadow-[0_12px_28px_rgba(229,37,42,0.25)] transition"
              >
                <Plus className="h-4 w-4" /> Novo endereço
              </button>
            </div>

            {enderecos.length === 0 ? (
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-10 text-center">
                <MapPin className="mx-auto h-10 w-10 text-zinc-900/20" />
                <p className="mt-3 text-sm text-zinc-500">Nenhum endereço cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {enderecos.map((end) => (
                  <div key={end.id} className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate">{end.logradouro}, {end.numero}</p>
                          {end.padrao && (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 shrink-0">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {[end.complemento, end.bairro, end.cidade, end.estado].filter(Boolean).join(" • ")}
                        </p>
                        {end.cep && <p className="mt-1 text-xs font-bold text-zinc-900/70">CEP: {end.cep}</p>}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!end.padrao && (
                          <button
                            onClick={() => togglePadrao(end)}
                            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-[11px] font-bold text-zinc-900/60 hover:bg-white/10 transition"
                          >
                            Padrão
                          </button>
                        )}
                        <button
                          onClick={() => { setFormEndereco(end); setModalEndereco(true); }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900/60 hover:text-zinc-900 hover:bg-white/10 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deletarEndereco(end.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-500/15 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Modal Endereço ── */}
            {modalEndereco && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalEndereco(null)} />
                <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold">
                      {formEndereco.id ? "Editar endereço" : "Novo endereço"}
                    </h3>
                    <button onClick={() => setModalEndereco(null)} className="grid h-8 w-8 place-items-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900/60 hover:text-zinc-900">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Rua / Logradouro</label>
                      <input type="text" value={formEndereco.logradouro || ""} onChange={(e) => setFormEndereco({ ...formEndereco, logradouro: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Número</label>
                      <input type="text" value={formEndereco.numero || ""} onChange={(e) => setFormEndereco({ ...formEndereco, numero: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Complemento</label>
                      <input type="text" value={formEndereco.complemento || ""} onChange={(e) => setFormEndereco({ ...formEndereco, complemento: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" placeholder="Apto 101" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Bairro</label>
                      <input type="text" value={formEndereco.bairro || ""} onChange={(e) => setFormEndereco({ ...formEndereco, bairro: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">CEP</label>
                      <input type="text" value={formEndereco.cep || ""} onChange={(e) => setFormEndereco({ ...formEndereco, cep: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Cidade</label>
                      <input type="text" value={formEndereco.cidade || ""} onChange={(e) => setFormEndereco({ ...formEndereco, cidade: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400">Estado</label>
                      <input type="text" value={formEndereco.estado || ""} onChange={(e) => setFormEndereco({ ...formEndereco, estado: e.target.value })} className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={() => setModalEndereco(null)} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-2.5 text-sm font-bold text-zinc-900/70 hover:bg-white/10 transition">Cancelar</button>
                    <button onClick={salvarEndereco} disabled={savingEndereco} className="rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-2.5 text-sm font-bold text-zinc-900 disabled:opacity-50 transition">
                      {savingEndereco ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ PEDIDOS ═══════ */}
        {activeTab === "pedidos" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Histórico de pedidos</h2>
              <span className="text-sm text-zinc-500">{pedidos.length} pedido(s)</span>
            </div>

            {pedidos.length === 0 ? (
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-10 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-zinc-900/20" />
                <p className="mt-3 text-sm text-zinc-500">Nenhum pedido realizado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...pedidos].sort((a, b) => new Date(b.data) - new Date(a.data)).map((p) => {
                  const style = STATUS_STYLE[p.status] || "text-zinc-500 bg-white/10 border-zinc-200";
                  const label = STATUS_LABEL[p.status] || p.status || "—";
                  return (
                    <div
                      key={p.id}
                      className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left */}
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-zinc-900 grid place-items-center text-sm font-black shadow-[0_10px_24px_rgba(229,37,42,0.28)] shrink-0">
                            #{p.id}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold">
                                {(p.itens || []).length} itens</p>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${style}`}>{label}</span>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">
                              {formatDate(p.data)} • {formatMoney(p.total || 0)}
                            </p>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="shrink-0">
                          <ChevronRight className="h-5 w-5 text-zinc-900/20" />
                        </div>
                      </div>

                      {/* Items */}
                      {(p.itens || []).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs text-zinc-500 mb-2">Itens do pedido</p>
                          <div className="flex flex-wrap gap-1.5">
                            {(p.itens || []).map((it, i) => (
                              <span key={i} className="text-xs bg-zinc-50 rounded-full px-2.5 py-1 text-zinc-900/60">
                                {it.quantidade}x {it.nomeProduto || it.nome || "Item"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile logout */}
      <div className="sm:hidden fixed bottom-4 right-4">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 shadow-lg"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </div>
  );
}
