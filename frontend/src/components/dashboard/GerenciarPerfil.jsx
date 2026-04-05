import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Store,
  CreditCard,
  MapPin,
  Clock,
  Upload,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

const API_URL = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("token");
}

export default function GerenciarPerfil({ isDark = true, empresaId }) {
  const { showNotification } = useNotification();
  const [tab, setTab] = useState("geral");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nomeFantasia: "",
    razaoSocial: "",
    cnpj: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    aceitaRetirada: true,
    aceitaDelivery: true,
    raioEntregaKm: 10,
    taxaEntregaFixa: 5.99,
    valorPorKm: 1.5,
    pedidoMinimoDelivery: 20,
    valorFreteGratis: 80,
  });

  const [mpStatus, setMpStatus] = useState({
    conectada: false,
    userId: null,
    temAccessToken: false,
    publicKey: null,
  });

  const [mpLoading, setMpLoading] = useState(false);
  const [mpConnectLoading, setMpConnectLoading] = useState(false);

  // Carrega dados da empresa
  useEffect(() => {
    if (!empresaId) return;
    setLoading(true);
    fetch(`${API_URL}/empresas/${empresaId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            nomeFantasia: data.nomeFantasia || "",
            razaoSocial: data.razaoSocial || "",
            cnpj: data.cnpj || "",
            telefone: data.telefone || "",
            cep: data.cep || "",
            logradouro: data.logradouro || "",
            numero: data.numero || "",
            bairro: data.bairro || "",
            cidade: data.cidade || "",
            uf: data.uf || "",
            aceitaRetirada: data.aceitaRetirada !== false,
            aceitaDelivery: data.aceitaDelivery !== false,
            raioEntregaKm: data.raioEntregaKm || 10,
            taxaEntregaFixa: data.taxaEntregaFixa || 5.99,
            valorPorKm: data.valorPorKm || 1.5,
            pedidoMinimoDelivery: data.pedidoMinimoDelivery || 20,
            valorFreteGratis: data.valorFreteGratis || 80,
          });
        }
      })
      .catch(() => showNotification("Erro ao carregar dados da empresa.", "error"))
      .finally(() => setLoading(false));
  }, [empresaId]);

  // Carrega status do MercadoPago
  useEffect(() => {
    if (!empresaId) return;
    setMpLoading(true);
    fetch(`${API_URL}/empresas/${empresaId}/mp/status`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMpStatus(data);
      })
      .finally(() => setMpLoading(false));
  }, [empresaId]);

  const updateForm = useCallback((key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSalvar = async () => {
    if (!form.nomeFantasia) return showNotification("Nome fantasia é obrigatório.", "error");
    if (!form.cnpj) return showNotification("CNPJ é obrigatório.", "error");

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/empresas/${empresaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          nomeFantasia: form.nomeFantasia,
          cnpj: form.cnpj,
          horariosFuncionamento: null,
        }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao atualizar empresa.");
      }
      showNotification("Dados atualizados com sucesso!", "success");
    } catch (e) {
      showNotification(e.message || "Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConectarMp = async () => {
    if (!empresaId) return;
    setMpConnectLoading(true);

    try {
      const res = await fetch(`${API_URL}/empresas/${empresaId}/mp/connect`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Erro ao gerar URL de autorização.");

      const data = await res.json();
      if (data.url) {
        // Abre popup de OAuth
        const popupWidth = 600;
        const popupHeight = 700;
        const left = window.screen.width / 2 - popupWidth / 2;
        const top = window.screen.height / 2 - popupHeight / 2;

        const popup = window.open(
          data.url,
          "mp_oauth",
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
        );

        // Poll para verificar se o callback completou
        const poll = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(poll);
            // Recarrega o status MP
            fetch(`${API_URL}/empresas/${empresaId}/mp/status`, {
              headers: { Authorization: `Bearer ${getToken()}` },
            })
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (data) {
                  setMpStatus(data);
                  if (data.conectada) {
                    showNotification("Conta MercadoPago conectada!", "success");
                  }
                }
              });
          }
        }, 1000);
      }
    } catch (e) {
      showNotification(e.message || "Erro ao conectar.", "error");
    } finally {
      setMpConnectLoading(false);
    }
  };

  const handleDesconectarMp = async () => {
    if (!empresaId) return;
    setMpConnectLoading(true);

    try {
      const res = await fetch(`${API_URL}/empresas/${empresaId}/mp/disconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Erro ao desconectar.");

      setMpStatus({ conectada: false, userId: null, temAccessToken: false, publicKey: null });
      showNotification("Conta MercadoPago desconectada.", "success");
    } catch (e) {
      showNotification(e.message || "Erro ao desconectar.", "error");
    } finally {
      setMpConnectLoading(false);
    }
  };

  const tabs = [
    { id: "geral", label: "Dados gerais", icon: Store },
    { id: "endereco", label: "Endereço", icon: MapPin },
    { id: "entrega", label: "Entrega / Retirada", icon: Clock },
    { id: "pagamento", label: "Pagamentos", icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? "border-[#E5252A]/30 bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white"
                  : isDark
                  ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Geral */}
      {tab === "geral" && (
        <div className={`rounded-3xl border p-6 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-white"}`}>
          <h3 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
            Informações do restaurante
          </h3>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-zinc-500"}`}>
            Dados básicos que os clientes veem.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Nome fantasia *
              </label>
              <input
                type="text"
                value={form.nomeFantasia}
                onChange={(e) => updateForm("nomeFantasia", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${
                  isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"
                }`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Razão social
              </label>
              <input
                type="text"
                value={form.razaoSocial}
                onChange={(e) => updateForm("razaoSocial", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${
                  isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"
                }`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                CNPJ *
              </label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => updateForm("cnpj", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${
                  isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"
                }`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Telefone
              </label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => updateForm("telefone", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${
                  isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleSalvar}
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Salvar alterações
          </button>
        </div>
      )}

      {/* Endereço */}
      {tab === "endereco" && (
        <div className={`rounded-3xl border p-6 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-white"}`}>
          <h3 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
            Endereço
          </h3>
          <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-zinc-500"}`}>
            Endereço visível no seu perfil e cálculos de entrega.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>CEP</label>
              <input
                type="text"
                value={form.cep}
                onChange={(e) => updateForm("cep", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Número</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => updateForm("numero", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Logradouro</label>
              <input
                type="text"
                value={form.logradouro}
                onChange={(e) => updateForm("logradouro", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Bairro</label>
              <input
                type="text"
                value={form.bairro}
                onChange={(e) => updateForm("bairro", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => updateForm("cidade", e.target.value)}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>UF</label>
              <input
                type="text"
                value={form.uf}
                onChange={(e) => updateForm("uf", e.target.value)}
                maxLength={2}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
          </div>

          <button
            onClick={handleSalvar}
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Salvar endereço
          </button>
        </div>
      )}

      {/* Entrega / Retirada */}
      {tab === "entrega" && (
        <div className={`rounded-3xl border p-6 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-white"}`}>
          <h3 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
            Configurações de entrega
          </h3>

          <div className="mt-6 space-y-4">
            {/* Toggles */}
            <ToggleField
              label="Aceita delivery"
              description="Clientes podem pedir entrega"
              value={form.aceitaDelivery}
              onChange={(v) => updateForm("aceitaDelivery", v)}
              isDark={isDark}
            />
            <ToggleField
              label="Aceita retirada no local"
              description="Clientes podem retirar no estabelecimento"
              value={form.aceitaRetirada}
              onChange={(v) => updateForm("aceitaRetirada", v)}
              isDark={isDark}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Raio de entrega (km)
              </label>
              <input
                type="number"
                value={form.raioEntregaKm}
                onChange={(e) => updateForm("raioEntregaKm", Number(e.target.value))}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Taxa fixa de entrega (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.taxaEntregaFixa}
                onChange={(e) => updateForm("taxaEntregaFixa", Number(e.target.value))}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Valor por km (R$)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.valorPorKm}
                onChange={(e) => updateForm("valorPorKm", Number(e.target.value))}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
            <div>
              <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Pedido mínimo delivery (R$)
              </label>
              <input
                type="number"
                step="1"
                value={form.pedidoMinimoDelivery}
                onChange={(e) => updateForm("pedidoMinimoDelivery", Number(e.target.value))}
                className={`w-full mt-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white"}`}
              />
            </div>
          </div>

          <button
            onClick={handleSalvar}
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Salvar configurações
          </button>
        </div>
      )}

      {/* Mercado Pago */}
      {tab === "pagamento" && (
        <div className={`rounded-3xl border p-6 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-lg font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                Mercado Pago
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                Conecte sua conta do Mercado Pago para receber pagamentos diretamente.
              </p>
            </div>
          </div>

          {mpLoading ? (
            <div className="mt-6 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className={`text-sm ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                Verificando conexão...
              </span>
            </div>
          ) : mpStatus.conectada ? (
            <div className={`mt-6 rounded-2xl border p-5 ${isDark ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <span className={`font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
                  Conta conectada
                </span>
              </div>
              <p className={`text-sm mt-2 ${isDark ? "text-emerald-200/80" : "text-emerald-600"}`}>
                User ID: {mpStatus.userId || "—"}
              </p>
              {mpStatus.publicKey && (
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs ${isDark ? "text-emerald-200/60" : "text-emerald-500"}`}>
                    Public key:
                  </span>
                  <code className={`text-xs px-2 py-1 rounded ${isDark ? "bg-black/20" : "bg-white"}`}>
                    {mpStatus.publicKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(mpStatus.publicKey);
                      showNotification("Public key copiada.", "success");
                    }}
                    className={`text-xs ${isDark ? "text-emerald-200/60 hover:text-emerald-300" : "text-emerald-500"}`}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleDesconectarMp}
                  disabled={mpConnectLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/15 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div className={`mt-6 rounded-2xl border p-5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50"}`}>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className={`h-6 w-6 ${isDark ? "text-white/40" : "text-zinc-400"}`} />
                <div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                    Nenhuma conta conectada
                  </p>
                  <p className={`text-sm ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Ao conectar, os pagamentos vão para sua conta Mercado Pago automaticamente.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConectarMp}
                disabled={mpConnectLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#009EE3] to-[#007BB5] px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-50"
              >
                {mpConnectLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Conectar Mercado Pago
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToggleField({ label, description, value, onChange, isDark }) {
  const ToggleIcon = value ? ToggleRight : ToggleLeft;
  return (
    <div className={`flex items-center justify-between rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
      <div>
        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{label}</p>
        <p className={`text-xs ${isDark ? "text-white/45" : "text-zinc-500"}`}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`h-8 w-14 rounded-full border transition ${
          value
            ? "bg-emerald-500 border-emerald-500/50"
            : isDark
            ? "bg-white/10 border-white/10"
            : "bg-zinc-200 border-zinc-200"
        }`}
      >
        <div className={`h-6 w-6 rounded-full bg-white transition transform ${value ? "ml-6" : "ml-1"}`} />
      </button>
    </div>
  );
}
