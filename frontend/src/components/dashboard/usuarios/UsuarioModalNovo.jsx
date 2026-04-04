import { motion } from "framer-motion";
import { X, UserPlus, Shield, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

const UsuarioModalNovo = ({
  novoUsuario,
  setNovoUsuario,
  onClose,
  onCreate,
  isDark = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleCreate = async () => {
    if (!novoUsuario.usuarioId) {
      setErro("Informe o ID do usuário");
      return;
    }

    try {
      setErro("");
      setLoading(true);
      await onCreate();
    } catch (e) {
      setErro("Erro ao vincular usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 backdrop-blur-sm ${
          isDark ? "bg-black/70" : "bg-black/40"
        }`}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <motion.div
          className={`w-full max-w-lg rounded-3xl border shadow-2xl ${
            isDark
              ? "border-white/10 bg-[#121212] text-white"
              : "border-zinc-200 bg-white"
          }`}
        >
          {/* HEADER */}
          <div className="flex justify-between p-5 border-b border-white/10">
            <div className="flex gap-3 items-center">
              <UserPlus className="text-red-500" />
              <div>
                <h3 className="font-bold">Vincular usuário</h3>
                <p className="text-xs opacity-60">
                  Adicione um usuário à empresa
                </p>
              </div>
            </div>

            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* BODY */}
          <div className="p-5 space-y-4">
            {/* ERRO */}
            {erro && (
              <div className="flex items-center gap-2 text-sm bg-red-500/10 text-red-400 p-3 rounded-xl">
                <AlertCircle size={16} />
                {erro}
              </div>
            )}

            {/* INPUT */}
            <div>
              <label className="text-xs font-bold opacity-70">
                ID do usuário
              </label>

              <input
                type="number"
                value={novoUsuario.usuarioId}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    usuarioId: e.target.value,
                  })
                }
                className="w-full mt-2 h-11 px-3 rounded-xl border bg-transparent"
                placeholder="Digite o ID do usuário"
              />
            </div>

            {/* SELECT */}
            <div>
              <label className="text-xs font-bold opacity-70">
                Papel
              </label>

              <select
                value={novoUsuario.papel}
                onChange={(e) =>
                  setNovoUsuario({
                    ...novoUsuario,
                    papel: e.target.value,
                  })
                }
                className="w-full mt-2 h-11 px-3 rounded-xl border bg-transparent"
              >
                <option value="GERENTE">Gerente</option>
                <option value="ATENDENTE">Atendente</option>
              </select>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex justify-end gap-2 p-5 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2">
              Cancelar
            </button>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-5 py-2 bg-red-500 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? "Vinculando..." : "Vincular"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UsuarioModalNovo;