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
} from "lucide-react";
import { IMaskInput } from "react-imask";
import PageTitle from "../context/PageTitle";

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

  const Icon = msgType === "error" ? XCircle : UserPlus;

  return (
    <div
      ref={msgRef}
      className={`rounded-3xl border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
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
      {hint ? <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p> : null}
    </div>
  );
}

function PasswordField({
  label,
  hint,
  value,
  onChange,
  show,
  setShow,
  autoComplete,
  baseInput,
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-extrabold text-zinc-900">{label}</label>

      <div className="relative">
        {/* Ícone de cadeado à esquerda */}
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

        {/* Olho à direita */}
        <button
          type="button"
          onClick={() => setShow((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl grid place-items-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 transition"
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {hint ? <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p> : null}
    </div>
  );
}

export default function Register() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [email, setEmail] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enderecos] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();
  const msgRef = useRef(null);

  const setMsg = useCallback((text, type = "info") => {
    setMensagem(text);
    setMsgType(type);
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    msgRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [mensagem]);

  const validarSenha = (s) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(s);
  };

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

    if (u.length < 6) return setMsg("O usuário precisa ter pelo menos 6 caracteres.", "error");
    if (!em) return setMsg("Informe seu e-mail.", "error");
    if (!n) return setMsg("Informe seu nome completo.", "error");

    const telDigits = telefone.replace(/[^\d]/g, "");
    if (telDigits.length < 10) return setMsg("Informe um telefone válido (com DDD).", "error");

    const cpfDigits = cpf.replace(/[^\d]/g, "");
    if (cpfDigits.length !== 11) return setMsg("Informe um CPF válido.", "error");

    if (!validarSenha(senha)) {
      return setMsg(
        "A senha deve ter 8+ caracteres, 1 letra maiúscula, 1 número e 1 caractere especial.",
        "error"
      );
    }

    if (senha !== confirmarSenha) return setMsg("As senhas não coincidem.", "error");

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
          telefone,
          cpf,
          enderecos,
        }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || "Erro ao registrar");

      setMsg("Cadastro concluído! Agora você pode entrar e fazer seu pedido. 🍔", "success");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setMsg(`Erro ao registrar: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Mais confortável no celular: altura maior + padding
  const baseInput =
    "w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  return (
    <div className="bg-white min-h-screen">
      <PageTitle title="Cadastro | Pedido Online" />

      {/* Header estilo app */}
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
                <h3 className="text-sm font-extrabold text-zinc-900">Dados do cliente</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Usaremos essas informações para pagamento e contato.
                </p>
              </div>

              <div className="p-5 sm:p-8 space-y-4">
                <MsgBox mensagem={mensagem} msgType={msgType} msgRef={msgRef} />

                <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <InputShell icon={Mail} label="E-mail" hint="Para acompanhar pedidos e avisos">
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

                  <InputShell icon={IdCard} label="CPF" hint="Necessário para Pix/cartão">
                    <IMaskInput
                      mask="000.000.000-00"
                      placeholder="000.000.000-00"
                      className={baseInput}
                      value={cpf}
                      onAccept={(value) => setCpf(value)}
                      required
                      inputMode="numeric"
                    />
                  </InputShell>

                  <InputShell icon={Phone} label="Telefone" hint="Com DDD (WhatsApp opcional)">
                    <IMaskInput
                      mask="(00) 00000-0000"
                      placeholder="(00) 00000-0000"
                      className={baseInput}
                      value={telefone}
                      onAccept={(value) => setTelefone(value)}
                      required
                      inputMode="tel"
                    />
                  </InputShell>

                  <div className="sm:col-span-2 pt-2">
                    <div className="h-px bg-zinc-100" />
                    <div className="mt-4">
                      <h3 className="text-sm font-extrabold text-zinc-900">Dados de acesso</h3>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <InputShell icon={User} label="Usuário" hint="Mínimo 6 caracteres">
                      <input
                        type="text"
                        placeholder="ex: joaosilva"
                        className={baseInput}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="username"
                      />
                    </InputShell>
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

                  {/* Barra de força (separada, fica bem no mobile) */}
                  <div className="sm:col-span-2 -mt-1">
                    <div className="grid grid-cols-4 gap-1 px-1">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={[
                            "h-1.5 rounded-full",
                            senha ? (idx < senhaScore ? "bg-emerald-500" : "bg-zinc-200") : "bg-zinc-200",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-2">
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