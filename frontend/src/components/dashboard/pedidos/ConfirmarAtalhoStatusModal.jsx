import { AlertTriangle, ArrowRight, X } from "lucide-react";

export default function ConfirmarAtalhoStatusModal({
  open,
  isDark = true,
  title = "Ação não recomendada",
  description = "",
  primaryLabel = "Continuar mesmo assim",
  secondaryLabel = "Cancelar",
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={[
          "w-full max-w-lg rounded-[28px] border shadow-2xl",
          isDark
            ? "border-white/10 bg-[#111111] text-white"
            : "border-zinc-200 bg-white text-zinc-900",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-11 w-11 place-items-center rounded-2xl bg-amber-500 text-black shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black">{title}</h3>
              <p className={isDark ? "mt-1 text-sm text-white/60" : "mt-1 text-sm text-zinc-600"}>
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={[
              "rounded-xl p-2 transition",
              isDark ? "hover:bg-white/10" : "hover:bg-zinc-100",
            ].join(" ")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={[
              "rounded-2xl border px-5 py-3 text-sm font-extrabold transition",
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            {secondaryLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-black transition hover:brightness-95"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}