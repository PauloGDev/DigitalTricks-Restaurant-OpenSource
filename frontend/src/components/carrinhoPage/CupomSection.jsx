import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TicketPercent,
  Tag,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const detalhesLabels = {
  valorMinimoPedido: "Valor mínimo do pedido",
  subtotalAtual: "Valor atual do pedido",
  quantidadeMinimaItens: "Quantidade mínima de itens",
  quantidadeItensAtual: "Itens no carrinho",
  horarioInicio: "Disponível a partir de",
  horarioFim: "Disponível até",
  horarioAtual: "Horário atual",
  diasSemanaPermitidos: "Dias permitidos",
  diaAtual: "Hoje",
  tipoEntregaPermitida: "Tipo de entrega permitido",
  tipoEntregaAtual: "Tipo de entrega atual",
  tipoPagamentoPermitido: "Pagamento permitido",
  tipoPagamentoAtual: "Tipo de pagamento atual",
  limiteUsoTotal: "Limite total de usos",
  totalUsado: "Total já utilizado",
  limiteUsoPorUsuario: "Limite por usuário",
  usosDoUsuario: "Usos do usuário",
};

const formatarDetalhe = (key, value) => {
  if (value == null || value === "") return null;

  if (
    key.toLowerCase().includes("valor") ||
    key.toLowerCase().includes("subtotal")
  ) {
    return formatCurrency(value);
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
};

const gerarMensagemAmigavel = (erro) => {
  const details = erro?.details || {};

  if (details.valorMinimoPedido && details.subtotalAtual !== undefined) {
    return `Este cupom é válido para pedidos a partir de ${formatCurrency(
      details.valorMinimoPedido
    )}. Seu pedido atual é de ${formatCurrency(details.subtotalAtual)}.`;
  }

  if (
    details.quantidadeMinimaItens &&
    details.quantidadeItensAtual !== undefined
  ) {
    return `Adicione pelo menos ${details.quantidadeMinimaItens} itens ao pedido. Atualmente você possui ${details.quantidadeItensAtual}.`;
  }

  if (
    details.quantidadeMaximaItens &&
    details.quantidadeItensAtual !== undefined
  ) {
    return `Este cupom é válido para pedidos com no máximo ${details.quantidadeMaximaItens} itens. Atualmente seu carrinho possui ${details.quantidadeItensAtual}.`;
  }

  if (details.horarioInicio || details.horarioFim) {
    if (details.horarioInicio && details.horarioFim) {
      return `Este cupom está disponível apenas entre ${details.horarioInicio} e ${details.horarioFim}.`;
    }

    if (details.horarioInicio) {
      return `Este cupom estará disponível a partir de ${details.horarioInicio}.`;
    }

    if (details.horarioFim) {
      return `Este cupom esteve disponível até ${details.horarioFim}.`;
    }
  }

  if (details.diasSemanaPermitidos && details.diaAtual) {
    return `Este cupom não está disponível hoje. Ele pode ser usado apenas em: ${
      Array.isArray(details.diasSemanaPermitidos)
        ? details.diasSemanaPermitidos.join(", ")
        : details.diasSemanaPermitidos
    }.`;
  }

  if (details.tipoEntregaPermitida && details.tipoEntregaAtual) {
    return `Este cupom é válido apenas para ${details.tipoEntregaPermitida}. Atualmente o pedido está como ${details.tipoEntregaAtual}.`;
  }

  if (details.tipoPagamentoPermitido && details.tipoPagamentoAtual) {
    return `Este cupom é válido apenas para ${details.tipoPagamentoPermitido}. Atualmente o pagamento selecionado é ${details.tipoPagamentoAtual}.`;
  }

  if (details.limiteUsoPorUsuario && details.usosDoUsuario !== undefined) {
    return `Você já utilizou este cupom ${details.usosDoUsuario} vez(es), atingindo o limite permitido.`;
  }

  if (details.limiteUsoTotal && details.totalUsado !== undefined) {
    return `Este cupom atingiu o limite total de utilizações e não está mais disponível.`;
  }

  return erro?.message || "Não foi possível aplicar o cupom.";
};

const gerarSugestao = (erro) => {
  const details = erro?.details || {};

  if (details.valorMinimoPedido && details.subtotalAtual !== undefined) {
    const falta =
      Number(details.valorMinimoPedido) - Number(details.subtotalAtual);

    if (falta > 0) {
      return `Adicione mais ${formatCurrency(
        falta
      )} em itens para aproveitar este desconto.`;
    }

    return "Adicione mais itens ao carrinho para aproveitar este desconto.";
  }

  if (
    details.quantidadeMinimaItens &&
    details.quantidadeItensAtual !== undefined
  ) {
    const faltam =
      Number(details.quantidadeMinimaItens) -
      Number(details.quantidadeItensAtual);

    if (faltam > 0) {
      return `Adicione mais ${faltam} item(ns) para usar este cupom.`;
    }
  }

  if (details.tipoEntregaPermitida) {
    return "Altere a forma de entrega para continuar usando este cupom.";
  }

  if (details.tipoPagamentoPermitido) {
    return "Altere a forma de pagamento para continuar usando este cupom.";
  }

  return null;
};

const fadeUp = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.28, ease: "easeOut" },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.24 } },
};

