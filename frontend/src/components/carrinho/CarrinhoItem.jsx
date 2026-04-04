import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

const toNumber = (v) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const safeArray = (v) => (Array.isArray(v) ? v : []);

const sumExtras = (opcionais) => {
  let total = 0;

  safeArray(opcionais).forEach((g) => {
    safeArray(g?.itens).forEach((it) => {
      const preco = toNumber(it?.precoExtra);
      const quantidade = Math.max(1, parseInt(it?.quantidade, 10) || 1);
      total += preco * quantidade;
    });
  });

  return total;
};

const renderOpcionaisDetalhados = (opcionais) => {
  const grupos = safeArray(opcionais);
  if (grupos.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-zinc-600">Escolhas</p>

      {grupos.map((g) => {
        const itens = safeArray(g?.itens);
        if (itens.length === 0) return null;

        return (
          <div
            key={g.grupoId ?? g.id ?? g.nome}
            className="rounded-2xl border border-zinc-100 bg-zinc-50/70 px-3 py-2"
          >
            <p className="text-[11px] font-semibold text-zinc-700">
              {g?.grupoNome || g?.nome || "Grupo"}
            </p>

            <div className="mt-1 flex flex-wrap gap-2">
              {itens.map((it) => {
                const extra = toNumber(it?.precoExtra);
                const qtd = Math.max(1, parseInt(it?.quantidade, 10) || 1);
                const isAdicionalQuantidade =
                  String(g?.tipoGrupo || "").toUpperCase() === "ADICIONAL_QUANTIDADE";

                return (
                  <span
                    key={`${g.grupoId ?? "g"}-${it.itemId ?? it.id ?? it.nome}`}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] text-zinc-700"
                  >
                    <span className="font-medium">
                      {isAdicionalQuantidade && qtd > 1 ? `${qtd}x ` : ""}
                      {it?.nome || "Item"}
                    </span>

                    {extra > 0 ? (
                      <span className="text-zinc-500">
                        (+{brl.format(isAdicionalQuantidade ? extra * qtd : extra)})
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CarrinhoItem = ({ item, i, fadeUp, incrementar, decrementar, remover }) => {
  const precoUnit = toNumber(item.precoUnitario);
  const qtd = Math.max(1, parseInt(item.quantidade, 10) || 1);

  useEffect(() => {
    console.log("Carrinho atualizado:", item);
  }, [item]);

  const titulo = item.variacaoNome
    ? `${item.nomeProduto} • ${item.variacaoNome}`
    : item.nomeProduto;

  const descricao =
    (item.produtoDescricao || item.descricao || "").trim() || null;

  const opcionaisDetalhados =
    safeArray(item.opcionaisDetalhados).length > 0
      ? safeArray(item.opcionaisDetalhados)
      : safeArray(item.opcionais);

  const extras = sumExtras(opcionaisDetalhados);
  const subtotal = (precoUnit) * qtd;
  const temOpcionaisDetalhados = opcionaisDetalhados.length > 0;

  const opcionaisResumo =
    Array.isArray(item.opcionaisResumo) && item.opcionaisResumo.length > 0
      ? item.opcionaisResumo.join(", ")
      : null;

  return (
    <motion.div
      key={item.id}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: i * 0.06 }}
      className="w-full rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
          <img
            src={item.imagemUrl || "/placeholder.png"}
            alt={titulo}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold text-zinc-900 leading-tight line-clamp-2">
                {titulo}
              </p>

              {descricao && (
                <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                  {descricao}
                </p>
              )}

              {temOpcionaisDetalhados
                ? renderOpcionaisDetalhados(opcionaisDetalhados)
                : opcionaisResumo && (
                    <p className="mt-2 text-xs text-zinc-600 line-clamp-2">
                      <span className="font-semibold text-zinc-700">Adicionais:</span>{" "}
                      {opcionaisResumo}
                    </p>
                  )}

              {item.observacao && (
                <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                  <span className="font-semibold text-zinc-600">Obs:</span>{" "}
                  {item.observacao}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs text-zinc-500">
                  {qtd}× {brl.format(precoUnit - extras)}
                </span>

                {extras > 0 ? (
                  <span className="text-[11px] font-semibold text-zinc-600">
                    + {brl.format(extras)} extras
                  </span>
                ) : null}
              </div>
            </div>

            <button
              onClick={() => remover(item.id)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition"
              aria-label={`Remover ${titulo}`}
              title="Remover"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-2xl border border-zinc-200 bg-white overflow-hidden">
              <button
                onClick={() => decrementar(item.id)}
                className="h-11 w-12 grid place-items-center hover:bg-zinc-50 transition"
                aria-label="Diminuir quantidade"
                title="Diminuir"
              >
                <Minus className="h-5 w-5 text-zinc-800" />
              </button>

              <div className="h-11 px-4 grid place-items-center border-x border-zinc-200">
                <span className="min-w-[24px] text-center font-extrabold text-zinc-900">
                  {qtd}
                </span>
              </div>

              <button
                onClick={() => incrementar(item.id)}
                className="h-11 w-12 grid place-items-center hover:bg-zinc-50 transition"
                aria-label="Aumentar quantidade"
                title="Aumentar"
              >
                <Plus className="h-5 w-5 text-zinc-800" />
              </button>
            </div>

            <span className="text-xs font-semibold px-3 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700">
              {brl.format(subtotal )}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarrinhoItem;