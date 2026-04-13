import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Award,
  Package,
  Percent,
  DollarSign,
  Check,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCarrinho } from "../../context/CarrinhoContext";

const PENDING_LOYALTY_COUPON_KEY = (slug) => `fidelidade_cupom_${slug}`;

const levels = [
  { nome: "Bronze", min: 0, cor: "text-orange-500", bg: "bg-orange-500", border: "border-orange-200", bgSoft: "bg-orange-50" },
  { nome: "Prata", min: 5, cor: "text-zinc-500", bg: "bg-zinc-400", border: "border-zinc-200", bgSoft: "bg-zinc-50" },
  { nome: "Ouro", min: 10, cor: "text-amber-500", bg: "bg-amber-400", border: "border-amber-200", bgSoft: "bg-amber-50" },
  { nome: "Mestre", min: 15, cor: "text-purple-600", bg: "bg-purple-500", border: "border-purple-200", bgSoft: "bg-purple-50" },
];

function nivelAtual(pontos) {
  let nivel = levels[0];
  for (const l of levels) {
    if (pontos >= l.min) nivel = l;
  }
  return nivel;
}

function proximoNivel(pontos) {
  for (const l of levels) {
    if (pontos < l.min) return l;
  }
  return null;
}

function progresso(pontos) {
  const atual = nivelAtual(pontos);
  const prox = proximoNivel(pontos);
  if (!prox) return 100;
  const inicio = atual.min;
  const fim = prox.min;
  return Math.min(100, Math.round(((pontos - inicio) / (fim - inicio)) * 100));
}

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));

