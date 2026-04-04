import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PedidoSucessoPage() {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchPedido = async () => {
    try {
      const token = localStorage.getItem("token"); // JWT armazenado
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuario = await userRes.json();

      const pedidoRes = await fetch(`${import.meta.env.VITE_API_URL}/pedidos/public/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!pedidoRes.ok) throw new Error("Pedido não encontrado");

      const pedidoData = await pedidoRes.json();

      // 🔒 Verifica se o pedido pertence ao usuário logado
      if (pedidoData.usuario?.id !== usuario.id) {
        setPedido(null);
        return;
      }

      setPedido(pedidoData);
    } catch (err) {
      console.error("Erro ao buscar pedido:", err);
      setPedido(null);
    } finally {
      setLoading(false);
    }
  };

  fetchPedido();
}, [pedidoId]);

  if (loading) {
    return (
      <div className="pt-20 flex items-center justify-center h-screen text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg"
        >
          Carregando dados do pedido...
        </motion.div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="pt-20 flex flex-col items-center justify-center h-screen text-white text-center">
        <p className="text-xl mb-4">❌ Pedido não encontrado.</p>
        <Link to="/" className="text-blue-400 underline">Voltar à loja</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-6 max-w-3xl mx-auto text-white">

      {/* ✅ Check animado */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="#22c55e"
          className="w-20 h-20 mb-4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </motion.svg>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold text-green-400"
        >
          Pagamento confirmado!
        </motion.h1>
        <p className="text-gray-400 mt-2 text-sm">
          Obrigado por comprar conosco 🎉
        </p>
      </motion.div>

      {/* 📦 Detalhes do pedido */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-zinc-900 p-6 rounded-2xl shadow-xl"
      >
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <p className="text-lg font-semibold text-green-400">Pedido #{pedido.id}</p>
          <p className="text-sm text-gray-400">
            Data: {new Date(pedido.data).toLocaleDateString("pt-BR")}
          </p>
          <p className="text-sm text-gray-400">
            Total: <span className="text-white font-medium">
              R$ {pedido.total.toFixed(2)}
            </span>
          </p>
        </div>

        {/* Itens */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Itens do pedido</h2>
          <div className="space-y-3">
            {pedido.itens.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-zinc-800 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imagemUrl}
                    alt={item.nomeProduto}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="text-left">
                    <p className="font-medium">{item.nomeProduto}</p>
                    <p className="text-sm text-gray-400">Qtd: {item.quantidade}</p>
                  </div>
                </div>
                <p className="font-semibold">
                  R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Endereço */}
        {pedido.endereco && (
          <div className="border-t border-zinc-800 pt-4">
            <h2 className="text-xl font-semibold mb-2">Endereço de entrega</h2>
            <p className="text-gray-300">
              {pedido.endereco.logradouro}, {pedido.endereco.numero}
            </p>
            <p className="text-gray-400 text-sm">
              {pedido.endereco.bairro} - {pedido.endereco.cidade}/{pedido.endereco.estado}
            </p>
            <p className="text-gray-400 text-sm">CEP: {pedido.endereco.cep}</p>
          </div>
        )}
      </motion.div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-block bg-green-500 text-black font-semibold px-6 py-3 rounded-lg hover:bg-green-400 transition"
        >
          Voltar à loja
        </Link>
      </div>
    </div>
  );
}
