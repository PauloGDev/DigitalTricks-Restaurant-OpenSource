import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Loader2, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../context/PageTitle";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function MsgBox({ mensagem, tipo, refEl }) {
  if (!mensagem) return null;

  const styles =
    tipo === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div ref={refEl} className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      {mensagem}
    </div>
  );
}

export default function LoginAdmin() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [tipoMsg, setTipoMsg] = useState("error");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const msgRef = useRef(null);
  const { login: authLogin, user } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (msg) msgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!login || !senha) {
      setMsg("Preencha usuário/email e senha.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: login,
          password: senha,
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // salva token
      authLogin(data.token);

      setTipoMsg("success");
      setMsg("Login realizado com sucesso!");

      navigate("/dashboard", { replace: true });
    } catch {
      setTipoMsg("error");
      setMsg("Usuário ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-zinc-200 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500/20";

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <PageTitle title="Login Admin | Painel" />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-4 text-zinc-900">
            Painel do Restaurante
          </h2>

          <MsgBox mensagem={msg} tipo={tipoMsg} refEl={msgRef} />

          <form onSubmit={handleLogin} className="space-y-4 mt-4">
            {/* LOGIN */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Usuário ou email"
                className={inputStyle}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            {/* SENHA */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

              <input
                type={showPass ? "text" : "password"}
                placeholder="Senha"
                className={`${inputStyle} pr-10`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPass ? (
                  <EyeOff className="w-4 h-4 text-zinc-500" />
                ) : (
                  <Eye className="w-4 h-4 text-zinc-500" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition ${
                loading
                  ? "bg-zinc-200 text-zinc-500"
                  : "bg-red-600 hover:bg-red-500 text-white"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}