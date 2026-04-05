import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const onlyNumbers = (value) => String(value || "").replace(/\D/g, "");

const toNumber = (value) => {
  const n =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : Number(value);

  return Number.isFinite(n) ? n : 0;
};

export default function usePagamentoHandler({
  API_URL,
  carrinho,
  total,
  freteInfo,
  tipoEntrega = "DELIVERY",
  empresaId,
  enderecoEntrega,
  usuarioData = {},
  cpf,
  telefone,
  showNotification,
  limparCarrinho,
  setPagando,
  restauranteSlug,
}) {
  const navigate = useNavigate();

  const montarPayloadPedido = useCallback(
  ({
    tipoEntrega: tipo,
    tipoPagamento,
    metodoPagamentoEntrega = null,
    trocoPara = null,
    precisaTroco = false,
  }) => {
    return {
      tipoEntrega: tipo,

      enderecoId:
        tipo === "DELIVERY" ? enderecoEntrega?.id : null,

      frete:
        tipo === "DELIVERY"
          ? {
              valor: Number(freteInfo?.valor || 0),
              prazo: freteInfo?.prazo || null,
              servico: freteInfo?.servico || "Entrega",
            }
          : null,

      itens: (carrinho?.itens || []).map((item) => ({
  produtoId: item.produtoId,
  variacaoId: item.variacaoId || null,
  quantidade: item.quantidade,

  opcionais: (item.opcionais || []).map((grupo) => ({
    grupoId: grupo.grupoId,
    itensIds: grupo.itens?.map((i) => i.id) || [],
  })),

  observacao: item.observacao || null,
})),

      cpf: cpf || null,

      pagamentoNaEntrega:
        tipoPagamento === "PAY_ON_DELIVERY"
          ? {
              metodo: metodoPagamentoEntrega,
              precisaTroco,
              trocoPara,
            }
          : null,

      empresaId,
    };
  },
  [carrinho, enderecoEntrega, freteInfo, empresaId, tipoEntrega]
);

  const limparCarrinhoComSeguranca = useCallback(async () => {
    try {
      await limparCarrinho?.();
    } catch (error) {
      console.error("Pedido criado, mas houve erro ao limpar o carrinho:", error);
    }
  }, [limparCarrinho]);

  const finalizarPedido = useCallback(
    async ({
      formaPagamento,
      tipoPagamento,
      metodoPagamentoEntrega = null,
      observacoes = "",
      trocoPara = null,
      precisaTroco = false,
    }) => {
      try {
        setPagando?.(true);

        if (!restauranteSlug) {
          showNotification?.("Restaurante não identificado.", "error");
          return { ok: false };
        }

        if (tipoEntrega !== "RETIRADA" && !enderecoEntrega?.id) {
          showNotification?.("Selecione um endereço de entrega.", "error");
          return { ok: false };
        }

        const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];
        if (itens.length === 0) {
          showNotification?.("Seu carrinho está vazio.", "error");
          return { ok: false };
        }

        const payload = montarPayloadPedido({
          tipoEntrega,
          formaPagamento,
          tipoPagamento,
          metodoPagamentoEntrega,
          observacoes,
          trocoPara,
          precisaTroco,
        });

        const token = localStorage.getItem("token");
        console.log("TOKEN PEDIDO:", token);

        const response = await fetch(
        `${API_URL}/restaurantes/${restauranteSlug}/pedidos`,
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        }
        );

        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : await response.text().catch(() => "");

        if (!response.ok) {
          console.error("Erro backend criar pedido:", data);

          const message =
            (typeof data === "object" &&
              (data?.message || data?.mensagem || data?.erro || data?.error)) ||
            (typeof data === "string" && data) ||
            "Não foi possível finalizar o pedido.";

          throw new Error(message);
        }

        await limparCarrinhoComSeguranca();

        const pedidoId =
          (typeof data === "object" && (data?.id || data?.pedidoId || data?.pedido?.id)) ||
          null;

        const statusPedido =
          (typeof data === "object" && (data?.status || data?.pedido?.status)) ||
          null;

        showNotification?.("Pedido criado com sucesso!", "success");

        navigate(`/restaurante/${restauranteSlug}/pedido-sucesso`, {
          replace: true,
          state: {
            pedidoId,
            status: statusPedido,
            pedido: data,
          },
        });

        return {
          ok: true,
          pedidoId,
          status: statusPedido,
          data,
        };
      } catch (error) {
        console.error("Erro ao finalizar pedido:", error);
        showNotification?.(
          error?.message || "Erro ao finalizar pedido.",
          "error"
        );

        return {
          ok: false,
          error,
        };
      } finally {
        setPagando?.(false);
      }
    },
    [
      API_URL,
      carrinho?.itens,
      tipoEntrega,
      enderecoEntrega?.id,
      montarPayloadPedido,
      restauranteSlug,
      showNotification,
      limparCarrinhoComSeguranca,
      navigate,
      setPagando,
    ]
  );

  const criarPedidoPix = useCallback(
    async (extra = {}) =>
      finalizarPedido({
        formaPagamento: "ONLINE",
        tipoPagamento: "PIX",
        ...extra,
      }),
    [finalizarPedido]
  );

  const criarPedidoCartao = useCallback(
    async (extra = {}) =>
      finalizarPedido({
        formaPagamento: "ONLINE",
        tipoPagamento: "CREDIT_CARD",
        ...extra,
      }),
    [finalizarPedido]
  );

  const criarPedidoNaEntrega = useCallback(
    async ({
      metodo = "CASH",
      trocoPara = null,
      precisaTroco = false,
      observacoes = "",
    } = {}) =>
      finalizarPedido({
        formaPagamento: "PAY_ON_DELIVERY",
        tipoPagamento: "PAY_ON_DELIVERY",
        metodoPagamentoEntrega: metodo,
        trocoPara,
        precisaTroco,
        observacoes,
      }),
    [finalizarPedido]
  );

  return {
    finalizarPedido,
    criarPedidoPix,
    criarPedidoCartao,
    criarPedidoNaEntrega,
  };
}