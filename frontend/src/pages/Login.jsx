import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Loader2, Lock, Eye, EyeOff, XCircle, Phone } from "lucide-react";
import PageTitle from "../context/PageTitle";
import { useAuth } from "../context/AuthContext";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function MsgBox({ mensagem, msgType, msgRef }) {
  if (!mensagem) return null;

  const styles =
    msgType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : msgType === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <div ref={msgRef} className={`rounded-3xl border px-4 py-3 text-sm ${styles}`} role="alert">
      <div className="flex items-start gap-2">
        <XCircle className="w-5 h-5 mt-0.5 shrink-0 opacity-80" />
        <div className="leading-relaxed">{mensagem}</div>
      </div>
    </div>
  );
}

function InputShell({ icon: Icon, label, hint, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-extrabold text-zinc-900">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
        {children}
      </div>
      {hint ? <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p> : null}
    </div>
  );
}

export default function Login() {
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const msgRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const { login: authLogin } = useAuth();

  useEffect(() => {
    if (!mensagem) return;
    msgRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mensagem]);

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const roles = decoded?.roles || [];

    const isStaff = roles.some((role) =>
      ["ROLE_ADMIN", "ROLE_GERENTE", "ROLE_FUNCIONARIO", "ROLE_SUPER_ADMIN"].includes(role)
    );

    if (isStaff) {
      navigate("/dashboard", { replace: true });
    }
  } catch {}
}, []);

  const setMsg = (text, type = "info") => {
    setMensagem(text);
    setMsgType(type);
  };

const getRedirectPath = () => {
  const stateFrom = location.state?.from;

  if (typeof stateFrom === "string" && stateFrom.trim()) {
    return stateFrom;
  }

  if (
    stateFrom &&
    typeof stateFrom === "object" &&
    typeof stateFrom.pathname === "string"
  ) {
    const search = stateFrom.search || "";
    const hash = stateFrom.hash || "";
    return `${stateFrom.pathname}${search}${hash}`;
  }

  const storedFrom = sessionStorage.getItem("login_redirect_after_auth");
  if (storedFrom && storedFrom.trim()) {
    sessionStorage.removeItem("login_redirect_after_auth");
    return storedFrom;
  }

  // Se tem itens no carrinho, volta para o carrinho do restaurante
  try {
    const carrinhoItems = JSON.parse(localStorage.getItem("carrinho_local") || "[]");
    if (Array.isArray(carrinhoItems) && carrinhoItems.length > 0) {
      const lastRest = localStorage.getItem("carrinho_last_rest");
      if (lastRest) {
        return `/restaurante/${lastRest}/carrinho`;
      }
    }
  } catch {}

  const token = localStorage.getItem("token");
  if (!token) return "/perfil";

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const roles = Array.isArray(decoded?.roles) ? decoded.roles : [];
    const isStaff = roles.some((role) =>
      ["ROLE_ADMIN", "ROLE_GERENTE", "ROLE_FUNCIONARIO", "ROLE_SUPER_ADMIN"].includes(role)
    );
    return isStaff ? "/dashboard" : "/perfil";
  } catch {
    return "/perfil";
  }
};

const handleLogin = async (e) => {
  e.preventDefault();

  if (!telefone.trim() || !senha) {
    setMsg("Preencha telefone e senha.", "error");
    return;
  }

  try {
    setLoading(true);
    setMsg("", "info");

    const res = await fetch(`${API_URL}/clientes/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefone: telefone.replace(/\D/g, ""),
        password: senha,
      }),
    });

    if (!res.ok) throw new Error("Credenciais inválidas");

    const data = await res.json();

    // 🔥 ISSO É O CERTO
    authLogin(data.token);

    const redirectTo = getRedirectPath();

    setMsg("Login realizado com sucesso!", "success");
    navigate(redirectTo, { replace: true });

  } catch (err) {
    setMsg("Usuário ou senha inválidos.", "error");
  } finally {
    setLoading(false);
  }
};

  const baseInput =
    "w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  return (
    <div className="bg-white min-h-screen">
      <PageTitle title="Entrar | Pedido Online" />

      <section className="sticky top-0 pt-20 bg-white/90 backdrop-blur border-b border-zinc-100 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 truncate">
                Entrar
              </h1>
              <p className="text-sm text-zinc-500">
                Acesse sua conta para acompanhar e finalizar pedidos.
              </p>
            </div>

            <Link
              to="/register"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-semibold text-zinc-800"
            >
              Criar conta
              <LogIn className="w-4 h-4 opacity-80" />
            </Link>
          </div>
        </div>
      </section>

      <div className="py-6 sm:py-8 w-full max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 gap-6">
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden">
              <div className="px-5 sm:px-8 py-5 border-b border-zinc-100 bg-white">
                <h3 className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-red-600" />
                  Login
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Use seu usuário e senha cadastrados.
                </p>
              </div>

              <div className="p-5 sm:p-8 space-y-4">
                <MsgBox mensagem={mensagem} msgType={msgType} msgRef={msgRef} />

                <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4">
                  <InputShell icon={Phone} label="Telefone">
                    <input
                      type="text"
                      className={baseInput}
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      autoComplete="tel"
                      required
                    />
                  </InputShell>

                  <div className="space-y-1">
                    <label className="text-sm font-extrabold text-zinc-900">Senha</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                        <Lock className="w-4 h-4" />
                      </div>

                      <input
                        type={showPass ? "text" : "password"}
                        className={`${baseInput} pr-12`}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl grid place-items-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition"
                        aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-sm font-semibold text-red-700 hover:text-red-800 hover:underline"
                      >
                        Esqueceu sua senha?
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 hover:underline"
                      >
                        Criar conta
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={[
                      "w-full inline-flex items-center justify-center gap-2",
                      "rounded-2xl py-3.5 font-extrabold",
                      "transition shadow-[0_14px_30px_rgba(220,38,38,0.18)]",
                      loading
                        ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-500 text-white",
                    ].join(" ")}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Entrar
                      </>
                    )}
                  </button>

                  <p className="text-xs text-zinc-500 text-center leading-relaxed">
                    Ao entrar, você poderá acompanhar seus pedidos e finalizar pagamentos.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}