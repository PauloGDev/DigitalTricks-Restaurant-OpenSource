import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertTriangle, Copy, QrCode, ArrowLeft } from "lucide-react";
import PageTitle from "../context/PageTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 min

export default function AguardandoPagamentoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pedido = location.state || {};

  const API_URL = import.meta.env.VITE_API_URL;

  const pedidoId = pedido?.pedidoId ?? pedido?.id ?? null;
  const total = pedido?.total || 0;
  const tipoPagamento = pedido?.tipoPagamento || null;
  const pixInfo = pedido?.pixInfo || null;
  const tipoEntrega = pedido?.tipoEntrega || null;
  const enderecoEntrega = pedido?.enderecoEntrega || null;

  const [statusPagamento, setStatusPagamento] = useState("PENDENTE");
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [erroPagamento, setErroPagamento] = useState(false);
  const [pagamentoRecusado, setPagamentoRecusado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Timer decorrido
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTempoDecorrido((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Timeout
  useEffect(() => {
    if (tempoDecorrido * 1000 >= POLL_TIMEOUT_MS) {
      clearInterval(pollingRef.current);
      setErroPagamento(true);
    }
  }, [tempoDecorrido]);

  // Polling de pagamento
  useEffect(() => {
    if (!pedidoId || tipoPagamento === "PAY_ON_DELIVERY") return;
    if (pagamentoRecusado || erroPagamento) return;

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/pedidos/${pedidoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.warn("Erro ao verificar status do pagamento, retrying...");
          return;
        }

        const data = await res.json();
        const stPagamento = data.statusPagamento || "PENDENTE";
        const stPedido = data.status || "AGUARDANDO_PAGAMENTO";

        setStatusPagamento(stPagamento);

        if (stPagamento === "APROVADO") {
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          navigate("/pedido-feito", {
            replace: true,
            state: {
              pedidoId,
              total,
              tipoPagamento,
              tipoEntrega,
              enderecoEntrega,
              status: stPedido,
            },
          });
        } else if (stPagamento === "RECUSADO" || stPagamento === "CANCELADO") {
          clearInterval(pollingRef.current);
          clearInterval(timerRef.current);
          setPagamentoRecusado(true);
        }
      } catch (err) {
        console.warn("Erro ao verificar status do pagamento:", err.message);
      }
    };

    // Primeira verificacao imediata
    checkStatus();

    pollingRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => clearInterval(pollingRef.current);
  }, [pedidoId, tipoPagamento, pagamentoRecusado, erroPagamento, navigate, API_URL]);

  const copiarCodigoPix = async () => {
    if (!pixInfo?.pixPayload) return;
    await navigator.clipboard.writeText(pixInfo.pixPayload);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // PAY_ON_DELIVERY: vai direto para pagina de confirmacao
  if (tipoPagamento === "PAY_ON_DELIVERY") {
    navigate("/pedido-feito", {
      replace: true,
      state: { pedidoId, total, tipoPagamento, tipoEntrega, enderecoEntrega, status: "RECEBIDO" },
    });
    return null;
  }

  // Pagamento recusado
  if (pagamentoRecusado) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <PageTitle title="Pagamento recusado | Restaurante" />
        <div className="flex min-h-screen items-center justify-center px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-zinc-900">Pagamento recusado</h2>
            <p className="mt-2 text-sm text-zinc-600">
              O pagamento não foi aprovado. Tente novamente com outro método de pagamento.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 w-full rounded-2xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500"
            >
              Voltar ao carrinho
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Erro / Timeout
  if (erroPagamento) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <PageTitle title="Erro no pagamento | Restaurante" />
        <div className="flex min-h-screen items-center justify-center px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-zinc-900">Tempo limite excedido</h2>
            <p className="mt-2 text-sm text-zinc-600">
              O pagamento não foi identificado em 5 minutos. Verifique se o PIX foi efetuado ou tente novamente.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => navigate(-1)}
                className="w-full rounded-2xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500"
              >
                Voltar ao carrinho
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full rounded-2xl border border-zinc-200 py-3 font-bold text-zinc-700 transition hover:bg-zinc-50"
              >
                Tentar novamente
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Aguardando PIX
  if (tipoPagamento === "PIX") {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <PageTitle title="Aguardando pagamento | Restaurante" />

        <div className="border-b pt-20 pb-6 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-2xl font-extrabold text-gray sm:text-3xl">
                  Aguardando pagamento
                </h1>
                <p className="mt-1 text-sm text-gray/60">
                  Escaneie o QR Code ou copie o código PIX para pagar.
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray/85 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            </motion.div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              {/* PIX QR Code */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center"
              >
                {pixInfo?.pixQrCodeBase64 ? (
                  <div className="mb-6 mx-auto flex w-full max-w-[240px] justify-center rounded-2xl border border-zinc-200 bg-white p-4">
                    <img
                      alt="QR Code PIX"
                      src={`data:image/png;base64,${pixInfo.pixQrCodeBase64}`}
                      className="h-auto w-full"
                    />
                  </div>
                ) : (
                  <div className="mb-6 mx-auto grid h-48 w-48 place-items-center rounded-2xl border border-zinc-200 bg-white">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                  </div>
                )}

                {pixInfo?.pixPayload ? (
                  <div className="mx-auto max-w-lg">
                    <p className="mb-2 text-sm font-semibold text-zinc-600">Copia e cola PIX:</p>
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700 break-all">
                      <span className="flex-1 text-left">{pixInfo.pixPayload}</span>
                      <button
                        onClick={copiarCodigoPix}
                        className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-zinc-800"
                      >
                        {copiado ? "Copiado!" : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="space-y-6 lg:sticky lg:top-24">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-5 w-5 animate-spin text-red-600" />
                    <span className="text-sm font-extrabold">Aguardando pagto.</span>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs text-zinc-500">Pedido</p>
                      <p className="text-lg font-extrabold">#{pedidoId}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs text-zinc-500">Total</p>
                      <p className="text-lg font-extrabold">
                        R$ {total ? total.toFixed(2).replace(".", ",") : "0,00"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                      <p className="text-xs text-zinc-500">Tempo decorrido</p>
                      <p className="text-lg font-extrabold font-mono">{formatTime(tempoDecorrido)}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center"
                >
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 mb-2" />
                  <p className="text-sm font-extrabold text-emerald-900">
                    Aguardando confirmação
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Você será redirecionado automaticamente quando o pagamento for confirmado.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cartao
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PageTitle title="Pagamento | Restaurante" />

      <div className="border-b pt-20 pb-6 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-extrabold text-gray sm:text-3xl">
                Pagamento com cartão
              </h1>
              <p className="mt-1 text-sm text-gray/60">
                O pagamento está sendo processado. Aguarde...
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray/85 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
            >
              <p className="text-lg font-extrabold text-gray">Processando pagamento...</p>
              <p className="mt-2 text-sm text-gray/60">
                Aguardando confirmação do pagamento pelo operadora.
              </p>
              <Loader2 className="mx-auto mt-6 h-8 w-8 animate-spin text-red-600" />
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <div className="space-y-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs text-zinc-500">Pedido</p>
                    <p className="text-lg font-extrabold">#{pedidoId}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs text-zinc-500">Total</p>
                    <p className="text-lg font-extrabold">
                      R$ {total ? total.toFixed(2).replace(".", ",") : "0,00"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs text-zinc-500">Tempo decorrido</p>
                    <p className="text-lg font-extrabold font-mono">{formatTime(tempoDecorrido)}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center"
              >
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 mb-2" />
                <p className="text-sm font-extrabold text-emerald-900">
                  Aguardando confirmação
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Redirecionando após pagamento...
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
