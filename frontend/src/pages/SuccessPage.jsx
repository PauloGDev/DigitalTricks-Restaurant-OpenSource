// src/pages/SuccessPage.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTitle from "../context/PageTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="py-20 text-center text-gray-200">
      <PageTitle title="Pagamento Concluído | Sublime Perfumes" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="max-w-lg mx-auto bg-gradient-to-br from-black to-gray-900 p-10 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">
          ✅ Pagamento Aprovado!
        </h1>
        <p className="mb-6 text-gray-300">
          Seu pedido foi confirmado e logo estará a caminho.  
          Você receberá um e-mail com os detalhes.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
        >
          Voltar à Loja
        </button>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
