import { useMemo, useState } from "react";
import {
  ReceiptText,
  Truck,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  TicketPercent,
} from "lucide-react";

const toNumber = (v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export default function ResumoValoresCarrinho({
  itens = [],
  taxaEntrega = 0,
  prazoEntrega = null,
  subtotalProdutos,
  descontoCupom = 0,
  cupom = null,
  total,
}) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  const subtotalCalculado = useMemo(() => {
    return itens.reduce((acc, item) => {
      return acc + toNumber(item?.subtotal);
    }, 0);
  }, [itens]);

  const frete = useMemo(() => toNumber(taxaEntrega), [taxaEntrega]);

  const subtotalFinal = useMemo(() => {
    const valorRecebido = toNumber(subtotalProdutos);
    return valorRecebido > 0 ? valorRecebido : subtotalCalculado;
  }, [subtotalProdutos, subtotalCalculado]);

  const descontoFinal = useMemo(() => {
    return Math.max(0, toNumber(descontoCupom));
  }, [descontoCupom]);

  const totalFinal = useMemo(() => {
    const valorRecebido = toNumber(total);
    if (valorRecebido > 0) return valorRecebido;

    const totalSemClamp = subtotalFinal - descontoFinal + frete;
    return Math.max(0, totalSemClamp);
  }, [total, subtotalFinal, descontoFinal, frete]);

  return (
    <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-zinc-900 sm:text-lg">
          Resumo do Pedido
        </h3>

        <button
          onClick={() => setMostrarDetalhes((prev) => !prev)}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-600 transition hover:text-zinc-900"
        >
          {mostrarDetalhes ? "Ocultar detalhes" : "Ver detalhes"}
          {mostrarDetalhes ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {mostrarDetalhes && (
        <div className="mt-4 space-y-2 text-xs text-zinc-600">
          {itens.map((item) => {
            const precoUnit = toNumber(item?.precoUnitario);
            const qtd = Math.max(0, parseInt(item?.quantidade, 10) || 0);
            const subtotalItem = toNumber(item?.subtotal);

            return (
              <div
                key={item.id ?? `${item.produtoId}-${item.variacaoId ?? "sem-variacao"}`}
                className="flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold text-zinc-800">
                    {item.variacaoNome
                      ? `${item.nomeProduto} • ${item.variacaoNome}`
                      : item.nomeProduto}
                  </p>

                  <p className="text-[11px] text-zinc-500">
                    {qtd} × {brl.format(precoUnit)}
                  </p>

                  {subtotalItem > precoUnit * qtd && (
                    <p className="text-[11px] text-zinc-500">
                      Inclui adicionais
                    </p>
                  )}
                </div>

                <span className="font-semibold text-zinc-800">
                  {brl.format(subtotalItem)}
                </span>
              </div>
            );
          })}

          <div className="my-3 h-px bg-zinc-100" />
        </div>
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-700">
            <ReceiptText className="h-4 w-4" />
            <span className="text-sm font-semibold">Produtos</span>
          </div>
          <span className="text-sm font-bold text-zinc-900">
            {brl.format(subtotalFinal)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-700">
            <Truck className="h-4 w-4" />
            <div>
              <span className="text-sm font-semibold block">Entrega</span>
              {prazoEntrega ? (
                <span className="text-xs text-zinc-500 block">{prazoEntrega}</span>
              ) : null}
            </div>
          </div>
          <span className="text-sm font-bold text-zinc-900">
            {frete > 0 ? brl.format(frete) : "Grátis"}
          </span>
        </div>

        {descontoFinal > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700">
              <TicketPercent className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Desconto {cupom?.codigo ? `(${cupom.codigo})` : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-emerald-700">
              -{brl.format(descontoFinal)}
            </span>
          </div>
        )}

        <div className="h-px bg-zinc-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900">
            <BadgeCheck className="h-5 w-5" />
            <span className="text-base font-extrabold">Total</span>
          </div>
          <span className="text-lg font-extrabold text-zinc-900">
            {brl.format(totalFinal)}
          </span>
        </div>
      </div>
    </div>
  );
}