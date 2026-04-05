import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { Check, Copy, QrCode } from "lucide-react";
import CartaoBrickModal from "./CartaoBrickModal";
import PaymentAndDeliverySelector from "./PaymentAndDeliverySelector";

export default function FinalizarCompra({
  empresaId,
  enderecoId,
  carrinho,
  enderecoEntrega,
  freteInfo,
  slug
}) {
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [tipoEntrega, setTipoEntrega] = useState("DELIVERY");
  const [tipoPagamento, setTipoPagamento] = useState(null);

  const [payOnMethod, setPayOnMethod] = useState(null);
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [trocoPara, setTrocoPara] = useState("");

  const [pedidoCriado, setPedidoCriado] = useState(false);
  const [pedidoId, setPedidoId] = useState(null);

  const [loadingPedido, setLoadingPedido] = useState(false);
  const [loadingPix, setLoadingPix] = useState(false);

  const [pixInfo, setPixInfo] = useState(null);
  const [showCartaoModal, setShowCartaoModal] = useState(false);

  const getToken = () => localStorage.getItem("token");
  const PEDIDOS_API = `${import.meta.env.VITE_API_URL}/restaurantes/${slug}/pedidos`;

  const trocoNumber = useMemo(() => {
    if (!precisaTroco) return null;
    const n = Number(String(trocoPara).trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }, [precisaTroco, trocoPara]);

  const normalizarMetodoPagamentoNaEntrega = (method) => {
    switch (method) {
      case "DEBIT":
      case "DEBIT_CARD":
        return "DEBIT_CARD";
      case "CREDIT":
      case "CREDIT_CARD":
        return "CREDIT_CARD";
      case "CASH":
        return "CASH";
      default:
        return null;
    }
  };

  const normalizarOpcionaisItem = (item) => {
    return (item?.opcionais || [])
      .map((grupo) => {
        const grupoId = grupo?.grupoId ?? grupo?.id ?? null;

        const itens = (grupo?.itens || [])
          .map((op) => ({
            itemId: op?.itemId ?? op?.id ?? op?.opcionalItemId ?? null,
            quantidade:
              Number.isFinite(Number(op?.quantidade)) && Number(op?.quantidade) > 0
                ? Number(op.quantidade)
                : 1,
          }))
          .filter((op) => op.itemId !== null);

        if (!grupoId || itens.length === 0) return null;

        return {
          grupoId,
          itens,
          tipoGrupo: grupo?.tipoGrupo ?? null,
        };
      })
      .filter(Boolean);
  };

  const validarAntesDeCriar = () => {
    if (!empresaId) {
      showNotification("Empresa não identificada.", "error");
      return false;
    }

    if (!carrinho?.itens?.length) {
      showNotification("Seu carrinho está vazio.", "error");
      return false;
    }

    if (tipoEntrega === "DELIVERY" && !enderecoId) {
      showNotification("Selecione um endereço para entrega.", "error");
      return false;
    }

    if (tipoEntrega === "DELIVERY" && !freteInfo) {
      showNotification("Não foi possível calcular o frete.", "error");
      return false;
    }

    if (!tipoPagamento) {
      showNotification("Selecione uma forma de pagamento.", "error");
      return false;
    }

    if (tipoPagamento === "PAY_ON_DELIVERY") {
      if (!payOnMethod) {
        showNotification("Selecione débito, crédito ou dinheiro.", "error");
        return false;
      }

      if (!normalizarMetodoPagamentoNaEntrega(payOnMethod)) {
        showNotification("Forma de pagamento na entrega inválida.", "error");
        return false;
      }

      if (normalizarMetodoPagamentoNaEntrega(payOnMethod) === "CASH" && precisaTroco) {
        if (trocoNumber === null || trocoNumber <= 0) {
          showNotification("Informe um valor válido para troco.", "error");
          return false;
        }
      }
    }

    const itensInvalidos = (carrinho?.itens || []).some((item) => {
      if (!item?.produtoId) return true;
      if (!item?.quantidade || Number(item.quantidade) <= 0) return true;
      return false;
    });

    if (itensInvalidos) {
      showNotification("Há itens inválidos no carrinho.", "error");
      return false;
    }

    return true;
  };

  const buildPedidoPayload = () => {
    const metodoEntrega = normalizarMetodoPagamentoNaEntrega(payOnMethod);

    return {
      empresaId,
      tipoEntrega,
      enderecoId: tipoEntrega === "DELIVERY" ? enderecoId : null,
      frete:
        tipoEntrega === "DELIVERY"
          ? {
              servico: freteInfo?.servico || "Entrega padrão",
              valor: Number(freteInfo?.valor || 0),
              prazo: freteInfo?.prazo || null,
            }
          : null,
      itens: (carrinho?.itens || []).map((item) => ({
        produtoId: item.produtoId,
        variacaoId: item.variacaoId ?? null,
        quantidade: Number(item.quantidade),
        observacao: item.observacao ?? null,
        opcionais: normalizarOpcionaisItem(item),
      })),
      tipoPagamento,
      pagamentoNaEntrega:
        tipoPagamento === "PAY_ON_DELIVERY"
          ? {
              metodo: metodoEntrega,
              precisaTroco: metodoEntrega === "CASH" ? !!precisaTroco : false,
              trocoPara: metodoEntrega === "CASH" && precisaTroco ? trocoNumber : null,
            }
          : null,
    };
  };

  const irParaPedidoFeito = ({ id, totalPedido, statusPedido, pix = null }) => {
    navigate("/pedido-feito", {
      state: {
        pedidoId: id,
        total: totalPedido,
        status: statusPedido || "AGUARDANDO_PAGAMENTO",
        pixInfo: pix,
        tipoPagamento,
        tipoEntrega,
        enderecoEntrega: tipoEntrega === "DELIVERY" ? enderecoEntrega : null,
      },
    });
  };

  const gerarPix = async (id, totalPedido, statusPedido) => {
    try {
      setLoadingPix(true);
      setPixInfo(null);

      const token = getToken();
      if (!token) {
        showNotification("Sessão expirada. Faça login novamente.", "error");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/pagamentos/${id}/pix`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let errorMessage = "Erro ao gerar PIX";

        if (contentType.includes("application/json")) {
          const errJson = await res.json().catch(() => null);
          errorMessage =
            errJson?.message ||
            errJson?.erro ||
            errJson?.error ||
            errJson?.mensagem ||
            errorMessage;
        } else {
          const text = await res.text().catch(() => "");
          errorMessage = text || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();
      setPixInfo(data);
      showNotification("PIX gerado com sucesso!", "success");

      irParaPedidoFeito({
        id,
        totalPedido,
        statusPedido,
        pix: data,
      });
    } catch (error) {
      showNotification(error.message || "Erro ao gerar PIX", "error");
    } finally {
      setLoadingPix(false);
    }
  };

  const criarPedido = async () => {
    try {
      if (!validarAntesDeCriar()) return;

      const token = getToken();
      if (!token) {
        showNotification("Sessão expirada. Faça login novamente.", "error");
        return;
      }

      setLoadingPedido(true);

      const payload = buildPedidoPayload();

      const res = await fetch(PEDIDOS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let errorMessage = "Erro ao criar pedido";

        if (contentType.includes("application/json")) {
          const errJson = await res.json().catch(() => null);
          console.error("Erro backend /pedidos/criar:", errJson);
          errorMessage =
            errJson?.message ||
            errJson?.erro ||
            errJson?.error ||
            errJson?.mensagem ||
            errorMessage;
        } else {
          const text = await res.text().catch(() => "");
          console.error("Erro backend /pedidos/criar:", text);
          errorMessage = text || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await res.json();
      const id = data.id;
      const totalPedido = data.total ?? carrinho?.total ?? 0;
      const statusPedido = data.status ?? "AGUARDANDO_PAGAMENTO";

      setPedidoId(id);
      setPedidoCriado(true);
      showNotification("Pedido criado com sucesso!", "success");

      if (tipoPagamento === "PIX") {
        await gerarPix(id, totalPedido, statusPedido);
        return;
      }

      if (tipoPagamento === "CREDIT_CARD") {
        setShowCartaoModal(true);
        return;
      }

      irParaPedidoFeito({
        id,
        totalPedido,
        statusPedido,
      });
    } catch (error) {
      showNotification(error.message || "Erro ao finalizar compra", "error");
    } finally {
      setLoadingPedido(false);
    }
  };

  const copiarPix = async () => {
    try {
      if (!pixInfo?.pixPayload) {
        showNotification("Código PIX indisponível.", "error");
        return;
      }

      await navigator.clipboard.writeText(pixInfo.pixPayload);
      showNotification("Código PIX copiado!", "success");
    } catch {
      showNotification("Não foi possível copiar o código PIX.", "error");
    }
  };

  const payOnMethodLabel = (() => {
    const method = normalizarMetodoPagamentoNaEntrega(payOnMethod);

    if (method === "DEBIT_CARD") return "Débito";
    if (method === "CREDIT_CARD") return "Crédito";
    if (method === "CASH") {
      return `Dinheiro${precisaTroco ? ` (troco para ${trocoPara})` : ""}`;
    }
    return "—";
  })();

  return (
    <div className="mt-8 space-y-4">
      {!pedidoCriado ? (
        <>
          <PaymentAndDeliverySelector
            tipoEntrega={tipoEntrega}
            setTipoEntrega={setTipoEntrega}
            tipoPagamento={tipoPagamento}
            setTipoPagamento={setTipoPagamento}
            payOnMethod={payOnMethod}
            setPayOnMethod={setPayOnMethod}
            precisaTroco={precisaTroco}
            setPrecisaTroco={setPrecisaTroco}
            trocoPara={trocoPara}
            setTrocoPara={setTrocoPara}
            enderecoId={enderecoId}
          />

          <button
            onClick={criarPedido}
            disabled={loadingPedido || !tipoPagamento}
            className="w-full rounded-2xl bg-red-600 py-3 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingPedido ? "Finalizando..." : "Finalizar pedido"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Ao confirmar, seu pedido será criado e o pagamento seguirá conforme a
            opção escolhida.
          </p>
        </>
      ) : (
        <>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-center text-zinc-800">
            <div className="mb-1 flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              <p className="font-extrabold">Pedido criado</p>
            </div>
            <p className="text-sm">
              Pedido <strong>#{pedidoId}</strong>
            </p>
          </div>

          {tipoPagamento === "PIX" && (
            <div className="space-y-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 font-extrabold text-emerald-900">
                <QrCode className="h-5 w-5" />
                PIX
              </div>

              {loadingPix ? (
                <div className="text-sm text-emerald-900">Gerando PIX...</div>
              ) : null}

              {pixInfo?.pixQrCodeBase64 ? (
                <div className="flex justify-center rounded-2xl border border-emerald-200 bg-white p-3">
                  <img
                    alt="QR Code PIX"
                    className="h-auto w-full max-w-[220px]"
                    src={`data:image/png;base64,${pixInfo.pixQrCodeBase64}`}
                  />
                </div>
              ) : null}

              {pixInfo?.pixPayload ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-emerald-900">
                    Copia e cola:
                  </p>

                  <div className="break-all rounded-2xl border border-emerald-200 bg-white p-3 text-xs text-zinc-700">
                    {pixInfo.pixPayload}
                  </div>

                  <button
                    onClick={copiarPix}
                    className="mt-3 w-full rounded-2xl border border-emerald-200 bg-white py-2.5 font-extrabold text-emerald-800 transition hover:bg-zinc-50"
                  >
                    <Copy className="mr-2 inline h-4 w-4" />
                    Copiar código PIX
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {tipoPagamento === "CREDIT_CARD" && showCartaoModal && (
            <CartaoBrickModal
              empresaId={empresaId}
              onClose={() => setShowCartaoModal(false)}
              pedidoId={pedidoId}
              tokenJwt={getToken()}
            />
          )}

          {tipoPagamento === "PAY_ON_DELIVERY" ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-extrabold">Pagamento na entrega confirmado.</p>
              <p className="mt-1">
                Você pagará no recebimento: <strong>{payOnMethodLabel}</strong>
              </p>
            </div>
          ) : null}

          {tipoEntrega === "RETIRADA" ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              <p className="font-extrabold text-zinc-900">
                Retirada no estabelecimento
              </p>
              <p className="mt-1">
                Seu pedido ficará disponível para retirada assim que for
                confirmado ou preparado.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}