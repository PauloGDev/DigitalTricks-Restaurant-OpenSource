import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import EditarPedidoModal from "./pedidos/EditarPedidoModal";
import StatusChangeModal from "./pedidos/StatusChangeModal";
import KanbanPedidos from "./pedidos/KanbanPedidos";
import TabelaPedidos from "./pedidos/TabelaPedidos";

const STATUS_LABELS = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
  RECEBIDO: "Recebido",
  EM_PREPARO: "Em Preparo",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para Entrega",
  ENTREGUE: "Entregue",
  RETIRADO: "Retirado",
  AGUARDANDO_RETIRADA: "Aguardando Retirada",
  CANCELADO: "Cancelado",
};

// Status válidos diretamente por coluna
const DIRECT_TRANSITIONS = {
  AGUARDANDO_PAGAMENTO: ["RECEBIDO", "CANCELADO"],
  RECEBIDO: ["EM_PREPARO", "CANCELADO"],
  EM_PREPARO: ["PRONTO", "CANCELADO"],
  PRONTO: ["SAIU_PARA_ENTREGA", "ENTREGUE", "RETIRADO"],
  SAIU_PARA_ENTREGA: ["ENTREGUE"],
  AGUARDANDO_RETIRADA: ["RETIRADO"],
};

function isDirectTransition(statusAtual, novoStatus) {
  const validos = DIRECT_TRANSITIONS[statusAtual] || [];
  return validos.includes(novoStatus);
}

