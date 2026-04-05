import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Loader2,
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IMaskInput } from "react-imask";
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
      : "border-red-200 bg-red-50 text-red-800";
  const Icon = msgType === "error" ? XCircle : UserPlus;
  return (
    <div ref={msgRef} className={`rounded-3xl border px-4 py-3 text-sm ${styles}`} role="alert">
      <div className="flex items-start gap-2">
        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
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
      {hint && <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

function PasswordField({ label, hint, value, onChange, show, setShow, autoComplete, baseInput }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-extrabold text-zinc-900">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <Lock className="w-4 h-4" />
        </div>
        <input
          type={show ? "text" : "password"}
          placeholder={label}
          className={`${baseInput} pr-12`}
          value={value}
          onChange={onChange}
          required
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl grid place-items-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p>}
    </div>
  );
}

export default function Register() {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [mostrarOpcionais, setMostrarOpcionais] = useState(false);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState("info");

  const navigate = useNavigate();
  const msgRef = useRef(null);
  const { login: authLogin } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const setMsg = useCallback((text, type = "info") => {
    setMensagem(text);
    setMsgType(type);
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    msgRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mensagem]);

  const senhaScore = useMemo(() => {
    let score = 0;
    if (senha.length >= 8) score++;
    if (/[A-Z]/.test(senha)) score++;
    if (/\d/.test(senha)) score++;
    if (/[@$!%*?&]/.test(senha)) score++;
    return score;
  }, [senha]);

  const senhaLabel = useMemo(() => {
    if (!senha) return "Digite uma senha segura";
    if (senhaScore <= 1) return "Senha fraca";
    if (senhaScore === 2) return "Senha ok";
    if (senhaScore === 3) return "Senha boa";
    return "Senha forte";
  }, [senha, senhaScore]);

  const handleRegister = async (e) => {
    e.preventDefault();

    const nome = nomeCompleto.trim();
    const telDigits = telefone.replace(/\D/g, "");

    if (!nome) return setMsg("Informe seu nome completo.", "error");
    if (telDigits.length < 10) return setMsg("Informe um telefone válido (com DDD).", "error");
    if (!senha || senha.length < 4) return setMsg("Crie uma senha com pelo menos 4 caracteres.", "error");
    if (senha !== confirmarSenha) return setMsg("As senhas não coincidem.", "error");

    try {
      setLoading(true);
      setMsg("", "info");

      const payload = {
        telefone: telDigits,
        password: senha,
        nomeCompleto: nome,
        email: email.trim() || null,
        dataNascimento: dataNascimento || null,
        genero: genero || null,
      };

      const res = await fetch(`${API_URL}/clientes/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao registrar");
      }

      const data = await res.json();

      // Auto-login: backend retorna token, id, telefone
      authLogin(data.token);
      setMsg("Cadastro concluído! Redirecionando. 🍔", "success");
      setTimeout(() => navigate("/", { replace: true }), 900);
    } catch (err) {
      setMsg(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  return (
    <div className="bg-white min-h-screen">
      <PageTitle title="Cadastro | Pedido Online" />

      {/* Header */}
      <section className="sticky top-0 pt-20 bg-white/90 backdrop-blur border-b border-zinc-100 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 truncate">
                Criar conta
              </h1>
              <p className="text-sm text-zinc-500">
                Cadastre-se para acompanhar pedidos e facilitar o pagamento.
              </p>
            </div>
            <Link
              to="/login"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-semibold text-zinc-800"
            >
              Entrar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <div className="py-6 sm:py-8 w-full max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-6"
        >
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden">
              <div className="px-5 sm:px-8 py-5 border-b border-zinc-100 bg-white">
                <h3 className="text-sm font-extrabold text-zinc-900">Dados pessoais</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Usaremos essas informações para contato e entrega.
                </p>
              </div>

              <div className="p-5 sm:p-8 space-y-4">
                <MsgBox mensagem={mensagem} msgType={msgType} msgRef={msgRef} />

                <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Obrigatórios */}
                  <InputShell icon={User} label="Nome completo" hint="Ex: João da Silva">
                    <input
                      type="text"
                      placeholder="Seu nome"
                      className={baseInput}
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </InputShell>

                  <InputShell icon={Phone} label="Telefone" hint="Com DDD — será seu usuário de login">
                    <IMaskInput
                      mask="(00) 00000-0000"
                      placeholder="(00) 00000-0000"
                      className={baseInput}
                      value={telefone}
                      onAccept={(v) => setTelefone(v)}
                      required
                      inputMode="tel"
                    />
                  </InputShell>

                  {/* Toggle opcionais */}
                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMostrarOpcionais((p) => !p)}
                      className="flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition"
                    >
                      {mostrarOpcionais ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Informações opcionais
                    </button>
                  </div>

                  {/* Opcionais (colapsáveis) */}
                  <AnimatePresence>
                    {mostrarOpcionais && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <InputShell icon={Mail} label="E-mail" hint="Opcional — para avisos e promoções">
                          <input
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            className={baseInput}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            inputMode="email"
                          />
                        </InputShell>

                        <InputShell icon={Calendar} label="Data de nascimento" hint="Opcional">
                          <input
                            type="date"
                            className={baseInput}
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                            inputMode="none"
                          />
                        </InputShell>

                        <div className="sm:col-span-2">
                          <label className="text-sm font-extrabold text-zinc-900 block mb-1">Gênero</label>
                          <select
                            value={genero}
                            onChange={(e) => setGenero(e.target.value)}
                            className={baseInput.replace("pl-11", "")}
                          >
                            <option value="">Prefiro não informar</option>
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMININO">Feminino</option>
                            <option value="OUTRO">Outro</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="sm:col-span-2 pt-2">
                    <div className="h-px bg-zinc-100" />
                    <div className="mt-4">
                      <h3 className="text-sm font-extrabold text-zinc-900">Dados de acesso</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Seu login será o telefone informado acima.
                      </p>
                    </div>
                  </div>

                  <PasswordField
                    label="Senha"
                    hint={senhaLabel}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    show={showPass}
                    setShow={setShowPass}
                    autoComplete="new-password"
                    baseInput={baseInput}
                  />

                  <PasswordField
                    label="Confirmar senha"
                    hint="Repita a senha para confirmar"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    show={showConfirmPass}
                    setShow={setShowConfirmPass}
                    autoComplete="new-password"
                    baseInput={baseInput}
                  />

                  {/* Barra de força */}
                  <div className="sm:col-span-2 -mt-1">
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full ${
                            senha
                              ? idx < senhaScore
                                ? "bg-emerald-500"
                                : "bg-zinc-200"
                              : "bg-zinc-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-extrabold transition shadow-[0_14px_30px_rgba(220,38,38,0.18)] ${
                        loading
                          ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-500 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Criando sua conta...
                        </>
                      ) : (
                        <>
                          Criar conta <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="mt-4 text-xs text-zinc-500 text-center leading-relaxed">
                      Ao se cadastrar, você concorda em fornecer dados corretos para pagamento e entrega.
                    </p>

                    <p className="mt-3 text-sm text-center text-zinc-600">
                      Já tem conta?{" "}
                      <Link to="/login" className="font-semibold text-red-700 hover:text-red-800">
                        Entrar
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
