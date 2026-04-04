import { motion } from "framer-motion";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  ShoppingBag,
  MessageCircle,
  Receipt,
  ChevronRight,
  Home,
} from "lucide-react";
import PageTitle from "../context/PageTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const safeNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function PedidoFeitoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Você pode navegar para esta página passando state:
  // navigate("/pedido-feito", { state: { pedidoId, total, nomeCompleto, whatsapp, status } })
  const pedido = location.state || {};

  const pedidoId = pedido?.pedidoId ?? pedido?.id ?? null;
  const total = safeNumber(pedido?.total, 0);
  const nomeCompleto = pedido?.nomeCompleto || "Cliente";
  const status = pedido?.status || "AGUARDANDO_PAGAMENTO";

  // Troque pelo número real da loja
  const whatsappNumero = pedido?.whatsapp || "5585984642900";

  const mensagemWhatsapp = useMemo(() => {
    const partes = [
      `Olá! Acabei de fazer meu pedido${pedidoId ? ` #${pedidoId}` : ""}.`,
      nomeCompleto ? `Nome: ${nomeCompleto}.` : null,
      total > 0 ? `Total: ${brl.format(total)}.` : null,
      "Quero acompanhar o andamento do pedido por aqui.",
    ].filter(Boolean);

    return encodeURIComponent(partes.join(" "));
  }, [pedidoId, nomeCompleto, total]);

  const whatsappUrl = `https://wa.me/${whatsappNumero}?text=${mensagemWhatsapp}`;

  const statusLabel =
    status === "AGUARDANDO_PAGAMENTO"
      ? "Aguardando pagamento"
      : status === "PENDENTE"
      ? "Pendente"
      : status === "PAGO"
      ? "Pagamento aprovado"
      : status === "EM_PREPARO"
      ? "Em preparo"
      : status === "SAIU_PARA_ENTREGA"
      ? "Saiu para entrega"
      : status === "ENTREGUE"
      ? "Entregue"
      : status;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PageTitle title="Pedido feito | Restaurante" />

      <div className="border-b pt-20 pb-6 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-start justify-between gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray/80">
                <Receipt className="h-4 w-4" />
                Confirmação
              </div>

              <h1 className="mt-2 text-2xl font-extrabold text-gray sm:text-3xl">
                Pedido realizado com sucesso
              </h1>

              <p className="mt-1 text-sm text-gray/60">
                Seu pedido foi recebido. Você pode acompanhar o andamento pelo
                WhatsApp ou pela área de pedidos.
              </p>
            </div>

            <button
              onClick={() => navigate("/cardapio")}
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray/85 transition hover:bg-white/10 sm:inline-flex sm:items-center sm:justify-center"
            >
              Voltar ao cardápio
            </button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <motion.div
              variants={popIn}
              initial="hidden"
              animate="show"
              className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl border border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-lg font-extrabold text-gray">
                      Tudo certo, {nomeCompleto.split(" ")[0]}.
                    </p>
                    <p className="mt-1 text-sm text-gray/60">
                      Seu pedido foi registrado e já está no nosso fluxo de
                      atendimento.
                    </p>

                    {pedidoId && (
                      <div className="mt-3 inline-flex items-center rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm font-bold text-zinc-800 shadow-sm">
                        Pedido #{pedidoId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                    <Clock3 className="h-4 w-4" />
                    {statusLabel}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <ShoppingBag className="h-5 w-5 text-gray/80" />
                </div>

                <div>
                  <p className="font-extrabold text-gray">Resumo</p>
                  <p className="text-xs text-gray/55">
                    Informações principais do pedido
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Número do pedido
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-zinc-900">
                    {pedidoId ? `#${pedidoId}` : "Gerado com sucesso"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Total
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-zinc-900">
                    {total > 0 ? brl.format(total) : "A confirmar"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Status atual
                  </p>
                  <p className="mt-1 text-base font-extrabold text-zinc-900">
                    {statusLabel}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Acompanhamento
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-700">
                    WhatsApp ou área de pedidos
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.14 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
            >
              <p className="font-extrabold text-gray">Próximos passos</p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-bold text-zinc-900">
                    1. Recebemos seu pedido
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Nossa equipe já foi notificada e o pedido entrou na fila de
                    processamento.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-bold text-zinc-900">
                    2. Você pode acompanhar em tempo real
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    Acompanhe pelo WhatsApp para ter contato mais direto ou pela
                    sua área de pedidos dentro da plataforma.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-sm font-bold text-zinc-900">
                    3. Atualizações do status
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    O status será atualizado conforme pagamento, preparo e
                    entrega.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.06 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <p className="text-lg font-extrabold text-gray">
                  Acompanhar pedido
                </p>
                <p className="mt-1 text-sm text-gray/60">
                  Escolha a forma mais prática para seguir com o atendimento.
                </p>

                <div className="mt-5 space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-between rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500 shadow-[0_14px_30px_rgba(34,197,94,0.18)]"
                  >
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Acompanhar no WhatsApp
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </a>

                  <button
                    onClick={() => navigate("/pedidos")}
                    className="inline-flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Ir para Meus Pedidos
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-50"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Voltar ao início
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.12 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <p className="font-extrabold text-gray">Dica</p>
                <p className="mt-2 text-sm text-gray/60">
                  Ao falar no WhatsApp, informe o número do pedido
                  {pedidoId ? ` #${pedidoId}` : ""} para agilizar seu
                  atendimento.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
          <div className="border-t border-white/10 bg-zinc-950/90 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray/60">Pedido</p>
                <p className="truncate text-base font-extrabold text-gray">
                  {pedidoId ? `#${pedidoId}` : "Confirmado"}
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-500"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="h-20 lg:hidden" />
      </div>
    </div>
  );
}