export default function GerenciarPedidos({ refreshKey = 0 }) {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoEdit, setPedidoEdit] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [modo, setModo] = useState("KANBAN");

  // Status change modal
  const [statusModal, setStatusModal] = useState(null); // { pedido, novoStatus }
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const carregarPedidos = useCallback(async (nextPage = 0, append = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/pedidos/admin?page=${nextPage}&size=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Erro backend:", await res.text());
        setPedidos([]);
        return;
      }

      const data = await res.json();
      const content = data?.content || [];

      setHasMore(!data?.last);
      setPedidos((prev) => (append ? [...prev, ...content] : content));
      setPage(nextPage);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const salvarPedido = useCallback(
    async (pedidoBase, overrides = {}) => {
      const token = localStorage.getItem("token");

      const origem = overrides.id
        ? pedidos.find((p) => p.id === overrides.id) || pedidoBase
        : pedidoBase;

      const merged = { ...origem, ...overrides };

      const itens = (merged.itens || []).map((it) => ({
        nomeProduto: it.nome ?? it.nomeProduto,
        quantidade: Number(it.quantidade),
        precoUnitario: Number(it.precoUnitario ?? it.preco ?? 0),
      }));

      const total = itens.reduce(
        (acc, it) => acc + Number(it.precoUnitario || 0) * Number(it.quantidade || 1),
        0
      );

      const payload = {
        usuario: merged.usuario ? { id: merged.usuario.id } : null,
        itens,
        total,
        status: merged.status,
        enderecoEntrega: merged.enderecoEntrega ? { id: merged.enderecoEntrega.id } : null,
        nomeCompleto: merged.nomeCompleto,
        cpf: merged.cpf,
        telefone: merged.telefone,
        email: merged.email,
        linkRastreio: merged.linkRastreio || "",
      };

      const res = await fetch(`${API_URL}/pedidos/${merged.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(await res.text());
        throw new Error("Erro ao atualizar pedido");
      }

      setPedidos((prev) =>
        prev.map((pedido) =>
          pedido.id === merged.id
            ? { ...pedido, ...merged, itens, total }
            : pedido
        )
      );
    },
    [API_URL, pedidos]
  );

  const atualizarPedido = async () => {
    try {
      await salvarPedido(pedidoEdit, { ...form, id: pedidoEdit.id });
      setPedidoEdit(null);
    } catch (error) {
      console.error("Erro ao atualizar pedido", error);
    }
  };

  // ── Status change via modal / direct API ──
  const iniciarMudancaStatus = (pedido, novoStatus) => {
    setStatusModal({ pedido, novoStatus });
    setStatusError(null);
  };

  const confirmarMudancaStatus = async (novoStatus) => {
    if (!statusModal) return;
    const { pedido } = statusModal;
    setStatusLoading(true);
    setStatusError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/pedidos/admin/${pedido.id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ novoStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.sucesso) {
        setStatusError(data.erro || "Erro ao mover pedido");
        toast.error(data.erro || `Pedido não pode ser movido para ${STATUS_LABELS[novoStatus]}`);
        return;
      }

      // Atualiza local
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedido.id ? { ...p, status: novoStatus } : p))
      );

      toast.success(data.mensagem || `Pedido movido para ${STATUS_LABELS[novoStatus]}`);
      setStatusModal(null);
    } catch (e) {
      setStatusError("Erro de conexão");
      toast.error(`Erro ao mover pedido: ${e.message}`);
    } finally {
      setStatusLoading(false);
    }
  };

  const cancelarMudancaStatus = () => {
    setStatusModal(null);
    setStatusLoading(false);
    setStatusError(null);
  };

  // Wrapper para o Kanban
  const moverPedido = async (pedido, nextStatus) => {
    if (!pedido?.status || !nextStatus) return;

    // Se é transição direta, muda sem confirmacao
    if (isDirectTransition(pedido.status, nextStatus)) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/pedidos/admin/${pedido.id}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ novoStatus: nextStatus }),
        });
        const data = await res.json();

        if (!res.ok || !data.sucesso) {
          toast.error(data.erro || `Pedido não pode ser movido para ${STATUS_LABELS[nextStatus]}`);
          return;
        }

        setPedidos((prev) =>
          prev.map((p) => (p.id === pedido.id ? { ...p, status: nextStatus } : p))
        );
        toast.success(data.mensagem);
      } catch (e) {
        toast.error("Erro ao mover pedido");
      }
    } else {
      // Precisa passar por etapas → mostra modal
      iniciarMudancaStatus(pedido, nextStatus);
    }
  };

  useEffect(() => {
    if (modo === "KANBAN") {
      carregarPedidos(0, false);
    }
  }, [modo, refreshKey, carregarPedidos]);

  const pedidosAtivos = (pedidos || []).filter((p) => !["CANCELADO"].includes(p.status));
  const pedidosHistorico = pedidos;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-zinc-900">Painel de pedidos</h2>
          <p className="text-sm text-zinc-500">
            Arraste os pedidos entre as colunas para atualizar o status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => carregarPedidos(0, false)}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-extrabold text-zinc-800 transition hover:bg-zinc-50"
        >
          Atualizar
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setModo("KANBAN")}
          className={`px-4 py-2 rounded-xl font-bold ${
            modo === "KANBAN" ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Operação
        </button>

        <button
          onClick={() => setModo("HISTORICO")}
          className={`px-4 py-2 rounded-xl font-bold ${
            modo === "HISTORICO" ? "bg-red-600 text-white" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Histórico
        </button>

        <button
          type="button"
          onClick={() => window.open("/dashboard/tv", "_blank", "noopener,noreferrer")}
          className="px-4 py-2 rounded-xl bg-zinc-900 text-white font-bold"
        >
          Abrir TV da cozinha
        </button>
      </div>

      {modo === "KANBAN" ? (
        <KanbanPedidos
          pedidos={pedidosAtivos}
          loading={loading}
          setPedidoEdit={setPedidoEdit}
          setForm={setForm}
          onMovePedido={moverPedido}
        />
      ) : (
        <TabelaPedidos
          pedidos={pedidosHistorico}
          loading={loading}
          setPedidoEdit={setPedidoEdit}
          setForm={setForm}
          onAction={(action, pedido) => {
            const map = {
              mark_preparing: "EM_PREPARO",
              mark_ready: "PRONTO",
              assign_delivery: "SAIU_PARA_ENTREGA",
              cancel: "CANCELADO",
            };
            if (map[action]) moverPedido(pedido, map[action]);
          }}
        />
      )}

      {modo === "HISTORICO" && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              carregarPedidos(page + 1, true);
            }}
            className="px-6 py-3 rounded-2xl bg-zinc-900 text-white font-bold hover:bg-zinc-800"
          >
            Carregar mais pedidos
          </button>
        </div>
      )}

      <EditarPedidoModal
        pedidoEdit={pedidoEdit}
        setPedidoEdit={setPedidoEdit}
        form={form}
        setForm={setForm}
        atualizarPedido={atualizarPedido}
      />

      {statusModal && (
        <StatusChangeModal
          pedido={statusModal.pedido}
          novoStatus={statusModal.novoStatus}
          isDark={false}
          loading={statusLoading}
          error={statusError}
          onClose={cancelarMudancaStatus}
          onConfirm={confirmarMudancaStatus}
        />
      )}
    </div>
  );
}