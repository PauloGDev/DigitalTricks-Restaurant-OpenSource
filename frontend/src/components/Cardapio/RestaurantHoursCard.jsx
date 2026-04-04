import { ChevronDown, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";

export default function RestaurantHoursCard({
  abertoAgora,
  horarios = [],
}) {
  const [showHours, setShowHours] = useState(false);

  const status = useMemo(() => {
    if (abertoAgora) {
      return {
        title: "Aberto agora",
        subtitle: "Confira os horários de funcionamento",
        dotClass: "bg-emerald-500",
        iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
        badgeClass: "border-emerald-100 bg-emerald-50 text-emerald-700",
      };
    }

    return {
      title: "Fechado",
      subtitle: "Veja quando o restaurante abre",
      dotClass: "bg-zinc-400",
      iconWrap: "bg-zinc-100 text-zinc-500 ring-zinc-200",
      badgeClass: "border-zinc-200 bg-zinc-100 text-zinc-700",
    };
  }, [abertoAgora]);

  return (
    <article className="rounded-[1.5rem] border border-zinc-200/80 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
      <button
        type="button"
        onClick={() => setShowHours((prev) => !prev)}
        aria-expanded={showHours}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${status.iconWrap}`}
            >
              <Clock3 className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Funcionamento
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badgeClass}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                  {status.title}
                </span>
              </div>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                {status.subtitle}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white p-2 text-zinc-500 transition duration-300 ${
              showHours ? "rotate-180" : ""
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          showHours
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            {horarios?.length > 0 ? (
              horarios.map((item) => (
                <div
                  key={item.dia}
                  className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3.5 py-3 text-xs sm:text-sm"
                >
                  <span className="font-semibold text-zinc-700">
                    {item.dia}
                  </span>
                  <span className="font-bold text-zinc-950">
                    {item.abre} às {item.fecha}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-zinc-50 px-3.5 py-3 text-sm text-zinc-500">
                Horários não informados.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}