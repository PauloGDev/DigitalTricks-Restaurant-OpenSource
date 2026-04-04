export default function ClientPanelContent({
  perfil,
  pedidos,
  actions,
}) {
  return (
    <div className="space-y-4">

      <div className="bg-white p-5 rounded-2xl">
        <h3>Seus pedidos</h3>

        {pedidos.map((p) => (
          <div key={p.id}>
            Pedido #{p.id}
          </div>
        ))}
      </div>

      <button onClick={actions.goPedidos}>
        Ver todos pedidos
      </button>

    </div>
  );
}