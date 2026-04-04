import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg("");
      const res = await fetch(
        `${API_URL}/auth/forgot-password?email=` + email,
        { method: "POST" }
      );
      if (!res.ok) throw new Error();
      setMsg("✅ Verifique seu email para redefinir a senha!");
    } catch {
      setMsg("❌ Email não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Mail className="w-6 h-6 text-amber-400" /> Recuperar Senha
        </h1>

        {msg && <p className="text-center text-sm mb-4">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-amber-400 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-300 transition"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Enviando...
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" /> Enviar Link
              </>
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default ForgotPassword;