export default function CupomSection({
  slug,
  carrinho,
  setCarrinho,
  normalizarCarrinho,
  showNotification,
  aplicarCupom,
  removerCupom,
}) {
  const [codigo, setCodigo] = useState("");
  const [loadingCupom, setLoadingCupom] = useState(false);
  const [erroCupom, setErroCupom] = useState(null);

  const cupomAplicado = carrinho?.cupom || null;
  const descontoCupom = Number(carrinho?.descontoCupom || 0);

  const erroCupomPersistido = carrinho?.motivoCupomInvalido
    ? {
        message: carrinho.motivoCupomInvalido,
        reasons: [],
        details: {},
        code: carrinho.codigoErroCupom || null,
      }
    : null;

  const erroVisivel = erroCupom || erroCupomPersistido;

  const extrairErroCupom = (err, fallback) => {
    const data = err?.response?.data;

    if (data && typeof data === "object") {
      return {
        message:
          data.message ||
          data.erro ||
          data.error ||
          data.mensagem ||
          err?.message ||
          fallback,
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
        details:
          data.details && typeof data.details === "object" ? data.details : {},
        code: data.code || null,
      };
    }

    if (typeof data === "string" && data.trim()) {
      return {
        message: data,
        reasons: [],
        details: {},
        code: null,
      };
    }

    return {
      message: err?.message || fallback,
      reasons: [],
      details: {},
      code: null,
    };
  };

  const reasonsFiltrados = useMemo(() => {
    if (!erroVisivel?.reasons?.length) return [];
    return erroVisivel.reasons.filter((r) => r !== erroVisivel.message);
  }, [erroVisivel]);

  const detalhesRenderizaveis = useMemo(() => {
    if (!erroVisivel?.details) return [];

    return Object.entries(erroVisivel.details)
      .map(([key, value]) => ({
        key,
        label: detalhesLabels[key] || key,
        value: formatarDetalhe(key, value),
      }))
      .filter((item) => item.value);
  }, [erroVisivel]);

  const mensagemAmigavel = useMemo(
    () => gerarMensagemAmigavel(erroVisivel),
    [erroVisivel]
  );

  const sugestaoErro = useMemo(
    () => gerarSugestao(erroVisivel),
    [erroVisivel]
  );

  const onAplicarCupom = async () => {
    const codigoFinal = codigo.trim().toUpperCase();

    if (!slug) {
      const erro = {
        message: "Restaurante não identificado.",
        reasons: [],
        details: {},
        code: null,
      };
      setErroCupom(erro);
      showNotification?.(erro.message, "error");
      return;
    }

    if (!codigoFinal) {
      const erro = {
        message: "Digite um cupom.",
        reasons: [],
        details: {},
        code: null,
      };
      setErroCupom(erro);
      showNotification?.(erro.message, "error");
      return;
    }

    try {
      setLoadingCupom(true);
      setErroCupom(null);

      const data = await aplicarCupom(codigoFinal, slug);
      const carrinhoNormalizado = normalizarCarrinho(data);

      setCarrinho(carrinhoNormalizado);
      setErroCupom(null);

      if (carrinhoNormalizado?.motivoCupomInvalido) {
        showNotification?.(carrinhoNormalizado.motivoCupomInvalido, "error");
      } else {
        showNotification?.("Cupom aplicado com sucesso.", "success");
      }
    } catch (err) {
      console.error(err);

      const erro = extrairErroCupom(
        err,
        "Não foi possível aplicar o cupom."
      );

      setErroCupom(erro);
      showNotification?.(erro.message, "error");
    } finally {
      setLoadingCupom(false);
    }
  };

  const onRemoverCupom = async () => {
    if (!slug) {
      const erro = {
        message: "Restaurante não identificado.",
        reasons: [],
        details: {},
        code: null,
      };
      setErroCupom(erro);
      showNotification?.(erro.message, "error");
      return;
    }

    try {
      setLoadingCupom(true);
      const data = await removerCupom(slug);
      setCarrinho(normalizarCarrinho(data));
      setCodigo("");
      setErroCupom(null);
      showNotification?.("Cupom removido.", "success");
    } catch (err) {
      console.error(err);

      const erro = extrairErroCupom(
        err,
        "Não foi possível remover o cupom."
      );

      setErroCupom(erro);
      showNotification?.(erro.message, "error");
    } finally {
      setLoadingCupom(false);
    }
  };

  const renderBlocoErro = () => {
    if (!erroVisivel) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${erroVisivel.message}-${erroVisivel.code || "sem-codigo"}`}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeUp.transition}
          className="mt-4 overflow-hidden rounded-[28px] border border-red-200/80"
        >
          <div className="relative overflow-hidden border-b border-red-100/80 px-4 py-4 sm:px-5">
            <div className="pointer-events-none absolute inset-0" />

            <div className="relative flex items-start gap-3">
              <motion.div
                initial={{ scale: 0.9, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-red-200 bg-white shadow-sm"
              >
                <AlertCircle className="h-5 w-5 text-red-600" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black tracking-tight text-red-950 sm:text-[15px]">
                    Não foi possível aplicar o cupom
                  </p>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-red-800">
                  {mensagemAmigavel}
                </p>
              </div>
            </div>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="px-4 py-4 sm:px-5"
          >
            {sugestaoErro ? (
              <motion.div
                variants={staggerItem}
                className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 p-3.5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-amber-200 bg-white">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                  </div>

                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-amber-700">
                      Sugestão
                    </p>
                    <p className="mt-1 text-sm font-medium leading-6 text-amber-900">
                      {sugestaoErro}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {reasonsFiltrados.length > 0 ? (
              <motion.div variants={staggerItem} className="mb-4">
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-700">
                  Motivos identificados
                </p>

                <div className="flex flex-wrap gap-2">
                  {reasonsFiltrados.map((item, index) => (
                    <motion.span
                      key={`${item}-${index}`}
                      initial={{ opacity: 0, scale: 0.95, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="inline-flex items-center rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-800 shadow-sm"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ) : null}

          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50">
          <TicketPercent className="h-5 w-5 text-red-600" />
        </div>

        <div>
          <p className="font-extrabold text-zinc-900">Cupom de desconto</p>
          <p className="text-xs text-zinc-500">
            Aplique um cupom válido no pedido
          </p>
        </div>
      </div>

      {cupomAplicado ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border p-4 shadow-sm ${
            erroCupomPersistido
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {erroCupomPersistido ? (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}

                <p
                  className={`text-sm font-extrabold ${
                    erroCupomPersistido ? "text-amber-900" : "text-emerald-900"
                  }`}
                >
                  {erroCupomPersistido
                    ? "Cupom salvo, mas não aplicado no momento"
                    : "Cupom aplicado com sucesso"}
                </p>
              </div>

              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 ${
                  erroCupomPersistido
                    ? "border-amber-200"
                    : "border-emerald-200"
                }`}
              >
                <Tag
                  className={`h-4 w-4 ${
                    erroCupomPersistido ? "text-amber-700" : "text-emerald-700"
                  }`}
                />
                <span
                  className={`text-sm font-bold tracking-wide ${
                    erroCupomPersistido ? "text-amber-800" : "text-emerald-800"
                  }`}
                >
                  {cupomAplicado.codigo}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-700">
                Desconto aplicado:{" "}
                <span
                  className={`font-extrabold ${
                    erroCupomPersistido ? "text-amber-700" : "text-emerald-700"
                  }`}
                >
                  {formatCurrency(descontoCupom)}
                </span>
              </p>

              {erroCupomPersistido ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 rounded-2xl border border-amber-200 bg-white/80 p-3"
                >
                  <p className="text-sm font-bold text-amber-900">
                    Este cupom não está sendo aplicado neste momento
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    {erroCupomPersistido.message}
                  </p>

                  {erroCupomPersistido.code ? (
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-amber-700">
                      Código: {erroCupomPersistido.code}
                    </p>
                  ) : null}
                </motion.div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onRemoverCupom}
              disabled={loadingCupom}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
              title="Remover cupom"
              aria-label="Remover cupom"
            >
              {loadingCupom ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value.toUpperCase());
                if (erroCupom) setErroCupom(null);
              }}
              placeholder="Digite seu cupom"
              className={`flex-1 rounded-2xl border bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 transition focus:ring-4 ${
                erroVisivel
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-zinc-300 focus:border-red-400 focus:ring-red-100"
              }`}
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              type="button"
              onClick={onAplicarCupom}
              disabled={loadingCupom}
              className="inline-flex min-w-[80px] items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingCupom ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                "Aplicar"
              )}
            </motion.button>
          </div>

          {renderBlocoErro()}
        </>
      )}
    </div>
  );
}