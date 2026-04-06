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
  Sun,
  Moon,
  Store,
  Building2,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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

function getThemeState() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
}

function MsgBox({ mensagem, msgType, msgRef, isDark }) {
  if (!mensagem) return null;
  const styles =
    msgType === "success"
      ? isDark
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-800"
      : msgType === "error"
      ? isDark
        ? "border-red-500/20 bg-red-500/10 text-red-300"
        : "border-red-200 bg-red-50 text-red-800"
      : isDark
      ? "border-white/10 bg-white/5 text-white/70"
      : "border-zinc-200 bg-zinc-50 text-zinc-800";
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

function InputShell({ icon: Icon, label, hint, children, isDark }) {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
        {label}
      </label>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/35" : "text-zinc-400"}`}>
          <Icon className="w-4 h-4" />
        </div>
        {children}
      </div>
      {hint && <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-zinc-500"}`}>{hint}</p>}
    </div>
  );
}

function PasswordField({ label, hint, value, onChange, show, setShow, autoComplete, baseInput, isDark }) {
  return (
    <div className="space-y-1">
      <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>{label}</label>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-white/35" : "text-zinc-400"}`}>
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
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl grid place-items-center transition ${
            isDark
              ? "text-white/50 hover:text-white hover:bg-white/5"
              : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
          }`}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className={`text-xs leading-relaxed ${isDark ? "text-white/45" : "text-zinc-500"}`}>{hint}</p>}
    </div>
  );
}

export default function RegisterAdmin() {
  /* ── Dados pessoais ── */
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [email, setEmail] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  /* ── Dados do restaurante ── */
  const [nomeRestaurante, setNomeRestaurante] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");
  const [uf, setUf] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [msgType, setMsgType] = useState("info");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [step, setStep] = useState(1);

  const { login: authLogin } = useAuth();

  /* ── Theme ── */
  const [theme, setTheme] = useState(getThemeState);
  useEffect(() => {
    localStorage.setItem("navbar-theme-override", theme);
  }, [theme]);

  const isDark = theme === "dark";

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

  /* ── Buscar CEP ── */
  const handleCepChange = async (value) => {
    setCep(value);
    const digits = value.replace(/\D/g, "");
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || "");
          setBairro(data.bairro || "");
          setCidade(data.localidade || "");
          setUf(data.uf || "");
        }
      } catch {
        // ignore
      }
    }
  };

  /* ── Step 1: dados pessoais ── */
  const handleStep1 = (e) => {
    e.preventDefault();

    const u = username.trim();
    const n = nomeCompleto.trim();
    const em = email.trim();

    if (!n) return setMsg("Informe seu nome completo.", "error");
    if (u.length < 6) return setMsg("Nome de usuário: mínimo 6 caracteres.", "error");
    if (!em) return setMsg("Informe seu e-mail.", "error");

    const telDigits = telefone.replace(/\D/g, "");
    if (telDigits.length < 10) return setMsg("Informe um telefone válido (com DDD).", "error");

    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaRegex.test(senha)) {
      return setMsg("A senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial.", "error");
    }
    if (senha !== confirmarSenha) return setMsg("As senhas não coincidem.", "error");

    setStep(2);
  };

  /* ── Step 2: dados do restaurante ── */
  const handleStep2 = async (e) => {
    e.preventDefault();

    if (!nomeRestaurante.trim()) return setMsg("Informe o nome do restaurante.", "error");

    try {
      setLoading(true);
      setMsg("", "info");

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: senha,
          email: email.trim(),
          nomeCompleto: nomeCompleto.trim(),
          telefone: telefone.replace(/\D/g, ""),
          cpf: cpf.replace(/\D/g, ""),
          nomeRestaurante: nomeRestaurante.trim(),
          cnpj: cnpj.replace(/\D/g, ""),
          cep: cep.replace(/\D/g, ""),
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          complemento: complemento.trim(),
          uf: uf.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao registrar");
      }

      const data = await res.json();

      // Salva auth e redireciona direto pro dashboard
      authLogin(data.token);

      setMsg("Conta e restaurante criados com sucesso!", "success");
      setTimeout(() => navigate("/dashboard", { replace: true }), 800);
    } catch (err) {
      setMsg(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Classes ── */
  const headerClass = [
    "sticky top-0 pt-20 z-20 border-b transition-colors",
    isDark
      ? "bg-[#1A1A1A]/90 backdrop-blur-xl border-white/5"
      : "bg-white/90 backdrop-blur border-zinc-200",
  ].join(" ");

  const cardShadow = isDark
    ? "shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
    : "shadow-[0_12px_35px_rgba(15,23,42,0.05)]";

  const baseInput = [
    "w-full rounded-2xl border pl-11 pr-4 py-3.5 text-[15px] leading-5 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/25 focus:border-red-500/50",
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-white/30"
      : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400",
  ].join(" ");

  const inputNoIcon = [
    "w-full rounded-2xl border px-4 py-3.5 text-[15px] leading-5 outline-none transition-all duration-300 focus:ring-2 focus:ring-red-500/25 focus:border-red-500/50",
    isDark
      ? "border-white/10 bg-white/5 text-white placeholder:text-white/30"
      : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400",
  ].join(" ");

  const panelClass = [
    "rounded-[28px] border transition-colors duration-300 overflow-hidden",
    cardShadow,
    isDark ? "border-white/10 bg-white/[0.04]" : "border-zinc-200 bg-white",
  ].join(" ");

  /* ── Progress indicator ── */
  const ProgressBar = () => (
    <div className="flex gap-2 mt-4">
      {[1, 2].map((s) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            s <= step ? "bg-[#E5252A]" : isDark ? "bg-white/10" : "bg-zinc-200"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-[#1A1A1A] text-white" : "bg-zinc-50 text-zinc-900"}`}>
      <PageTitle title="Cadastro Admin | Painel" />

      <button
        onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
        className={`fixed top-4 right-4 z-50 flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300 shadow-sm ${
          isDark
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
        }`}
        aria-label="Trocar tema"
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <section className={headerClass}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className={`text-xl sm:text-2xl font-extrabold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                {step === 1 ? "Criar conta admin" : "Dados do restaurante"}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                {step === 1
                  ? "Dados pessoais para acessar o painel."
                  : "Crie seu restaurante. Você será o administrador principal."}
              </p>
              <ProgressBar />
            </div>
            <Link
              to="/dashboard/login"
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition ${
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              Já tenho conta <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className={`transition-colors duration-300 ${isDark ? "bg-transparent" : "bg-zinc-50"}`}>
        <div className="py-6 sm:py-8 w-full max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-6"
          >
            <motion.div variants={itemVariants}>
              <div className={panelClass}>
                <div className={`px-5 sm:px-8 py-5 border-b ${isDark ? "border-white/10" : "border-zinc-100"}`}>
                  <h3 className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                    {step === 1 ? "Dados pessoais" : "Restaurante"}
                  </h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    {step === 1
                      ? "Essas informações serão usadas para seu acesso ao painel."
                      : "Crie o restaurante principal da sua conta. O endereço é opcional."}
                  </p>
                </div>

                <div className="p-5 sm:p-8 space-y-4">
                  <MsgBox mensagem={mensagem} msgType={msgType} msgRef={msgRef} isDark={isDark} />

                  {step === 1 && (
                    <form onSubmit={handleStep1} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputShell icon={User} label="Nome completo" hint="Ex: João da Silva" isDark={isDark}>
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

                      <InputShell icon={Mail} label="E-mail" hint="Será seu nome de login alternativo" isDark={isDark}>
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

                      <InputShell icon={User} label="Nome de usuário" hint="Mínimo 6 caracteres" isDark={isDark}>
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

                      <InputShell icon={Phone} label="Telefone" hint="Com DDD" isDark={isDark}>
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

                      <InputShell icon={IdCard} label="CPF" hint="Necessário para cadastro administrativo" isDark={isDark}>
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

                      <div className="sm:col-span-2 pt-2">
                        <div className={`h-px ${isDark ? "bg-white/10" : "bg-zinc-100"}`} />
                        <div className="mt-4">
                          <h3 className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                            Dados de acesso
                          </h3>
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
                          isDark={isDark}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <PasswordField
                          label="Confirmar senha"
                          hint="Repita a senha"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          show={showConfirmPass}
                          setShow={setShowConfirmPass}
                          autoComplete="new-password"
                          baseInput={baseInput}
                          isDark={isDark}
                        />
                      </div>

                      <div className="sm:col-span-2 -mt-1">
                        <div className="grid grid-cols-4 gap-1 px-1">
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1.5 rounded-full transition-colors ${
                                senha
                                  ? idx < senhaScore
                                    ? "bg-emerald-500"
                                    : isDark
                                    ? "bg-white/10"
                                    : "bg-zinc-200"
                                  : isDark
                                  ? "bg-white/10"
                                  : "bg-zinc-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-extrabold bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white hover:opacity-90 transition shadow-[0_14px_30px_rgba(229,37,42,0.20)]"
                        >
                          Próximo: Dados do restaurante <ArrowRight className="w-5 h-5" />
                        </button>

                        <p className={`mt-4 text-sm text-center ${isDark ? "text-white/50" : "text-zinc-600"}`}>
                          Já tem uma conta?{" "}
                          <Link
                            to="/dashboard/login"
                            className={`font-semibold transition ${isDark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-500"}`}
                          >
                            Fazer login
                          </Link>
                        </p>
                      </div>
                    </form>
                  )}

                  {step === 2 && (
                    <form onSubmit={handleStep2} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <InputShell icon={Store} label="Nome do restaurante" hint="Nome que aparecerá para os clientes" isDark={isDark}>
                          <input
                            type="text"
                            placeholder="Ex: Pizzaria do João"
                            className={baseInput}
                            value={nomeRestaurante}
                            onChange={(e) => setNomeRestaurante(e.target.value)}
                            required
                          />
                        </InputShell>
                      </div>

                      <InputShell icon={Building2} label="CNPJ" hint="Opcional, mas recomendado" isDark={isDark}>
                        <IMaskInput
                          mask="00.000.000/0000-00"
                          placeholder="00.000.000/0000-00"
                          className={baseInput}
                          value={cnpj}
                          onAccept={(v) => setCnpj(v)}
                          inputMode="numeric"
                        />
                      </InputShell>

                      <InputShell icon={Phone} label="CEP" hint="Preenchido automaticamente ao buscar o CEP" isDark={isDark}>
                        <IMaskInput
                          mask="00000-000"
                          placeholder="00000-000"
                          className={baseInput}
                          value={cep}
                          onAccept={handleCepChange}
                          inputMode="numeric"
                        />
                      </InputShell>

                      <div>
                        <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>Número</label>
                        <input
                          type="text"
                          placeholder="Nº"
                          className={inputNoIcon}
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>Complemento</label>
                        <input
                          type="text"
                          placeholder="Sala, Andar..."
                          className={inputNoIcon}
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>Bairro</label>
                        <input
                          type="text"
                          placeholder="Bairro"
                          className={inputNoIcon}
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>Cidade</label>
                        <input
                          type="text"
                          placeholder="Cidade"
                          className={inputNoIcon}
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className={`text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>UF</label>
                        <input
                          type="text"
                          placeholder="SP"
                          maxLength={2}
                          className={inputNoIcon}
                          value={uf}
                          onChange={(e) => setUf(e.target.value)}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="sm:col-span-2 pt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className={`px-6 py-3.5 rounded-2xl font-semibold border transition ${
                            isDark
                              ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                              : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                          }`}
                        >
                          Voltar
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 font-extrabold transition shadow-[0_14px_30px_rgba(229,37,42,0.20)] ${
                            loading
                              ? isDark
                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:opacity-90 text-white"
                          }`}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin w-5 h-5" />
                              Criando conta e restaurante...
                            </>
                          ) : (
                            <>
                              Criar conta e restaurante <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
