import { useEffect, useMemo, useState } from "react";
import { X, ShoppingCart, Check, Minus, Plus, Percent } from "lucide-react";

const formatBRL = (v) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function ProdutoModal({ produto, onClose, onAdicionar }) {
  const [variacaoSelecionada, setVariacaoSelecionada] = useState(null);
  const [quantidade, setQuantidade] = useState(1);

  const [selecionadosPorGrupo, setSelecionadosPorGrupo] = useState({});
  const [quantidadesAdicionais, setQuantidadesAdicionais] = useState({});
  const [observacao, setObservacao] = useState("");

  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  const hasVars = variacoes.length > 0;
  const ofertaVigente = !!produto?.ofertaVigente;

  const gruposOpcionais = useMemo(() => {
    const grupos = Array.isArray(produto?.gruposOpcionais)
      ? produto.gruposOpcionais
      : [];

    return grupos
      .filter((g) => g?.ativo !== false)
      .slice()
      .sort((a, b) => safeNumber(a?.ordem) - safeNumber(b?.ordem));
  }, [produto]);

  const permiteObservacao = Boolean(produto?.permiteObservacao);
  const maxObs = Math.max(0, safeNumber(produto?.maxObservacaoChars, 0));

  const estoqueAtivo = useMemo(() => {
    if (hasVars) return safeNumber(variacaoSelecionada?.estoque, 0);
    return safeNumber(produto?.estoque, 0);
  }, [hasVars, variacaoSelecionada, produto]);

  const emEstoque = estoqueAtivo > 0;

  const precoBaseAtivo = useMemo(() => {
    if (hasVars) {
      const p = safeNumber(variacaoSelecionada?.preco, NaN);
      return Number.isFinite(p) ? p : null;
    }

    const p = safeNumber(
      produto?.precoBase ?? produto?.precoMinimo,
      NaN
    );
    return Number.isFinite(p) ? p : null;
  }, [hasVars, variacaoSelecionada, produto]);

  const precoFinalAtivo = useMemo(() => {
    if (hasVars) {
      const p = safeNumber(
        variacaoSelecionada?.precoPromocional ?? variacaoSelecionada?.preco,
        NaN
      );
      return Number.isFinite(p) ? p : null;
    }

    const p = safeNumber(
      ofertaVigente
        ? produto?.precoPromocional
        : produto?.precoMinimo ?? produto?.precoBase,
      NaN
    );
    return Number.isFinite(p) ? p : null;
  }, [hasVars, variacaoSelecionada, produto, ofertaVigente]);

  const temDescontoAtivo = useMemo(() => {
    if (!ofertaVigente) return false;
    if (precoBaseAtivo == null || precoFinalAtivo == null) return false;
    return Number(precoFinalAtivo) < Number(precoBaseAtivo);
  }, [ofertaVigente, precoBaseAtivo, precoFinalAtivo]);

  const itensDoGrupo = (g) =>
    (Array.isArray(g?.itens) ? g.itens : [])
      .filter((i) => i?.ativo !== false)
      .slice()
      .sort((a, b) => safeNumber(a?.ordem) - safeNumber(b?.ordem));

  const getTipoGrupo = (g) =>
    String(g?.tipoGrupo || "OPCIONAL_SELECAO").toUpperCase();

  const getSelecionados = (grupoId) => {
    const arr = selecionadosPorGrupo?.[grupoId];
    return Array.isArray(arr) ? arr : [];
  };

  const getQtdAdicional = (grupoId, itemId) => {
    return safeNumber(quantidadesAdicionais?.[grupoId]?.[itemId], 0);
  };

  const isItemDisponivel = (item) => {
    const est = item?.estoque;
    if (est === null || est === undefined) return true;
    return safeNumber(est, 0) > 0;
  };

  const toggleOpcional = (grupo, item) => {
    const grupoId = grupo.id;
    const tipo = (grupo?.tipoSelecao || "MULTIPLE").toUpperCase();
    const max = safeNumber(grupo?.maxSelecionaveis, 0);
    const min = safeNumber(grupo?.minSelecionaveis, 0);

    if (!isItemDisponivel(item)) return;

    setSelecionadosPorGrupo((prev) => {
      const atuais = new Set(Array.isArray(prev?.[grupoId]) ? prev[grupoId] : []);
      const id = item.id;
      const ja = atuais.has(id);

      if (tipo === "SINGLE") {
        if (ja) {
          if (min > 0) return prev;
          atuais.delete(id);
        } else {
          atuais.clear();
          atuais.add(id);
        }

        return { ...prev, [grupoId]: Array.from(atuais) };
      }

      if (ja) {
        if (atuais.size <= Math.max(0, min)) return prev;
        atuais.delete(id);
        return { ...prev, [grupoId]: Array.from(atuais) };
      }

      if (max > 0 && atuais.size >= max) return prev;
      atuais.add(id);
      return { ...prev, [grupoId]: Array.from(atuais) };
    });
  };

  const alterarQtdAdicional = (grupo, item, delta) => {
    const grupoId = grupo.id;
    const itemId = item.id;

    if (!isItemDisponivel(item) && delta > 0) return;

    setQuantidadesAdicionais((prev) => {
      const grupoAtual = { ...(prev?.[grupoId] || {}) };
      const atual = safeNumber(grupoAtual[itemId], 0);
      const proximo = Math.max(0, atual + delta);

      if (item?.estoque !== null && item?.estoque !== undefined) {
        const estoque = safeNumber(item.estoque, 0);
        if (proximo > estoque) return prev;
      }

      const maxGrupo = safeNumber(grupo?.maxSelecionaveis, 0);
      if (delta > 0 && maxGrupo > 0) {
        const totalAtualGrupo = Object.values(grupoAtual).reduce(
          (acc, v) => acc + safeNumber(v, 0),
          0
        );
        if (totalAtualGrupo >= maxGrupo) return prev;
      }

      if (proximo === 0) {
        delete grupoAtual[itemId];
      } else {
        grupoAtual[itemId] = proximo;
      }

      return {
        ...prev,
        [grupoId]: grupoAtual,
      };
    });
  };

  const extrasSelecionados = useMemo(() => {
    let total = 0;

    for (const g of gruposOpcionais) {
      const itens = itensDoGrupo(g);
      const tipoGrupo = getTipoGrupo(g);

      if (tipoGrupo === "ADICIONAL_QUANTIDADE") {
        itens.forEach((i) => {
          const qtd = getQtdAdicional(g.id, i.id);
          if (qtd > 0) {
            total += safeNumber(i?.precoExtra, 0) * qtd;
          }
        });
      } else {
        const selectedIds = new Set(getSelecionados(g.id));
        itens.forEach((i) => {
          if (selectedIds.has(i.id)) {
            total += safeNumber(i?.precoExtra, 0);
          }
        });
      }
    }

    return total;
  }, [gruposOpcionais, selecionadosPorGrupo, quantidadesAdicionais]);

  // preço real do produto que vai para o carrinho
  const precoUnitario = useMemo(() => {
    if (precoFinalAtivo == null) return null;
    return precoFinalAtivo;
  }, [precoFinalAtivo]);

  // apenas visualização no modal
  const precoUnitarioComExtras = useMemo(() => {
    if (precoUnitario == null) return null;
    return precoUnitario + extrasSelecionados;
  }, [precoUnitario, extrasSelecionados]);

  const subtotal = useMemo(() => {
    if (precoUnitarioComExtras == null) return null;
    return precoUnitarioComExtras * quantidade;
  }, [precoUnitarioComExtras, quantidade]);

  const validacaoGrupos = useMemo(() => {
    const erros = [];

    gruposOpcionais.forEach((g) => {
      const obrigatorio = Boolean(g?.obrigatorio);
      const min = safeNumber(g?.minSelecionaveis, 0);
      const max = safeNumber(g?.maxSelecionaveis, 0);
      const tipoGrupo = getTipoGrupo(g);

      let qtd = 0;

      if (tipoGrupo === "ADICIONAL_QUANTIDADE") {
        const mapa = quantidadesAdicionais?.[g.id] || {};
        qtd = Object.values(mapa).reduce((acc, v) => acc + safeNumber(v, 0), 0);
      } else {
        qtd = getSelecionados(g.id).length;
      }

      const minEfetivo = obrigatorio ? Math.max(1, min) : Math.max(0, min);

      if (qtd < minEfetivo) {
        erros.push(`${g?.nome || "Grupo"}: selecione pelo menos ${minEfetivo}`);
      }

      if (max > 0 && qtd > max) {
        erros.push(`${g?.nome || "Grupo"}: máximo ${max}`);
      }
    });

    return { ok: erros.length === 0, erros };
  }, [gruposOpcionais, selecionadosPorGrupo, quantidadesAdicionais]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setQuantidade(1);
    setSelecionadosPorGrupo({});
    setQuantidadesAdicionais({});
    setObservacao("");
    setVariacaoSelecionada(null);
  }, [produto, hasVars]);

  useEffect(() => {
    setQuantidade((q) => {
      const safe = Math.max(1, q);
      return Math.min(safe, Math.max(1, estoqueAtivo));
    });
  }, [estoqueAtivo]);

  const podeAdicionar = useMemo(() => {
    if (precoUnitario == null) return false;
    if (!emEstoque) return false;
    if (hasVars && !variacaoSelecionada) return false;
    if (!validacaoGrupos.ok) return false;
    return true;
  }, [precoUnitario, emEstoque, hasVars, variacaoSelecionada, validacaoGrupos.ok]);

  const handleAdicionar = () => {
    if (!podeAdicionar) return;

    const qtd = Math.max(1, Math.min(quantidade, Math.max(1, estoqueAtivo)));
    const variacaoId = hasVars ? variacaoSelecionada?.id : null;

    const opcionais = gruposOpcionais.map((g) => {
      const tipoGrupo = getTipoGrupo(g);

      if (tipoGrupo === "ADICIONAL_QUANTIDADE") {
        const itens = Object.entries(quantidadesAdicionais?.[g.id] || {})
          .filter(([, qtdItem]) => safeNumber(qtdItem, 0) > 0)
          .map(([itemId, qtdItem]) => ({
            itemId: Number(itemId),
            quantidade: safeNumber(qtdItem, 0),
          }));

        return {
          grupoId: g.id,
          tipoGrupo,
          itens,
        };
      }

      return {
        grupoId: g.id,
        tipoGrupo,
        itens: getSelecionados(g.id).map((id) => ({
          itemId: id,
          quantidade: 1,
        })),
      };
    });

    const obsFinal = permiteObservacao
      ? (observacao || "").slice(0, maxObs || 9999).trim()
      : "";

    onAdicionar?.({
      produtoId: produto.id,
      variacaoId,
      quantidade: qtd,
      opcionais,
      observacao: obsFinal,
      precoUnitario,
      nomeProduto: produto.nome || null,
      imagemUrl: produto.imagemUrl || null,
    });

    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[999]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes de ${produto?.nome ?? "produto"}`}
          className={[
            "relative w-full sm:max-w-xl",
            "bg-white text-zinc-900",
            "rounded-t-3xl sm:rounded-3xl",
            "shadow-2xl overflow-hidden",
            "max-h-[92vh] sm:max-h-[85vh]",
            "flex flex-col",
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-100">
            <div className="px-4 sm:px-6 py-4 flex items-start gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                <img
                  src={produto?.imagemUrl || "/placeholder.png"}
                  alt={produto?.nome}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold leading-tight line-clamp-2">
                      {produto?.nome}
                    </h2>
                    {produto?.descricao && (
                      <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                        {produto.descricao}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition"
                    aria-label="Fechar"
                  >
                    <X className="h-5 w-5 text-zinc-700" />
                  </button>
                </div>

                <div className="mt-2">
                  {precoUnitarioComExtras != null ? (
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">
                        {hasVars ? "Selecionado:" : "Preço:"}{" "}
                        <span
                          className={[
                            "font-extrabold",
                            temDescontoAtivo ? "text-red-600" : "text-zinc-900",
                          ].join(" ")}
                        >
                          {formatBRL(precoUnitarioComExtras)}
                        </span>

                        {extrasSelecionados > 0 ? (
                          <span className="ml-2 text-xs text-zinc-500">
                            (inclui {formatBRL(extrasSelecionados)} em adicionais)
                          </span>
                        ) : null}
                      </p>

                      {temDescontoAtivo ? (
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            <Percent className="h-3.5 w-3.5" />
                            Oferta
                          </span>

                          <span className="text-xs text-zinc-400 line-through">
                            {formatBRL(precoBaseAtivo + extrasSelecionados)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      {hasVars
                        ? "Escolha uma opção abaixo para continuar"
                        : "Preço indisponível"}
                    </p>
                  )}
                </div>

                {!emEstoque && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    Esgotado
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 overflow-auto">
            {hasVars && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-zinc-900">Opções</h3>
                  <p className="text-xs text-zinc-500">
                    {variacoes.length} {variacoes.length === 1 ? "opção" : "opções"}
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  {variacoes.map((v) => {
                    const ativo = variacaoSelecionada?.id === v.id;
                    const estoque = safeNumber(v.estoque, 0);
                    const disponivel = estoque > 0;

                    const precoBase = safeNumber(v.preco, NaN);
                    const precoFinal = safeNumber(
                      v.precoPromocional ?? v.preco,
                      NaN
                    );

                    const temDesconto =
                      ofertaVigente &&
                      Number.isFinite(precoBase) &&
                      Number.isFinite(precoFinal) &&
                      precoFinal < precoBase;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          if (!disponivel) return;
                          setVariacaoSelecionada(v);
                          setQuantidade(1);
                        }}
                        disabled={!disponivel}
                        className={[
                          "w-full text-left rounded-2xl border p-4 transition",
                          "flex items-center justify-between gap-3",
                          disponivel
                            ? "bg-white border-zinc-200 hover:bg-zinc-50"
                            : "bg-zinc-50 border-zinc-200 opacity-70 cursor-not-allowed",
                          ativo ? "ring-2 ring-red-500 border-red-200" : "",
                        ].join(" ")}
                      >
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-bold text-zinc-900 line-clamp-1">
                            {v.nome}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {temDesconto ? (
                              <>
                                <span className="text-sm font-extrabold text-red-600">
                                  {formatBRL(precoFinal)}
                                </span>
                                <span className="text-xs text-zinc-400 line-through">
                                  {formatBRL(precoBase)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-extrabold text-zinc-900">
                                {Number.isFinite(precoFinal) ? formatBRL(precoFinal) : "—"}
                              </span>
                            )}

                            <span
                              className={[
                                "text-xs font-semibold px-2 py-1 rounded-full border",
                                disponivel
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : "bg-red-50 text-red-700 border-red-100",
                              ].join(" ")}
                            >
                              {disponivel ? `Disponível (${estoque})` : "Esgotado"}
                            </span>

                            {temDesconto ? (
                              <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-red-50 text-red-700 border-red-100">
                                Oferta
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <div
                            className={[
                              "h-9 w-9 rounded-2xl grid place-items-center border transition",
                              ativo
                                ? "bg-red-600 border-red-600 text-white"
                                : "bg-white border-zinc-200 text-zinc-400",
                            ].join(" ")}
                            aria-hidden="true"
                          >
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 h-px w-full bg-zinc-100" />
              </>
            )}

            {gruposOpcionais.length > 0 && (
              <div className="mt-5 space-y-6">

                {gruposOpcionais.map((g) => {
                  const itens = itensDoGrupo(g);
                  const tipo = (g?.tipoSelecao || "MULTIPLE").toUpperCase();
                  const tipoGrupo = getTipoGrupo(g);
                  const obrigatorio = Boolean(g?.obrigatorio);
                  const min = safeNumber(g?.minSelecionaveis, 0);
                  const max = safeNumber(g?.maxSelecionaveis, 0);

                  const qtdSel =
                    tipoGrupo === "ADICIONAL_QUANTIDADE"
                      ? Object.values(quantidadesAdicionais?.[g.id] || {}).reduce(
                          (acc, v) => acc + safeNumber(v, 0),
                          0
                        )
                      : getSelecionados(g.id).length;

                  const minEfetivo = obrigatorio ? Math.max(1, min) : Math.max(0, min);

                  return (
                    <div key={g.id} className="rounded-3xl border border-zinc-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-zinc-900">
                            {g.nome}
                            {obrigatorio ? (
                              <span className="ml-2 text-xs font-semibold text-red-600">
                                Obrigatório
                              </span>
                            ) : null}
                          </p>

                          {g?.descricao ? (
                            <p className="mt-1 text-xs text-zinc-500">{g.descricao}</p>
                          ) : null}

                          <p className="mt-2 text-xs text-zinc-500">
                            {tipoGrupo === "ADICIONAL_QUANTIDADE"
                              ? "Adicione quantos quiser"
                              : tipo === "SINGLE"
                              ? "Escolha 1 opção"
                              : "Escolha opções"}
                            {" • "}
                            {minEfetivo > 0 ? `mín ${minEfetivo}` : "mín 0"}
                            {max > 0 ? ` • máx ${max}` : ""}
                            {" • "}
                            selecionados:{" "}
                            <span className="font-bold text-zinc-700">{qtdSel}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2">
                        {itens.map((i) => {
                          const disponivel = isItemDisponivel(i);
                          const extra = safeNumber(i?.precoExtra, 0);

                          if (tipoGrupo === "ADICIONAL_QUANTIDADE") {
                            const qtdItem = getQtdAdicional(g.id, i.id);
                            const totalGrupo = Object.values(
                              quantidadesAdicionais?.[g.id] || {}
                            ).reduce((acc, v) => acc + safeNumber(v, 0), 0);

                            const bloqueadoPorMax =
                              max > 0 && qtdItem <= 0 && totalGrupo >= max;

                            return (
                              <div
                                key={i.id}
                                className={[
                                  "w-full rounded-2xl border p-4 transition",
                                  "flex items-center justify-between gap-3",
                                  !disponivel
                                    ? "bg-zinc-50 border-zinc-200 opacity-70"
                                    : "bg-white border-zinc-200",
                                ].join(" ")}
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-zinc-900 line-clamp-1">
                                    {i.nome}
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-extrabold text-zinc-900">
                                      {extra > 0 ? `+ ${formatBRL(extra)}` : "Sem custo"}
                                    </span>

                                    {i?.estoque !== null && i?.estoque !== undefined ? (
                                      <span
                                        className={[
                                          "text-xs font-semibold px-2 py-1 rounded-full border",
                                          disponivel
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                            : "bg-red-50 text-red-700 border-red-100",
                                        ].join(" ")}
                                      >
                                        {disponivel
                                          ? `Disponível (${safeNumber(i.estoque, 0)})`
                                          : "Esgotado"}
                                      </span>
                                    ) : null}

                                    {bloqueadoPorMax ? (
                                      <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-100">
                                        Limite do grupo
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => alterarQtdAdicional(g, i, -1)}
                                    disabled={qtdItem <= 0}
                                    className={[
                                      "h-10 w-10 rounded-2xl border grid place-items-center transition",
                                      qtdItem <= 0
                                        ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                        : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50",
                                    ].join(" ")}
                                    aria-label={`Diminuir ${i.nome}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>

                                  <div className="min-w-[36px] text-center font-extrabold text-zinc-900">
                                    {qtdItem}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => alterarQtdAdicional(g, i, 1)}
                                    disabled={!disponivel || bloqueadoPorMax}
                                    className={[
                                      "h-10 w-10 rounded-2xl border grid place-items-center transition",
                                      !disponivel || bloqueadoPorMax
                                        ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                        : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50",
                                    ].join(" ")}
                                    aria-label={`Aumentar ${i.nome}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          const selected = getSelecionados(g.id).includes(i.id);

                          const bloqueadoPorMax =
                            !selected &&
                            tipo !== "SINGLE" &&
                            max > 0 &&
                            qtdSel >= max;

                          const disabled = !disponivel || bloqueadoPorMax;

                          return (
                            <button
                              key={i.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => toggleOpcional(g, i)}
                              className={[
                                "w-full text-left rounded-2xl border p-4 transition",
                                "flex items-center justify-between gap-3",
                                disabled
                                  ? "bg-zinc-50 border-zinc-200 opacity-70 cursor-not-allowed"
                                  : "bg-white border-zinc-200 hover:bg-zinc-50",
                                selected ? "ring-2 ring-red-500 border-red-200" : "",
                              ].join(" ")}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 line-clamp-1">
                                  {i.nome}
                                </p>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-extrabold text-zinc-900">
                                    {extra > 0 ? `+ ${formatBRL(extra)}` : "Sem custo"}
                                  </span>

                                  {i?.estoque !== null && i?.estoque !== undefined ? (
                                    <span
                                      className={[
                                        "text-xs font-semibold px-2 py-1 rounded-full border",
                                        disponivel
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                          : "bg-red-50 text-red-700 border-red-100",
                                      ].join(" ")}
                                    >
                                      {disponivel
                                        ? `Disponível (${safeNumber(i.estoque, 0)})`
                                        : "Esgotado"}
                                    </span>
                                  ) : null}

                                  {bloqueadoPorMax ? (
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-100">
                                      Limite do grupo
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="shrink-0">
                                <div
                                  className={[
                                    "h-9 w-9 rounded-2xl grid place-items-center border transition",
                                    selected
                                      ? "bg-red-600 border-red-600 text-white"
                                      : "bg-white border-zinc-200 text-zinc-400",
                                  ].join(" ")}
                                  aria-hidden="true"
                                >
                                  <Check className="h-5 w-5" />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {!validacaoGrupos.ok && qtdSel < minEfetivo ? (
                        <p className="mt-3 text-xs font-semibold text-red-600">
                          Selecione pelo menos {minEfetivo} item(ns).
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {permiteObservacao && (
              <div className="mt-6">
                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-zinc-900">Observação</p>
                    {maxObs > 0 ? (
                      <p className="text-xs text-zinc-500">
                        {Math.min(observacao.length, maxObs)}/{maxObs}
                      </p>
                    ) : null}
                  </div>

                  <textarea
                    value={observacao}
                    onChange={(e) => {
                      const v = e.target.value || "";
                      setObservacao(maxObs > 0 ? v.slice(0, maxObs) : v);
                    }}
                    rows={3}
                    placeholder="Ex.: sem cebola, bem passado, etc."
                    className="mt-3 w-full resize-none rounded-2xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-zinc-900">Quantidade</p>
                    <p className="text-xs text-zinc-500">
                      {hasVars
                        ? variacaoSelecionada
                          ? `Máximo: ${estoqueAtivo}`
                          : "Selecione uma opção para definir o limite"
                        : `Máximo: ${estoqueAtivo}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                      disabled={quantidade <= 1}
                      className={[
                        "h-11 w-11 rounded-2xl border grid place-items-center transition",
                        quantidade <= 1
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50",
                      ].join(" ")}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-5 w-5" />
                    </button>

                    <div className="min-w-[56px] text-center">
                      <span className="text-lg font-extrabold text-zinc-900">
                        {quantidade}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantidade((q) =>
                          Math.min(q + 1, Math.max(1, estoqueAtivo))
                        )
                      }
                      disabled={!emEstoque || quantidade >= Math.max(1, estoqueAtivo)}
                      className={[
                        "h-11 w-11 rounded-2xl border grid place-items-center transition",
                        !emEstoque || quantidade >= Math.max(1, estoqueAtivo)
                          ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50",
                      ].join(" ")}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-zinc-600">Subtotal</span>
                  <span className="font-extrabold text-zinc-900">
                    {subtotal == null ? "—" : formatBRL(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {!validacaoGrupos.ok ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-semibold text-red-700">
                  Complete as escolhas obrigatórias para continuar.
                </p>
                <ul className="mt-2 text-xs text-red-700 list-disc pl-5">
                  {validacaoGrupos.erros.slice(0, 4).map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="h-28 sm:h-0" />
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-zinc-100">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <button
                onClick={onClose}
                className="hidden sm:inline-flex px-4 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-semibold text-zinc-900"
              >
                Voltar
              </button>

              <button
                onClick={handleAdicionar}
                disabled={!podeAdicionar}
                className={[
                  "w-full inline-flex items-center justify-center gap-2",
                  "px-5 py-3 rounded-2xl font-semibold transition",
                  !podeAdicionar
                    ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500 shadow-[0_14px_30px_rgba(239,68,68,0.18)]",
                ].join(" ")}
              >
                <ShoppingCart className="h-5 w-5" />
                {!emEstoque
                  ? "Esgotado"
                  : hasVars && !variacaoSelecionada
                  ? "Selecione uma opção"
                  : !validacaoGrupos.ok
                  ? "Complete as Variações"
                  : `Adicionar (${quantidade})`}
                {subtotal != null && podeAdicionar ? (
                  <span className="ml-1 font-extrabold">• {formatBRL(subtotal)}</span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}