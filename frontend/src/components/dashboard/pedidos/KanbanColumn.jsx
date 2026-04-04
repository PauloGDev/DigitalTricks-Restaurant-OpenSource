import { useEffect, useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Clock3, Flame, Sparkles } from "lucide-react";
import KanbanPedidoCard from "./KanbanPedidoCard";

function getTempoEmMinutos(data) {
  if (!data) return 0;
  const agora = new Date();
  const criadoEm = new Date(data);
  const diffMs = agora - criadoEm;
  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

function formatTempoTopo(pedidos = []) {
  if (!pedidos.length) return "0 min";
  const maxMin = Math.max(...pedidos.map((p) => getTempoEmMinutos(p.data)));
  const horas = Math.floor(maxMin / 60);
  if (horas > 0) return `${horas}h ${maxMin % 60}min`;
  return `${maxMin} min`;
}

function getThemeState() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
}

export default function KanbanColumn({
  column,
  pedidos,
  onEdit,
  onQuickStatusChange,
  newPedidoIds = [],
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
    },
  });

  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const tempoTopo = useMemo(() => formatTempoTopo(pedidos), [pedidos]);

  const temUrgente = useMemo(
    () => pedidos.some((pedido) => getTempoEmMinutos(pedido.data) >= 35),
    [pedidos]
  );

  const temMuitoAtrasado = useMemo(
    () => pedidos.some((pedido) => getTempoEmMinutos(pedido.data) >= 50),
    [pedidos]
  );

  const badgeClassName = column.badgeClassName
    ? column.badgeClassName
    : isDark
    ? "bg-white/10 text-white border border-white/10"
    : "bg-zinc-100 text-zinc-700 border border-zinc-200";

  const columnShellClass = [
    "rounded-[30px] border overflow-hidden transition-all duration-300",
    isDark
      ? "border-white/10 bg-[#121212] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      : "border-zinc-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]",
    isOver
      ? isDark
        ? "ring-2 ring-red-500/20"
        : "ring-2 ring-red-200"
      : "",
  ].join(" ");

  const headerOverlayClass = [
    "pointer-events-none absolute inset-0",
    isDark
      ? temMuitoAtrasado
        ? "bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_32%)]"
        : temUrgente
        ? "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_32%)]"
        : "bg-[radial-gradient(circle_at_top_right,rgba(229,37,42,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_32%)]"
      : temMuitoAtrasado
      ? "bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.05),transparent_32%)]"
      : temUrgente
      ? "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.05),transparent_32%)]"
      : "bg-[radial-gradient(circle_at_top_right,rgba(229,37,42,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.04),transparent_32%)]",
  ].join(" ");

  const statCardBase = isDark
    ? "border-white/10 bg-white/[0.04]"
    : "border-zinc-200 bg-zinc-50";

  const dropAreaClass = [
    "min-h-[500px] p-3 space-y-3 transition-all duration-300",
    isOver
      ? isDark
        ? "bg-red-500/8"
        : "bg-red-50/60"
      : isDark
      ? "bg-white/[0.02]"
      : "bg-zinc-50/60",
  ].join(" ");

  const emptyStateClass = [
    "grid h-28 place-items-center rounded-3xl border border-dashed text-sm font-medium transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.03] text-white/40"
      : "border-zinc-300 bg-white text-zinc-400",
    isOver
      ? isDark
        ? "border-red-500/25 bg-red-500/8 text-red-300"
        : "border-red-300 bg-red-50 text-red-500"
      : "",
  ].join(" ");

  return (
    <div className="w-[340px] min-w-[340px] shrink-0">
      <div className={columnShellClass}>
        <div className="relative">
          <div className={headerOverlayClass} />

          <div
            className={[
              "relative border-b px-4 py-4",
              isDark ? "border-white/10" : "border-zinc-100",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={[
                      "truncate text-sm font-extrabold",
                      isDark ? "text-white" : "text-zinc-900",
                    ].join(" ")}
                  >
                    {column.title}
                  </h3>

                  {temMuitoAtrasado ? (
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold",
                        isDark
                          ? "bg-red-500/15 text-red-300"
                          : "bg-red-100 text-red-700",
                      ].join(" ")}
                    >
                      <Sparkles className="h-3 w-3" />
                      Crítico
                    </span>
                  ) : temUrgente ? (
                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold",
                        isDark
                          ? "bg-amber-500/15 text-amber-300"
                          : "bg-amber-100 text-amber-700",
                      ].join(" ")}
                    >
                      <Sparkles className="h-3 w-3" />
                      Atenção
                    </span>
                  ) : null}
                </div>

                <p
                  className={[
                    "mt-1 text-xs",
                    isDark ? "text-white/45" : "text-zinc-500",
                  ].join(" ")}
                >
                  {column.subtitle}
                </p>
              </div>

              <span
                className={[
                  "inline-flex min-w-[34px] items-center justify-center rounded-full px-2.5 py-1 text-xs font-extrabold shadow-sm",
                  badgeClassName,
                ].join(" ")}
              >
                {pedidos.length}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div
                className={[
                  "rounded-2xl border px-3 py-3 shadow-sm",
                  statCardBase,
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center gap-2",
                    isDark ? "text-white/45" : "text-zinc-500",
                  ].join(" ")}
                >
                  <Clock3
                    className={[
                      "h-4 w-4",
                      temMuitoAtrasado
                        ? isDark
                          ? "text-red-300"
                          : "text-red-600"
                        : temUrgente
                        ? isDark
                          ? "text-amber-300"
                          : "text-amber-600"
                        : isDark
                        ? "text-[#ff6b6f]"
                        : "text-red-600",
                    ].join(" ")}
                  />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">
                    Mais antigo
                  </span>
                </div>

                <div
                  className={[
                    "mt-1 text-2xl font-black",
                    isDark ? "text-white" : "text-zinc-900",
                  ].join(" ")}
                >
                  {tempoTopo}
                </div>
              </div>

              <div
                className={[
                  "rounded-2xl border px-3 py-3 shadow-sm",
                  temMuitoAtrasado
                    ? isDark
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-red-200 bg-red-50"
                    : temUrgente
                    ? isDark
                      ? "border-amber-500/20 bg-amber-500/10"
                      : "border-amber-200 bg-amber-50"
                    : statCardBase,
                ].join(" ")}
              >
                <div
                  className={[
                    "flex items-center gap-2",
                    isDark ? "text-white/45" : "text-zinc-500",
                  ].join(" ")}
                >
                  <Flame
                    className={[
                      "h-4 w-4",
                      temMuitoAtrasado
                        ? isDark
                          ? "text-red-300"
                          : "text-red-600"
                        : temUrgente
                        ? isDark
                          ? "text-amber-300"
                          : "text-amber-600"
                        : isDark
                        ? "text-white/35"
                        : "text-zinc-400",
                    ].join(" ")}
                  />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em]">
                    Operação
                  </span>
                </div>

                <div
                  className={[
                    "mt-1 text-sm font-black leading-5",
                    temMuitoAtrasado
                      ? isDark
                        ? "text-red-200"
                        : "text-red-800"
                      : temUrgente
                      ? isDark
                        ? "text-amber-200"
                        : "text-amber-800"
                      : isDark
                      ? "text-white/80"
                      : "text-zinc-700",
                  ].join(" ")}
                >
                  {temMuitoAtrasado
                    ? "Pedido crítico na fila"
                    : temUrgente
                    ? "Tem pedido em atenção"
                    : "Fluxo sob controle"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={setNodeRef} className={dropAreaClass}>
          <SortableContext
            items={pedidos.map((pedido) => String(pedido.id))}
            strategy={verticalListSortingStrategy}
          >
            {pedidos.length === 0 ? (
              <div className={emptyStateClass}>Solte pedidos aqui</div>
            ) : (
              pedidos.map((pedido) => (
                <KanbanPedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onEdit={onEdit}
                  onQuickStatusChange={onQuickStatusChange}
                  isNew={newPedidoIds.includes(String(pedido.id))}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}