export default function FidelidadeModal({
  pontos,
  totalPedidos,
  totalGasto,
  onClose,
  empresaId,
  onResgateSuccess,
}) {
  const { carrinho, carregarCarrinho, restauranteSlug } = useCarrinho();
  const nivel = nivelAtual(pontos || 0);
  const prox = proximoNivel(pontos || 0);
  const pct = progresso(pontos || 0);
  const [recompensas, setRecompensas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [recompensaSelecionada, setRecompensaSelecionada] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const carregarRecompensas = async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";

      if (!API_URL) {
        throw new Error("API_URL nao configurada");
      }

      const response = await fetch(
        `${API_URL}/restaurantes/${empresaId}/recompensas-fidelidade/disponiveis/${pontos}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setRecompensas([]);
          return;
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRecompensas(data);
    } catch (err) {
      console.error("Erro ao carregar recompensas:", err);
      setMensagem("Nao foi possivel carregar as recompensas agora.");
      setRecompensas([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (empresaId && pontos > 0) {
      carregarRecompensas();
    }
  }, [empresaId, pontos]);

  const resgatarRecompensa = async (recompensa) => {
    if (!empresaId) return;
    if (pontos < recompensa.valorPontos) {
      setMensagem("Pontos insuficientes para esta recompensa");
      return;
    }
    if (!confirm(`Resgatar "${recompensa.nome}" por ${recompensa.valorPontos} pontos?`)) return;

    setCarregando(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Voce precisa estar logado para resgatar");
      }

      if (!API_URL) {
        throw new Error("API_URL nao configurada");
      }

      const response = await fetch(
        `${API_URL}/restaurantes/${empresaId}/recompensas-fidelidade/${recompensa.id}/resgatar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const codigoCupom = data?.codigoCupom;
      const cupomAplicadoNoCarrinho = Boolean(data?.cupomAplicadoNoCarrinho);

      if (codigoCupom && restauranteSlug) {
        if (cupomAplicadoNoCarrinho) {
          localStorage.removeItem(PENDING_LOYALTY_COUPON_KEY(restauranteSlug));
        } else {
          localStorage.setItem(
            PENDING_LOYALTY_COUPON_KEY(restauranteSlug),
            JSON.stringify({
              codigo: codigoCupom,
              recompensaId: recompensa.id,
              recompensaNome: recompensa.nome,
              criadoEm: new Date().toISOString(),
            })
          );
        }
      }

      if (cupomAplicadoNoCarrinho) {
        await carregarCarrinho();
      }

      const mensagemSucesso = cupomAplicadoNoCarrinho
        ? data?.mensagem || `Recompensa "${recompensa.nome}" aplicada no carrinho!`
        : codigoCupom
          ? `Recompensa resgatada! Seu cupom ${codigoCupom} sera aplicado no carrinho.`
          : data?.mensagem || `Recompensa "${recompensa.nome}" resgatada com sucesso!`;

      setMensagem(mensagemSucesso);
      setRecompensaSelecionada(recompensa);
      onResgateSuccess?.();
      await carregarRecompensas();
    } catch (err) {
      console.error("Erro ao resgatar recompensa:", err);
      setMensagem("Erro ao resgatar recompensa: " + err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 inset-x-0 z-50 max-h-[90vh] overflow-hidden rounded-t-[2rem] bg-zinc-50 md:mx-auto md:max-w-lg md:rounded-[2rem]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-5 pb-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900">Programa Fidelidade</h2>
                  <p className="text-xs text-zinc-500">Ganhe 1 ponto a cada pedido</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-4 pb-24 pt-5">
            <div className={`rounded-3xl border ${nivel.border} ${nivel.bgSoft} p-6 text-center`}>
              <div className={`inline-flex items-center gap-2 rounded-full ${nivel.bg} px-4 py-1.5`}>
                <Trophy className="h-4 w-4 text-white" />
                <span className="text-sm font-black text-white">{nivel.nome}</span>
              </div>
              <p className="mt-4 text-5xl font-black text-zinc-900">{pontos || 0}</p>
              <p className="text-sm text-zinc-500">ponto{pontos !== 1 ? "s" : ""} acumulados</p>

              {prox ? (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-600">
                      Faltam {prox.min - (pontos || 0)} para {prox.nome}
                    </span>
                    <span className="font-bold text-zinc-400">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${nivel.bg}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-purple-600">
                  <Trophy className="h-4 w-4" />
                  Nivel maximo atingido!
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <Gift className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-lg font-black text-zinc-900">{totalPedidos}</p>
                <p className="text-xs text-zinc-500">pedidos</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <Sparkles className="mx-auto mb-2 h-5 w-5 text-zinc-400" />
                <p className="text-lg font-black text-zinc-900">{formatBRL(totalGasto)}</p>
                <p className="text-xs text-zinc-500">total gasto</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-700">
                <Award className="h-4 w-4" />
                Tabela de niveis
              </h3>
              <div className="space-y-2">
                {levels.map((l) => {
                  const ativo = nivel === l;
                  return (
                    <div
                      key={l.nome}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                        ativo ? `${l.bgSoft} ${l.border} shadow-sm` : "border-zinc-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${l.bg}`} />
                        <span className={`text-sm font-bold ${ativo ? l.cor : "text-zinc-600"}`}>
                          {l.nome}
                        </span>
                        {ativo && (
                          <span className={`rounded-full ${l.bg} px-2 py-0.5 text-[10px] font-black text-white`}>
                            Atual
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500">
                        {l.min === 0 ? "Inicio" : `${l.min} pedidos`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {pontos > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-700">
                  <Gift className="h-4 w-4" />
                  Recompensas Disponiveis ({pontos} pontos)
                </h3>
                {mensagem && (
                  <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                    {mensagem}
                  </div>
                )}
                {!mensagem && carrinho?.cupom?.codigo && (
                  <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                    Cupom ativo no carrinho: {carrinho.cupom.codigo}
                  </div>
                )}
                {carregando ? (
                  <div className="flex items-center justify-center py-8 text-zinc-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                    <span className="ml-2 text-sm">Carregando recompensas...</span>
                  </div>
                ) : recompensas.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                    <p className="text-sm font-bold text-zinc-700">Nenhuma recompensa disponivel</p>
                    <p className="text-xs text-zinc-500">
                      {pontos < 5
                        ? "Acumule mais pontos para desbloquear recompensas"
                        : "Nenhuma recompensa configurada para seus pontos"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recompensas.map((recompensa) => (
                      <div
                        key={recompensa.id}
                        className={`rounded-xl border p-4 transition ${
                          recompensaSelecionada?.id === recompensa.id
                            ? "border-amber-300 bg-amber-50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  recompensaSelecionada?.id === recompensa.id ? "bg-amber-100" : "bg-zinc-100"
                                }`}
                              >
                                {recompensa.tipo === "DESCONTO_PERCENTUAL" && (
                                  <Percent className="h-5 w-5 text-amber-600" />
                                )}
                                {recompensa.tipo === "DESCONTO_VALOR_FIXO" && (
                                  <DollarSign className="h-5 w-5 text-emerald-600" />
                                )}
                                {recompensa.tipo === "PRODUTO_GRATIS" && (
                                  <Package className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-900">{recompensa.nome}</p>
                                <p className="text-xs text-zinc-500">{recompensa.descricao}</p>
                                <div className="mt-1 flex items-center gap-3">
                                  <span className="flex items-center gap-1 text-xs text-amber-600">
                                    <Star className="h-3 w-3" />
                                    {recompensa.valorPontos} pontos
                                  </span>
                                  {recompensa.estoque > 0 && (
                                    <span className="text-xs text-zinc-400">
                                      {recompensa.estoqueUtilizado || 0}/{recompensa.estoque} disponiveis
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {recompensa.tipo === "DESCONTO_PERCENTUAL" && (
                              <div className="mt-2 text-sm text-zinc-700">
                                <span className="font-semibold">Desconto:</span> {recompensa.descontoPercentual}% em qualquer pedido
                              </div>
                            )}
                            {recompensa.tipo === "DESCONTO_VALOR_FIXO" && (
                              <div className="mt-2 text-sm text-zinc-700">
                                <span className="font-semibold">Desconto:</span> R$ {recompensa.descontoValorFixo} no proximo pedido
                              </div>
                            )}
                            {recompensa.tipo === "PRODUTO_GRATIS" && (
                              <div className="mt-2 text-sm text-zinc-700">
                                <span className="font-semibold">Produto:</span> {recompensa.produtoNome || `ID ${recompensa.produtoId}`}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => resgatarRecompensa(recompensa)}
                            disabled={carregando || pontos < recompensa.valorPontos}
                            className={`ml-4 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold ${
                              pontos >= recompensa.valorPontos
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : "bg-zinc-100 text-zinc-400"
                            } disabled:opacity-50`}
                          >
                            {carregando && recompensaSelecionada?.id === recompensa.id ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                                Resgatando...
                              </>
                            ) : (
                              <>
                                <Zap className="h-3 w-3" />
                                Resgatar
                              </>
                            )}
                          </button>
                        </div>
                        {recompensaSelecionada?.id === recompensa.id && (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-center text-xs text-emerald-700">
                            <Check className="mx-auto mb-1 h-4 w-4" />
                            Recompensa resgatada! Use no proximo pedido.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-xs text-zinc-500">
                  Escolha uma recompensa e resgate usando seus pontos acumulados.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
