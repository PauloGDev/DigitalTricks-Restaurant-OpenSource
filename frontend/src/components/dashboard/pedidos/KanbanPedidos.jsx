import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  ShoppingBag,
  AlertTriangle,
  Siren,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";
import KanbanColumn from "./KanbanColumn";
import KanbanPedidoCard from "./KanbanPedidoCard";

function getThemeState() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
}

const COLUMNS = [
  {
    id: "RECEBIDO",
    title: "Recebido",
    subtitle: "Novos e aguardando pagamento",
    badgeClassNameLight: "border border-amber-200 bg-amber-100 text-amber-800",
    badgeClassNameDark: "border border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
  {
    id: "PREPARO",
    title: "Preparo",
    subtitle: "Em produção e prontos",
    badgeClassNameLight: "border border-orange-200 bg-orange-100 text-orange-800",
    badgeClassNameDark: "border border-orange-500/20 bg-orange-500/10 text-orange-300",
  },
  {
    id: "LOGISTICA",
    title: "Logística",
    subtitle: "Entrega ou retirada",
    badgeClassNameLight: "border border-blue-200 bg-blue-100 text-blue-800",
    badgeClassNameDark: "border border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
  {
    id: "FINALIZADOS",
    title: "Finalizados",
    subtitle: "Concluídos ou cancelados",
    badgeClassNameLight: "border border-zinc-200 bg-zinc-200 text-zinc-800",
    badgeClassNameDark: "border border-white/10 bg-white/10 text-white/75",
  },
];

const formatMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function isRetiradaPedido(pedido) {
  return String(pedido?.tipoEntrega || "").toUpperCase() === "RETIRADA";
}

function getColumnIdByStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();

  if (["AGUARDANDO_PAGAMENTO", "RECEBIDO"].includes(normalized)) {
    return "RECEBIDO";
  }

  if (["EM_PREPARO", "PRONTO"].includes(normalized)) {
    return "PREPARO";
  }

  if (["SAIU_PARA_ENTREGA", "AGUARDANDO_RETIRADA"].includes(normalized)) {
    return "LOGISTICA";
  }

  if (["ENTREGUE", "RETIRADO", "CANCELADO"].includes(normalized)) {
    return "FINALIZADOS";
  }

  return "RECEBIDO";
}

function getNextStatusForColumn(columnId, pedido) {
  const currentStatus = String(pedido?.status || "").trim().toUpperCase();
  const retirada = isRetiradaPedido(pedido);

  if (columnId === "RECEBIDO") {
    return currentStatus === "AGUARDANDO_PAGAMENTO"
      ? "AGUARDANDO_PAGAMENTO"
      : "RECEBIDO";
  }

  if (columnId === "PREPARO") {
    return currentStatus === "PRONTO" ? "PRONTO" : "EM_PREPARO";
  }

  if (columnId === "LOGISTICA") {
    if (retirada) {
      // 🔥 REGRA CORRETA:
      // PRONTO já é estado final antes de retirada
      // NÃO muda nada ao arrastar
      return currentStatus;
    }

    return "SAIU_PARA_ENTREGA";
  }

  if (columnId === "FINALIZADOS") {
    if (currentStatus === "CANCELADO") return "CANCELADO";
    return retirada ? "RETIRADO" : "ENTREGUE";
  }

  return currentStatus;
}

function getTempoEmMinutos(data) {
  if (!data) return 0;
  const agora = new Date();
  const criadoEm = new Date(data);
  const diffMs = agora - criadoEm;
  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

function sortPedidosByUrgencia(lista = []) {
  return [...lista].sort((a, b) => {
    const diffTempo = getTempoEmMinutos(b.data) - getTempoEmMinutos(a.data);
    if (diffTempo !== 0) return diffTempo;

    const da = new Date(a.data || 0).getTime();
    const db = new Date(b.data || 0).getTime();
    return da - db;
  });
}

function playNewOrderSound() {
  try {
    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextRef) return;

    const ctx = new AudioContextRef();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.36);

    oscillator.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch {
    // navegador pode bloquear autoplay
  }
}

function isPedidoAtivo(pedido) {
  return !["ENTREGUE", "RETIRADO", "CANCELADO"].includes(
    String(pedido?.status || "").toUpperCase()
  );
}

function isPedidoAtencao(pedido) {
  return isPedidoAtivo(pedido) && getTempoEmMinutos(pedido?.data) >= 35;
}

function isPedidoMuitoAtrasado(pedido) {
  return isPedidoAtivo(pedido) && getTempoEmMinutos(pedido?.data) >= 50;
}

function isToday(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function isPedidoConcluidoFinanceiramente(pedido) {
  return ["ENTREGUE", "RETIRADO"].includes(
    String(pedido?.status || "").toUpperCase()
  );
}

function DashboardMetricCard({
  icon: Icon,
  title,
  value,
  subtitle,
  tone = "default",
  isDark,
}) {
  const toneClass =
    tone === "danger"
      ? isDark
        ? "border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent"
        : "border-red-200 bg-red-50"
      : tone === "warning"
      ? isDark
        ? "border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent"
        : "border-amber-200 bg-amber-50"
      : tone === "success"
      ? isDark
        ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent"
        : "border-emerald-200 bg-emerald-50"
      : isDark
      ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03]"
      : "border-zinc-200 bg-white";

  const iconClass =
    tone === "danger"
      ? "bg-red-600 text-white"
      : tone === "warning"
      ? "bg-amber-500 text-black"
      : tone === "success"
      ? "bg-emerald-600 text-white"
      : isDark
      ? "bg-white/10 text-white"
      : "bg-zinc-900 text-white";

  return (
    <div
      className={[
        "rounded-[28px] border p-4 shadow-sm transition-all duration-300",
        isDark
          ? "shadow-[0_15px_40px_rgba(0,0,0,0.28)]"
          : "shadow-[0_12px_30px_rgba(15,23,42,0.05)]",
        toneClass,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={[
              "text-[11px] font-extrabold uppercase tracking-[0.14em]",
              isDark ? "text-white/40" : "text-zinc-500",
            ].join(" ")}
          >
            {title}
          </div>

          <div
            className={[
              "mt-1 text-2xl font-black",
              isDark ? "text-white" : "text-zinc-900",
            ].join(" ")}
          >
            {value}
          </div>

          <div
            className={[
              "mt-1 text-sm",
              isDark ? "text-white/55" : "text-zinc-600",
            ].join(" ")}
          >
            {subtitle}
          </div>
        </div>

        <div
          className={`grid h-11 w-11 place-items-center rounded-2xl shadow-sm ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function KanbanPedidos({
  pedidos = [],
  loading = false,
  setPedidoEdit,
  setForm,
  onMovePedido,
}) {
  const [localPedidos, setLocalPedidos] = useState(sortPedidosByUrgencia(pedidos));
  const [activePedido, setActivePedido] = useState(null);
  const [newPedidoIds, setNewPedidoIds] = useState([]);
  const [mostrarFinalizados, setMostrarFinalizados] = useState(false);
  const [theme, setTheme] = useState(getThemeState());

  const initialSnapshotDoneRef = useRef(false);
  const knownIdsRef = useRef(new Set());

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  useEffect(() => {
    const sorted = sortPedidosByUrgencia(pedidos);
    setLocalPedidos(sorted);

    if (loading) return;

    const currentIds = new Set(sorted.map((pedido) => String(pedido.id)));

    if (!initialSnapshotDoneRef.current) {
      knownIdsRef.current = currentIds;
      initialSnapshotDoneRef.current = true;
      return;
    }

    const novosIds = sorted
      .map((pedido) => String(pedido.id))
      .filter((id) => !knownIdsRef.current.has(id));

    if (novosIds.length > 0) {
      setNewPedidoIds((prev) => Array.from(new Set([...prev, ...novosIds])));

      playNewOrderSound();

      const timer = setTimeout(() => {
        setNewPedidoIds((prev) => prev.filter((id) => !novosIds.includes(id)));
      }, 8000);

      knownIdsRef.current = currentIds;
      return () => clearTimeout(timer);
    }

    knownIdsRef.current = currentIds;
  }, [pedidos, loading]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const grouped = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      let filtered = localPedidos.filter(
        (pedido) => getColumnIdByStatus(pedido.status) === column.id
      );

      if (column.id === "FINALIZADOS") {
        filtered = filtered.filter((pedido) => isToday(pedido.data));
      }

      acc[column.id] = sortPedidosByUrgencia(filtered);
      return acc;
    }, {});
  }, [localPedidos]);

  const metrics = useMemo(() => {
    const ativos = localPedidos.filter(isPedidoAtivo);
    const emAtencao = ativos.filter(isPedidoAtencao);
    const muitoAtrasados = ativos.filter(isPedidoMuitoAtrasado);

    const faturamentoDia = localPedidos
      .filter((pedido) => isToday(pedido.data))
      .filter(isPedidoConcluidoFinanceiramente)
      .reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);

    return {
      ativos: ativos.length,
      emAtencao: emAtencao.length,
      muitoAtrasados: muitoAtrasados.length,
      faturamentoDia,
    };
  }, [localPedidos]);

  const handleEdit = (pedido) => {
    setPedidoEdit?.(pedido);
    setForm?.(pedido);
  };

  const handleQuickStatusChange = async (pedido, nextStatus) => {
    const previousPedidos = localPedidos;

    setLocalPedidos((prev) =>
      sortPedidosByUrgencia(
        prev.map((item) =>
          item.id === pedido.id ? { ...item, status: nextStatus } : item
        )
      )
    );

    try {
      await onMovePedido?.(pedido, nextStatus);
    } catch (error) {
      setLocalPedidos(previousPedidos);
      console.error("Erro ao atualizar status rápido:", error);
    }
  };

  const handleDragStart = (event) => {
    const pedido = event.active?.data?.current?.pedido;
    setActivePedido(pedido || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActivePedido(null);

    if (!over) return;

    const pedidoAtivo = active?.data?.current?.pedido;
    if (!pedidoAtivo) return;

    const overColumnId =
      over?.data?.current?.columnId ||
      getColumnIdByStatus(over?.data?.current?.pedido?.status);

    if (!overColumnId) return;

    const nextStatus = getNextStatusForColumn(overColumnId, pedidoAtivo);

    if (!nextStatus || nextStatus === pedidoAtivo.status) return;

    const previousPedidos = localPedidos;

    setLocalPedidos((prev) =>
      sortPedidosByUrgencia(
        prev.map((pedido) =>
          pedido.id === pedidoAtivo.id ? { ...pedido, status: nextStatus } : pedido
        )
      )
    );

    try {
      await onMovePedido?.(pedidoAtivo, nextStatus);
    } catch (error) {
      setLocalPedidos(previousPedidos);
      console.error("Erro ao mover pedido no kanban:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={[
                "h-28 animate-pulse rounded-[28px] border",
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-zinc-200 bg-white",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className={[
                  "w-[340px] rounded-[28px] border p-4 shadow-sm",
                  isDark
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-zinc-200 bg-white",
                ].join(" ")}
              >
                <div
                  className={[
                    "h-5 w-32 animate-pulse rounded",
                    isDark ? "bg-white/10" : "bg-zinc-200",
                  ].join(" ")}
                />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={[
                        "h-36 animate-pulse rounded-3xl",
                        isDark ? "bg-white/[0.04]" : "bg-zinc-100",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div
          className={[
            "rounded-[28px] border px-4 py-4 shadow-sm",
            isDark
              ? "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.03] shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
              : "border-zinc-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
          ].join(" ")}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                className={[
                  "text-base font-extrabold sm:text-lg",
                  isDark ? "text-white" : "text-zinc-900",
                ].join(" ")}
              >
                Operação em tempo real
              </h2>
              <p
                className={[
                  "mt-1 text-sm",
                  isDark ? "text-white/50" : "text-zinc-500",
                ].join(" ")}
              >
                Acompanhe pedidos ativos, prioridades e faturamento do dia em um
                fluxo visual mais claro.
              </p>
            </div>

            <button
              onClick={() => setMostrarFinalizados((prev) => !prev)}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-300 hover:-translate-y-[1px] active:scale-[0.98]",
                mostrarFinalizados
                  ? isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700"
                  : isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
              ].join(" ")}
            >
              {mostrarFinalizados ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Ocultar finalizados
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Ver finalizados
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            icon={ShoppingBag}
            title="Pedidos ativos"
            value={metrics.ativos}
            subtitle="Em andamento no painel"
            isDark={isDark}
          />

          <DashboardMetricCard
            icon={AlertTriangle}
            title="Pedidos em atenção"
            value={metrics.emAtencao}
            subtitle="Com 35 minutos ou mais"
            tone="warning"
            isDark={isDark}
          />

          <DashboardMetricCard
            icon={Siren}
            title="Muito atrasados"
            value={metrics.muitoAtrasados}
            subtitle="Com 50 minutos ou mais"
            tone="danger"
            isDark={isDark}
          />

          <DashboardMetricCard
            icon={DollarSign}
            title="Faturamento do dia"
            value={formatMoney.format(metrics.faturamentoDia)}
            subtitle="Somando pedidos concluídos de hoje"
            tone="success"
            isDark={isDark}
          />
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4">
            {COLUMNS.filter((col) => mostrarFinalizados || col.id !== "FINALIZADOS").map(
              (column) => (
                <KanbanColumn
                  key={column.id}
                  column={{
                    ...column,
                    badgeClassName: isDark
                      ? column.badgeClassNameDark
                      : column.badgeClassNameLight,
                  }}
                  pedidos={grouped[column.id] || []}
                  onEdit={handleEdit}
                  onQuickStatusChange={handleQuickStatusChange}
                  newPedidoIds={newPedidoIds}
                />
              )
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activePedido ? (
          <div className="w-[340px] rotate-1">
            <KanbanPedidoCard
              pedido={activePedido}
              onEdit={handleEdit}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}