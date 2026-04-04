import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChefHat,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  MapPin,
  Phone,
  ShoppingBag,
  Truck,
  Package,
  Sun,
  Moon,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRestaurantNotifications } from "../../../context/RestaurantNotificationContext";

const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const textSafe = "min-w-0 break-words whitespace-normal [overflow-wrap:anywhere]";
const clamp2 = "line-clamp-2";
const clamp3 = "line-clamp-3";

function getTempoEmMinutos(data) {
  if (!data) return 0;

  const agora = new Date();
  const criadoEm = new Date(data);
  const diffMs = agora - criadoEm;

  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

function formatDate(date) {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function formatPhone(phone) {
  if (!phone) return "—";

  const cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

function sortPedidosByTempo(lista = []) {
  return [...lista].sort((a, b) => {
    const diff = getTempoEmMinutos(b.data) - getTempoEmMinutos(a.data);
    if (diff !== 0) return diff;

    return new Date(a.data || 0).getTime() - new Date(b.data || 0).getTime();
  });
}

function getObservacaoGeral(pedido) {
  return (
    pedido?.observacao ||
    pedido?.observacoes ||
    pedido?.itens?.find((item) => item?.observacao)?.observacao ||
    ""
  );
}

function getTipoEntrega(pedido) {
  return pedido?.enderecoEntrega ? "DELIVERY" : "RETIRADA";
}

function getEntregaLabel(pedido) {
  return getTipoEntrega(pedido) === "DELIVERY" ? "Delivery" : "Retirada";
}

function getEntregaIcon(pedido) {
  return getTipoEntrega(pedido) === "DELIVERY" ? Truck : Package;
}

function getLocalEntrega(pedido) {
  if (pedido?.enderecoEntrega) {
    const endereco = pedido.enderecoEntrega;
    const partes = [
      endereco?.logradouro &&
        `${endereco.logradouro}${endereco?.numero ? `, ${endereco.numero}` : ""}`,
      endereco?.bairro,
      endereco?.cidade,
      endereco?.estado,
      endereco?.cep,
    ].filter(Boolean);

    return partes.join(" • ") || "Endereço informado";
  }

  return "Retirada no local";
}

function getStatusLabel(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "PRONTO") return "Pronto";
  if (normalized === "RECEBIDO") return "Recebido";
  if (normalized === "EM_PREPARO") return "Em preparo";
  return normalized || "—";
}

function getCardTone(pedido) {
  const status = String(pedido?.status || "").toUpperCase();
  const tempo = getTempoEmMinutos(pedido?.data);

  if (status === "PRONTO") {
    return "ready";
  }

  if (tempo >= 50) return "danger";
  if (tempo >= 35) return "warning";
  return "prep";
}

function getThemeClasses(theme) {
  const dark = theme === "dark";

  return {
    page: dark
      ? "bg-zinc-950 text-white"
      : "bg-[radial-gradient(circle_at_top,_#ffffff,_#f4f4f5_55%,_#e4e4e7)] text-zinc-950",

    pageOverlay: dark
      ? "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_35%)]"
      : "bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.10),_transparent_35%)]",

    heroCard: dark
      ? "border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.40)]"
      : "border-white/70 bg-white/80 shadow-[0_20px_80px_rgba(24,24,27,0.08)] backdrop-blur",

    heroSubtext: dark ? "text-zinc-400" : "text-zinc-600",

    chipConnected: dark
      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20"
      : "bg-emerald-50 text-emerald-700 border border-emerald-200",

    chipDisconnected: dark
      ? "bg-zinc-800 text-zinc-300 border border-white/10"
      : "bg-zinc-100 text-zinc-700 border border-zinc-200",

    buttonPrimary: dark
      ? "bg-white text-black hover:bg-zinc-100"
      : "bg-zinc-950 text-white hover:bg-zinc-800",

    buttonGhost: dark
      ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
      : "bg-white/80 text-zinc-900 border border-zinc-200 hover:bg-white",

    errorBox: dark
      ? "border border-red-400/30 bg-red-500/10 text-red-100"
      : "border border-red-200 bg-red-50 text-red-700",

    columnShell: dark
      ? "border border-white/10 bg-white/[0.03]"
      : "border border-zinc-200 bg-white/60 backdrop-blur",

    columnCounter: dark
      ? "bg-white/10 text-white"
      : "bg-zinc-900 text-white",

    emptyBox: dark
      ? "border border-dashed border-white/15 bg-white/[0.03] text-zinc-500"
      : "border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400",

    sectionPanel: dark
      ? "bg-black/15"
      : "bg-zinc-950/[0.04]",

    itemPanel: dark
      ? "bg-black/10"
      : "bg-zinc-950/[0.05]",

    mutedText: dark ? "text-zinc-400" : "text-zinc-600",
  };
}

function getCardClasses(theme, pedido) {
  const dark = theme === "dark";
  const tone = getCardTone(pedido);

  const map = {
    dark: {
      prep: "border-orange-400/70 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-[0_18px_50px_rgba(249,115,22,0.35)]",
      warning:
        "border-amber-300/80 bg-gradient-to-br from-amber-300 to-amber-400 text-zinc-950 shadow-[0_18px_50px_rgba(245,158,11,0.30)]",
      danger:
        "border-red-400/80 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[0_18px_50px_rgba(239,68,68,0.35)]",
      ready:
        "border-emerald-400/80 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_18px_50px_rgba(16,185,129,0.35)]",
    },
    light: {
      prep: "border-orange-200 bg-gradient-to-br from-orange-100 to-orange-200 text-zinc-950 shadow-[0_18px_50px_rgba(249,115,22,0.12)]",
      warning:
        "border-amber-200 bg-gradient-to-br from-amber-100 to-amber-200 text-zinc-950 shadow-[0_18px_50px_rgba(245,158,11,0.12)]",
      danger:
        "border-red-200 bg-gradient-to-br from-red-100 to-red-200 text-zinc-950 shadow-[0_18px_50px_rgba(239,68,68,0.14)]",
      ready:
        "border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-200 text-zinc-950 shadow-[0_18px_50px_rgba(16,185,129,0.14)]",
    },
  };

  return dark ? map.dark[tone] : map.light[tone];
}

function getHeaderTone(theme, tone) {
  if (theme === "dark") {
    return tone === "green" ? "text-emerald-400" : "text-orange-400";
  }

  return tone === "green" ? "text-emerald-700" : "text-orange-700";
}

function renderOpcionais(item, theme, compactMode) {
  const grupos = item?.opcionais || [];
  if (!grupos.length) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {grupos.map((grupo, indexGrupo) => (
        <div
          key={`${grupo.grupoId || indexGrupo}`}
          className={`text-sm break-words whitespace-normal [overflow-wrap:anywhere] ${
            theme === "dark" ? "text-white/85" : "text-zinc-700"
          } ${compactMode ? clamp2 : ""}`}
          title={
            compactMode
              ? `${grupo.grupoNome}: ${(grupo.itens || [])
                  .map((op) => {
                    const qtd = Number(op?.quantidade || 1);
                    return `${qtd > 1 ? `${qtd}x ` : ""}${op?.nome || "Opcional"}`;
                  })
                  .join(", ")}`
              : undefined
          }
        >
          <span className="font-bold break-words [overflow-wrap:anywhere]">
            {grupo.grupoNome}:
          </span>{" "}
          {(grupo.itens || [])
            .map((op) => {
              const qtd = Number(op?.quantidade || 1);
              return `${qtd > 1 ? `${qtd}x ` : ""}${op?.nome || "Opcional"}`;
            })
            .join(", ")}
        </div>
      ))}
    </div>
  );
}

function ThemeToggle({ theme, onToggle, classes }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
        classes.buttonGhost,
      ].join(" ")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Tema claro" : "Tema escuro"}
    </button>
  );
}

