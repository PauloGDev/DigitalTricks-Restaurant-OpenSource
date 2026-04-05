import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Loader2,
  Mail,
  User,
  Phone,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  XCircle,
  Building2,
} from "lucide-react";
import { IMaskInput } from "react-imask";
import PageTitle from "../../context/PageTitle";

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

export default function RegisterAdmin() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [email, setEmail] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();
  const msgRef = useRef(null);
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

    const u = username.trim();
    const n = nomeCompleto.trim();
    const em = email.trim();

    if (u.length < 6) return setMsg("O nome de usurio precisa ter pelo menos 6 caracteres.", "error");
    if (!em) return setMsg("Informe seu e-mail.", "error");
    if (!n) return setMsg("Informe seu nome completo.", "error");

    const telDigits = telefone.replace(/\D/g, "");
    if (telDigits.length < 10) return setMsg("Informe um telefone vlido (com DDD).", "error");

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) return setMsg("Informe um CPF vlido.", "error");

    // Backend exige: 8+, 1 maiuscula, 1 numero, 1 especial
    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaRegex.test(senha)) {
      return setMsg(
        "A senha deve ter 8 ou mais caracteres, 1 letra maiscula, 1 minscula, 1 nmero e 1 caractere especial.",
        "error"
      );
    }

    if (senha !== confirmarSenha) return setMsg("As senhas no coincidem.", "error");

    try {
      setLoading(true);
      setMsg("", "info");

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          password: senha,
          email: em,
          nomeCompleto: n,
          telefone: telDigits,
          cpf: cpfDigits,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao registrar");
      }

      setMsg("Cadastro realizado! Agora voc pode entrar no painel. ", "success");
      setTimeout(() => navigate("/dashboard/login", { replace: true }), 1200);
    } catch (err) {
      setMsg(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "w-full rounded-2xl border border-zinc-200 bg-zinc-950/50 pl-11 pr-4 py-3.5 text-[15px] leading-5 text-white placeholder:text-zinc-500 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-500";

  return (
    <div className="bg-zinc-950 min-h-screen">
      <PageTitle title="Cadastro Admin | Painel" />

      {/* Header */}
      <section className="sticky top-0 pt-20 bg-zinc-950/90 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                  Criar conta admin
                </h1>
              </div>
              <p className="text-sm text-white/50 mt-1">
                Cadastre-se para gerenciar restaurantes e acessar o painel.
              </p>
            </div>
            <Link
              to="/dashboard/login"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold text-white"
            >
              J tenho conta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Conteudo */}
      <div className="py-6 sm:py-8 w-full max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-6"
        >
          <motion.div variants={itemVariants}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
              <div className="px-5 sm:px-8 py-5 border-b border-white/10 bg-white/[0.02]">
                <h3 className="text-sm font-extrabold text-white">Dados pessoais</h3>
                <p className="text-xs text-white/50 mt-1">
                  Essas informaes sero usadas para seu acesso ao painel.
                </p>
              </div>

              <div className="p-5 sm:p-8 space-y-4">
                <MsgBox mensagem={mensagem} msgType={msgType} msgRef={msgRef} />

                <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputShell icon={User} label="Nome completo" hint="Ex: Joo da Silva">
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

                  <InputShell icon={Mail} label="E-mail" hint="Sera seu nome de login alternativo">
                    <input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      className={baseInput}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </InputShell>

                  <InputShell icon={User} label="Nome de usurio" hint="Mnimo 6 caracteres">
                    <input
                      type="text"
                      placeholder="Ex: joaosilva"
                      className={baseInput}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="username"
                    />
                  </InputShell>

                  <InputShell icon={Phone} label="Telefone" hint="Com DDD">
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

                  <InputShell icon={IdCard} label="CPF" hint="Necessrio para cadastro administrativo">
                    <IMaskInput
                      mask="000.000.000-00"
                      placeholder="000.000.000-00"
                      className={baseInput}
                      value={cpf}
                      onAccept={(v) => setCpf(v)}
                      required
                      inputMode="numeric"
                    />
                  </InputShell>

                  {/* Divider */}
                  <div className="sm:col-span-2 pt-2">
                    <div className="h-px bg-white/10" />
                    <div className="mt-4">
                      <h3 className="text-sm font-extrabold text-white">Dados de acesso</h3>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
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
                  </div>

                  <div className="sm:col-span-2 -mt-1">
                    <PasswordField
                      label="Confirmar senha"
                      hint="Repita a senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      show={showConfirmPass}
                      setShow={setShowConfirmPass}
                      autoComplete="new-password"
                      baseInput={baseInput}
                    />
                  </div>

                  {/* Barra de fora */}
                  <div className="sm:col-span-2 -mt-1">
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full ${
                            senha
                              ? idx < senhaScore
                                ? "bg-emerald-500"
                                : "bg-white/10"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-extrabold transition shadow-[0_14px_30px_rgba(229,37,42,0.2)] ${
                        loading
                          ? "bg-white/5 text-white/30 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:opacity-90 text-white"
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Criando sua conta...
                        </>
                      ) : (
                        <>
                          Criar conta admin <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <p className="mt-4 text-xs text-white/40 text-center leading-relaxed">
                      Esta conta dar acesso ao painel administrativo de restaurantes.
                    </p>

                    <p className="mt-3 text-sm text-center text-white/50">
                      J tem uma conta?{" "}
                      <Link
                        to="/dashboard/login"
                        className="font-semibold text-red-400 hover:text-red-300"
                      >
                        Fazer login
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
