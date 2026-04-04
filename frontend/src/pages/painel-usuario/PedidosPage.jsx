import { useNavigate } from "react-router-dom";
import useMeusPedidos from "./useMeusPedidos";
import PedidosView from "./PedidosView";
import { useEffect } from "react";

export default function PedidosPage() {
  const navigate = useNavigate();

  const {
    pedidos,
    pedidosFiltrados,
    pedidosPaginados,
    loading,
    search,
    statusFilter,
    currentPage,
    totalPages,
    setSearch,
    setStatusFilter,
    setCurrentPage,
  } = useMeusPedidos({
    apiUrlRaw: import.meta.env.VITE_API_URL || "",
    itemsPerPage: 6,
  });

  return (
    <PedidosView
      pedidos={pedidos}
      pedidosFiltrados={pedidosFiltrados}
      pedidosPaginados={pedidosPaginados}
      loading={loading}
      search={search}
      statusFilter={statusFilter}
      currentPage={currentPage}
      totalPages={totalPages}
      onSearchChange={setSearch}
      onStatusChange={setStatusFilter}
      onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
      onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      onPay={(pedido) =>
        navigate("/checkout", {
          state: { total: pedido.total, pedidoId: pedido.id },
        })
      }
    />
  );
}