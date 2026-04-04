import { motion, AnimatePresence } from "framer-motion";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Excluir Produto",
  message = "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.",
  isReativando = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 p-6 rounded-2xl w-[400px] text-white shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* 🔹 Título dinâmico */}
            <h3
              className={`text-lg font-semibold mb-4 ${
                isReativando ? "text-blue-400" : "text-red-400"
              }`}
            >
              {title}
            </h3>

            {/* 🔹 Mensagem */}
            <p className="text-gray-300 mb-6">{message}</p>

            {/* 🔹 Botões */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded font-medium transition ${
                  isReativando
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {isReativando ? "Reativar" : "Desativar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