function InfoToggle({ compactMode, onToggle, classes }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition",
        classes.buttonGhost,
      ].join(" ")}
    >
      {compactMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      {compactMode ? "Mostrar mais infos" : "Mostrar menos infos"}
    </button>
  );
}

function PedidoTVCard({ pedido, theme, classes, compactMode = false }) {
  const tempo = getTempoEmMinutos(pedido.data);
  const observacaoGeral = getObservacaoGeral(pedido);
  const EntregaIcon = getEntregaIcon(pedido);
  const entregaLabel = getEntregaLabel(pedido);
  const localEntrega = getLocalEntrega(pedido);
  const itens = pedido?.itens || [];

  return (
    <div
      className={[
        "rounded-[30px] border p-4 xl:p-5 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5",
        getCardClasses(theme, pedido),
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-black/10 px-3 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wide">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className={textSafe}>Pedido #{pedido.id}</span>
          </div>

          <div className={`mt-3 font-black uppercase tracking-wide text-xl sm:text-2xl ${textSafe}`}>
            {getStatusLabel(pedido.status)}
          </div>

          <div className={`mt-1 text-xs sm:text-sm font-semibold opacity-80 ${textSafe}`}>
            Criado em {formatDate(pedido.data)}
          </div>
        </div>

        <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl bg-black/10 px-3 py-2 sm:px-4 sm:py-3">
          <Clock3 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="text-lg sm:text-2xl font-black whitespace-nowrap">{tempo} min</span>
        </div>
      </div>

      <div className={`mt-5 grid grid-cols-1 gap-4 ${compactMode ? "min-[1700px]:grid-cols-1" : "min-[1700px]:grid-cols-2"}`}>
        <div className={`rounded-3xl p-4 ${classes.sectionPanel} min-w-0 overflow-hidden`}>
          <div className="grid-cols-1 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-black uppercase tracking-wide opacity-80">
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className={textSafe}>Itens do pedido</span>
            </div>

            <div className="shrink-0 text-base sm:text-lg font-black whitespace-nowrap">
              {formatMoney.format(Number(pedido.total || 0))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {itens.length === 0 ? (
              <div className="text-base sm:text-lg font-bold opacity-90">Sem itens</div>
            ) : (
              itens.map((item, index) => (
                <div
                  key={item.id || `${pedido.id}-${index}`}
                  className={`rounded-2xl p-3.5 min-w-0 overflow-hidden ${classes.itemPanel}`}
                >
                  <div
                    className={`text-base sm:text-lg xl:text-xl font-black leading-snug ${textSafe} ${
                      compactMode ? clamp2 : ""
                    }`}
                    title={`${item.quantidade ?? 1}x ${item.nomeProduto ?? item.nome ?? "Item"}`}
                  >
                    {item.quantidade ?? 1}x {item.nomeProduto ?? item.nome ?? "Item"}
                  </div>

                  {!compactMode ? (
                    <div className={`mt-1 text-sm font-semibold opacity-85 ${textSafe}`}>
                      Unitário: {formatMoney.format(Number(item.precoUnitario || 0))}
                    </div>
                  ) : null}

                  {renderOpcionais(item, theme, compactMode)}

                  {!compactMode && item?.observacao ? (
                    <div
                      className="mt-2 text-sm font-bold opacity-90 break-words whitespace-pre-wrap [overflow-wrap:anywhere]"
                      title={item.observacao}
                    >
                      Obs. item: {item.observacao}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 min-w-0">
            {!compactMode ? (
          <div className={`rounded-3xl p-4 ${classes.sectionPanel} min-w-0 overflow-hidden`}>
            <div className="text-sm font-black uppercase tracking-wide opacity-80">
              Cliente
            </div>
            <div
              className={`mt-2 text-lg sm:text-xl xl:text-2xl font-black leading-snug ${textSafe} ${
                compactMode ? clamp2 : ""
              }`}
              title={pedido.nomeCompleto || pedido.usuario?.username || "Cliente"}
            >
              {pedido.nomeCompleto || pedido.usuario?.username || "Cliente"}
            </div>

              <div className={`mt-4 flex items-start gap-2 text-sm sm:text-base font-semibold opacity-90 ${textSafe}`}>
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <span className={textSafe}>{formatPhone(pedido.telefone)}</span>
              </div>
          </div>
            ) : null}

          {!compactMode ? (
          <div className={`rounded-3xl p-4 ${classes.sectionPanel} min-w-0 overflow-hidden`}>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide opacity-80">
              <EntregaIcon className="h-4 w-4 shrink-0" />
              <span className={textSafe}>{entregaLabel}</span>
            </div>

            <div className="mt-3 flex items-start gap-2 text-sm sm:text-base font-semibold opacity-95">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className={`${textSafe} ${compactMode ? clamp3 : ""}`} title={localEntrega}>
                {localEntrega}
              </span>
            </div>

              <div className="mt-3 text-sm font-semibold opacity-90">
                Frete: {formatMoney.format(Number(pedido.valorFrete || 0))}
              </div>

              <div className="mt-1 text-sm font-semibold opacity-90">
                Prazo: {pedido.prazoFrete}
              </div>
          </div>
          ) : null}

          {!compactMode && observacaoGeral ? (
            <div className={`rounded-3xl p-4 ${classes.sectionPanel} min-w-0 overflow-hidden`}>
              <div className="text-sm font-black uppercase tracking-wide opacity-80">
                Observação geral
              </div>
              <div
                className="mt-2 text-sm sm:text-base xl:text-lg font-bold leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]"
                title={observacaoGeral}
              >
                {observacaoGeral}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ColunaTV({
  title,
  icon: Icon,
  pedidos,
  tone = "orange",
  theme,
  classes,
  compactMode = false,
}) {
  const headerClass = getHeaderTone(theme, tone);

  return (
    <section
      className={[
        "flex min-h-0 flex-col rounded-[32px] p-4 xl:p-5 overflow-hidden",
        classes.columnShell,
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className={`min-w-0 flex items-start gap-3 ${headerClass}`}>
          <div
            className={[
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
              theme === "dark" ? "bg-white/5" : "bg-white/80 border border-zinc-200",
            ].join(" ")}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2 className={`text-2xl xl:text-3xl font-black uppercase tracking-wide ${textSafe}`}>
              {title}
            </h2>
            <p className={`mt-1 text-sm font-medium ${classes.mutedText} ${textSafe}`}>
              {tone === "green"
                ? compactMode
                  ? "Pedidos prontos"
                  : "Pedidos prontos para saída ou retirada"
                : compactMode
                ? "Recebidos e em preparo"
                : "Pedidos recebidos e em preparo"}
            </p>
          </div>
        </div>

        <div
          className={[
            "shrink-0 rounded-2xl px-4 py-2 text-xl xl:text-2xl font-black whitespace-nowrap",
            classes.columnCounter,
          ].join(" ")}
        >
          {pedidos.length}
        </div>
      </div>

      <div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 overflow-y-auto pr-1 2xl:grid-cols-2">
        {pedidos.length === 0 ? (
          <div
            className={[
              "grid min-h-[240px] place-items-center rounded-[28px] text-xl xl:text-2xl font-bold text-center px-4",
              classes.emptyBox,
            ].join(" ")}
          >
            Nenhum pedido
          </div>
        ) : (
          pedidos.map((pedido) => (
            <PedidoTVCard
              key={pedido.id}
              pedido={pedido}
              theme={theme}
              classes={classes}
              compactMode={compactMode}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function DashboardTV() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingManual, setUpdatingManual] = useState(false);
  const [erro, setErro] = useState("");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("dashboard-tv-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const [compactMode, setCompactMode] = useState(() => {
    try {
      return localStorage.getItem("dashboard-tv-compact-mode") === "true";
    } catch {
      return false;
    }
  });

  const API_URL_RAW = import.meta.env.VITE_API_URL || "";
  const API_URL = API_URL_RAW.replace(/\/$/, "");

  const { ultimoPedido, conectado } = useRestaurantNotifications();
  const ultimoEventoProcessadoRef = useRef(null);

  const classes = useMemo(() => getThemeClasses(theme), [theme]);

  const alternarTema = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const alternarModoInfo = useCallback(() => {
    setCompactMode((prev) => !prev);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dashboard-tv-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem("dashboard-tv-compact-mode", String(compactMode));
    } catch {}
  }, [compactMode]);

  const carregarPedidos = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        setErro("");

        const token = localStorage.getItem("token");
        const empresaId =
          localStorage.getItem("empresaId") ||
          localStorage.getItem("empresa_id") ||
          localStorage.getItem("restauranteId");

        if (!token) {
          throw new Error("Token não encontrado no localStorage.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        let res;

        if (empresaId) {
          res = await fetch(`${API_URL}/pedidos/empresa/${empresaId}`, {
            headers,
          });
        } else {
          res = await fetch(`${API_URL}/pedidos?page=0&size=100`, {
            headers,
          });
        }

        if (!res.ok) {
          throw new Error(`Erro ao carregar pedidos (${res.status})`);
        }

        const data = await res.json();

        let lista = [];

        if (Array.isArray(data)) {
          lista = data;
        } else if (Array.isArray(data?.content)) {
          lista = data.content;
        }

        setPedidos(lista);
      } catch (error) {
        console.error("Erro ao buscar pedidos da TV:", error);
        setErro(error?.message || "Erro ao carregar pedidos.");
        if (!silent) {
          setPedidos([]);
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [API_URL]
  );

  const handleAtualizarManual = useCallback(async () => {
    try {
      setUpdatingManual(true);
      await carregarPedidos({ silent: false });
    } finally {
      setUpdatingManual(false);
    }
  }, [carregarPedidos]);

  useEffect(() => {
    carregarPedidos();
  }, [carregarPedidos]);

  useEffect(() => {
    const pedidoId = ultimoPedido?.pedidoId || ultimoPedido?.id;
    if (!pedidoId) return;

    const notificationId =
      ultimoPedido?.notificationId ||
      `${pedidoId}-${ultimoPedido?.criadaEm || ultimoPedido?.recebidaEm || ""}`;

    if (ultimoEventoProcessadoRef.current === notificationId) return;
    ultimoEventoProcessadoRef.current = notificationId;

    carregarPedidos({ silent: true });
  }, [ultimoPedido, carregarPedidos]);

  const pedidosEmProducao = useMemo(() => {
    return sortPedidosByTempo(
      pedidos.filter((pedido) =>
        ["RECEBIDO", "EM_PREPARO"].includes(String(pedido.status || "").toUpperCase())
      )
    );
  }, [pedidos]);

  const pedidosProntos = useMemo(() => {
    return sortPedidosByTempo(
      pedidos.filter(
        (pedido) => String(pedido.status || "").toUpperCase() === "PRONTO"
      )
    );
  }, [pedidos]);

  if (loading) {
    return (
      <div className={`grid min-h-screen place-items-center ${classes.page}`}>
        <div className="text-3xl font-black">Carregando painel da cozinha...</div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen overflow-hidden ${classes.page}`}>
      <div className={`pointer-events-none absolute inset-0 ${classes.pageOverlay}`} />

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        <div
          className={[
            "mb-6 rounded-[34px] border p-5 md:p-6 xl:p-7",
            classes.heroCard,
          ].join(" ")}
        >
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg">
                <Sparkles className="h-3.5 w-3.5" />
                TV Mode
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl xl:text-6xl">
                Painel da Cozinha
              </h1>

              <p className={`mt-3 max-w-3xl text-base md:text-lg ${classes.heroSubtext}`}>
                Visual mais limpo, leitura rápida e atualização em tempo real para pedidos
                recebidos, em preparo e prontos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black",
                  conectado ? classes.chipConnected : classes.chipDisconnected,
                ].join(" ")}
              >
                {conectado ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                {conectado ? "Tempo real ativo" : "Reconectando..."}
              </span>

              <InfoToggle
                compactMode={compactMode}
                onToggle={alternarModoInfo}
                classes={classes}
              />

              <ThemeToggle
                theme={theme}
                onToggle={alternarTema}
                classes={classes}
              />

              <button
                type="button"
                onClick={handleAtualizarManual}
                disabled={updatingManual}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm md:text-base font-black transition disabled:cursor-not-allowed disabled:opacity-60",
                  classes.buttonPrimary,
                ].join(" ")}
              >
                <RefreshCw
                  className={`h-5 w-5 ${updatingManual ? "animate-spin" : ""}`}
                />
                {updatingManual ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>

        {erro ? (
          <div className={`mb-6 rounded-[30px] p-4 md:p-5 ${classes.errorBox}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="text-lg font-black">
                  Não foi possível carregar os pedidos
                </div>
                <div className="mt-1 text-sm opacity-90">{erro}</div>
                <div className="mt-2 text-sm opacity-75">
                  Confira se o token e o empresaId estão salvos no localStorage.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <ColunaTV
            title="Em produção"
            icon={ChefHat}
            pedidos={pedidosEmProducao}
            tone="orange"
            theme={theme}
            classes={classes}
            compactMode={compactMode}
          />

          <ColunaTV
            title="Prontos"
            icon={CheckCircle2}
            pedidos={pedidosProntos}
            tone="green"
            theme={theme}
            classes={classes}
            compactMode={compactMode}
          />
        </div>
      </div>
    </div>
  );
}