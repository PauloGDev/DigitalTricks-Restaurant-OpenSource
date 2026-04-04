import { ChevronRight, MapPin } from "lucide-react";

export default function DeliveryAddressCard({ endereco, onTrocarEndereco }) {
  const enderecoPrincipal = endereco
    ? `${endereco.logradouro || ""}${endereco.numero ? `, ${endereco.numero}` : ""}`
    : "";

  const enderecoSecundario = endereco
    ? [endereco.bairro, endereco.cidade].filter(Boolean).join(" · ")
    : "";

  return (
    <article className="rounded-[1.5rem] border border-zinc-200/80 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            Endereço de entrega
          </p>

          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <MapPin className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              {endereco ? (
                <>
                  <p className="line-clamp-1 text-sm font-black tracking-tight text-zinc-950 sm:text-base">
                    {enderecoPrincipal}
                  </p>

                  <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 sm:text-sm">
                    {enderecoSecundario}
                  </p>

                  {endereco.complemento ? (
                    <p className="mt-1 line-clamp-1 text-[11px] text-zinc-400 sm:text-xs">
                      {endereco.complemento}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-sm font-black tracking-tight text-zinc-950 sm:text-base">
                    Nenhum endereço selecionado
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
                    Adicione ou selecione um endereço para continuar
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onTrocarEndereco}
          className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 sm:text-sm"
        >
          {endereco ? "Trocar" : "Selecionar"}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}