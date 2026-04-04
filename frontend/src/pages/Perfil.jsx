import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Hash,
  Calendar,
  MapPin,
  Plus,
  Pencil,
  X,
  LogOut,
  Clock,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageTitle from "../context/PageTitle";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const formatPhone = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
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

const STATUS_CONFIG = {
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  RECEBIDO: { label: "Recebido", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  EM_PREPARO: { label: "Em Preparo", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  PRONTO: { label: "Pronto", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  SAIU_PARA_ENTREGA: { label: "Saiu para Entrega", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ENTREGUE: { label: "Entregue", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
  RETIRADO: { label: "Retirado", color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
  CANCELADO: { label: "Cancelado", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function Perfil() {
  const { user, logout: authLogout, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("perfil");
  const [perfil, setPerfil] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPerfil, setEditingPerfil] = useState(false);
  const [formPerfil, setFormPerfil] = useState({});
  const [savingPerfil, setSavingPerfil] = useState(false);

  const [modalEndereco, setModalEndereco] = useState(null);
  const [formEndereco, setFormEndereco] = useState({});
  const [savingEndereco, setSavingEndereco] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loadingAuth, navigate]);

  const token = localStorage.getItem("token");

  const fetchPerfil = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      let perfilFull = null;
      if (data?.perfil?.id) {
        const resP = await fetch(`${API_URL}/perfis/${data.perfil.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resP.ok) perfilFull = await resP.json();
      }

      setPerfil(perfilFull || {});
      setFormPerfil({
        nomeCompleto: perfilFull?.nomeCompleto || "",
        email: perfilFull?.email || "",
        telefone: perfilFull?.telefone || "",
        cpf: perfilFull?.cpf || "",
        dataNascimento: perfilFull?.dataNascimento || "",
      });
    } catch (e) {
      console.error("Erro ao buscar perfil:", e);
    }
  }, [token]);

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

  /* ── Perfil ── */
  const salvarPerfil = async () => {
    setSavingPerfil(true);
    try {
      const res = await fetch(`${API_URL}/perfis/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPerfil),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Erro ao atualizar perfil");
      }
      toast.success("Perfil atualizado!");
      setEditingPerfil(false);
      await reloadData();
    } catch (e) {
      toast.error(e.message || "Erro ao atualizar perfil");
    } finally {
      setSavingPerfil(false);
    }
  };

  /* ── Endereço ── */
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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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

  const togglePadrao = async (endereco) => {
    try {
      const res = await fetch(`${API_URL}/enderecos/${endereco.id}/padrao`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        toast.error("Erro ao tornar endereço padrão");
        return;
      }
      toast.success("Endereço padrão alterado!");
      await reloadData();
    } catch (e) {
      toast.error("Erro ao alterar endereço padrão");
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

  /* ── Recent pedidos (últimos 5) ── */
  const pedidosRecentes = useMemo(() => {
    return [...pedidos].sort(
      (a, b) => new Date(b.data) - new Date(a.data)
    ).slice(0, 10);
  }, [pedidos]);

  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <PageTitle title="Meu Perfil" />

      {/* Header */}
      <div className="border-b border-white/10 bg-[#0D0D0D] pt-20 pb-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold">Meu Perfil</h1>
              <p className="mt-1 text-sm text-white/50">
                Gerencie seus dados, endereços e pedidos
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/", { state: { from: { pathname: location.pathname, search: location.search } } })}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Voltar
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/15 transition"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                Total de pedidos
              </div>
              <div className="mt-2 text-2xl font-extrabold">{stats.total}</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-300">
                Entregues
              </div>
              <div className="mt-2 text-2xl font-extrabold text-emerald-300">{stats.entregues}</div>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-red-300">
                Cancelados
              </div>
              <div className="mt-2 text-2xl font-extrabold text-red-300">{stats.cancelados}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                Total gasto
              </div>
              <div className="mt-2 text-2xl font-extrabold">{formatMoney(stats.totalGasto)}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            {[
              { key: "perfil", label: "Perfil", Icon: User },
              { key: "endereco", label: "Endereços", Icon: MapPin },
              { key: "pedidos", label: "Pedidos", Icon: ShoppingBag },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  activeTab === key
                    ? "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_12px_28px_rgba(229,37,42,0.25)]"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* ── Perfil ── */}
        {activeTab === "perfil" && (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Dados pessoais</h2>
              {!editingPerfil && (
                <button
                  onClick={() => setEditingPerfil(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10 transition"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  Nome completo
                </label>
                {editingPerfil ? (
                  <input
                    type="text"
                    value={formPerfil.nomeCompleto || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, nomeCompleto: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85">
                    {perfil?.nomeCompleto || "—"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  E-mail
                </label>
                {editingPerfil ? (
                  <input
                    type="email"
                    value={formPerfil.email || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, email: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85">
                    {perfil?.email || "—"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  Telefone
                </label>
                <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85">
                  {formatPhone(perfil?.telefone || user?.username)}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  CPF
                </label>
                {editingPerfil ? (
                  <input
                    type="text"
                    value={formPerfil.cpf || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, cpf: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                    placeholder="000.000.000-00"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85">
                    {perfil?.cpf || "—"}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                  Data de nascimento
                </label>
                {editingPerfil ? (
                  <input
                    type="date"
                    value={formPerfil.dataNascimento || ""}
                    onChange={(e) => setFormPerfil({ ...formPerfil, dataNascimento: e.target.value })}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  />
                ) : (
                  <div className="mt-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/85">
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
                  className="rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 shadow-[0_12px_28px_rgba(229,37,42,0.25)] transition"
                >
                  {savingPerfil ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => {
                    setEditingPerfil(false);
                    setFormPerfil({
                      nomeCompleto: perfil?.nomeCompleto || "",
                      email: perfil?.email || "",
                      telefone: perfil?.telefone || "",
                      cpf: perfil?.cpf || "",
                      dataNascimento: perfil?.dataNascimento || "",
                    });
                  }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Endereços ── */}
        {activeTab === "endereco" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Seus endereços</h2>
              <button
                onClick={() => {
                  setFormEndereco({});
                  setModalEndereco(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E5252A] px-4 py-2 text-sm font-bold text-white shadow-[0_12px_28px_rgba(229,37,42,0.25)] transition"
              >
                <Plus className="h-4 w-4" />
                Novo endereço
              </button>
            </div>

            {enderecos.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center">
                <MapPin className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm text-white/50">Nenhum endereço cadastrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {enderecos.map((end) => (
                  <div
                    key={end.id}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold">{end.logradouro}, {end.numero}</p>
                          {end.padrao && (
                            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-white/50">
                          {[end.complemento, end.bairro, end.cidade, end.estado]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        {end.cep && (
                          <p className="mt-1 text-xs font-bold text-white/70">CEP: {end.cep}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!end.padrao && (
                          <button
                            onClick={() => togglePadrao(end)}
                            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white/70 hover:bg-white/10 transition"
                          >
                            Definir como padrão
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setFormEndereco(end);
                            setModalEndereco(true);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deletarEndereco(end.id)}
                          className="grid h-8 w-8 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15 transition"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Endereco */}
            {modalEndereco && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalEndereco(null)} />
                <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#171717] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold">
                      {formEndereco.id ? "Editar endereço" : "Novo endereço"}
                    </h3>
                    <button onClick={() => setModalEndereco(null)} className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Rua / Logradouro</label>
                      <input type="text" value={formEndereco.logradouro || ""} onChange={(e) => setFormEndereco({ ...formEndereco, logradouro: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Número</label>
                      <input type="text" value={formEndereco.numero || ""} onChange={(e) => setFormEndereco({ ...formEndereco, numero: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Complemento</label>
                      <input type="text" value={formEndereco.complemento || ""} onChange={(e) => setFormEndereco({ ...formEndereco, complemento: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" placeholder="Apto 101" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Bairro</label>
                      <input type="text" value={formEndereco.bairro || ""} onChange={(e) => setFormEndereco({ ...formEndereco, bairro: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">CEP</label>
                      <input type="text" value={formEndereco.cep || ""} onChange={(e) => setFormEndereco({ ...formEndereco, cep: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Cidade</label>
                      <input type="text" value={formEndereco.cidade || ""} onChange={(e) => setFormEndereco({ ...formEndereco, cidade: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Estado</label>
                      <input type="text" value={formEndereco.estado || ""} onChange={(e) => setFormEndereco({ ...formEndereco, estado: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20" />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => setModalEndereco(null)} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 transition">Cancelar</button>
                    <button onClick={salvarEndereco} disabled={savingEndereco} className="rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition">
                      {savingEndereco ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pedidos ── */}
        {activeTab === "pedidos" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Histórico de pedidos</h2>
              <span className="text-sm text-white/50">{pedidos.length} pedido(s)</span>
            </div>

            {pedidosRecentes.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-10 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-white/20" />
                <p className="mt-3 text-sm text-white/50">Nenhum pedido realizado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidosRecentes.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] || { label: p.status, color: "text-white/50", bg: "bg-white/10", border: "border-white/10" };
                  return (
                    <div
                      key={p.id}
                      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white grid place-items-center text-sm font-black shadow-[0_10px_24px_rgba(229,37,42,0.28)]">
                            #{p.id}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold">
                                {(p.itens || []).length} ite