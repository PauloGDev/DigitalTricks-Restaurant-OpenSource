import { motion } from "framer-motion";
import { IMaskInput } from "react-imask";
import { useMemo, useState } from "react";
import {
  User,
  IdCard,
  Phone,
  Mail,
  PencilLine,
  Check,
  AlertCircle,
} from "lucide-react";

const formatOnlyDigits = (v = "") => String(v).replace(/[^\d]/g, "");
const isEmail = (v = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const DadosClienteForm = ({
  fadeUp,
  nomeCompleto,
  setNomeCompleto,
  cpf,
  setCpf,
  telefone,
  setTelefone,
  email,
  setEmail,
  usuarioData,
  editarTelefone,
  setEditarTelefone,
  editarEmail,
  setEditarEmail,
}) => {
  const [touched, setTouched] = useState({
    nome: false,
    cpf: false,
    tel: false,
    email: false,
  });

  // CPF
  const validarCPF = (cpfValue) => {
    let cpf = formatOnlyDigits(cpfValue);
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf.charAt(i)) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== Number(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf.charAt(i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    return resto === Number(cpf.charAt(10));
  };

  const cpfDigits = useMemo(() => formatOnlyDigits(cpf), [cpf]);
  const cpfValido = useMemo(() => {
    if (cpfDigits.length === 0) return true; // vazio não acusa erro
    if (cpfDigits.length < 11) return true; // enquanto digita, não acusa
    return validarCPF(cpfDigits);
  }, [cpfDigits]);

  // Telefone
  const telDigits = useMemo(() => formatOnlyDigits(telefone), [telefone]);
  const telValido = useMemo(() => {
    if (!telDigits) return true;
    // Brasil: 10 ou 11 dígitos
    return telDigits.length === 10 || telDigits.length === 11;
  }, [telDigits]);

  // Email
  const emailValido = useMemo(() => {
    const v = String(email || "").trim();
    if (!v) return true;
    return isEmail(v);
  }, [email]);

  const nomeValido = useMemo(() => {
    const v = String(nomeCompleto || "").trim();
    if (!v) return true;
    return v.length >= 3;
  }, [nomeCompleto]);

  const Field = ({
    label,
    hint,
    error,
    icon: Icon,
    children,
    action,
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl border border-zinc-200 bg-white grid place-items-center">
            <Icon className="h-4.5 w-4.5 text-zinc-700" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-zinc-900">{label}</p>
            {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {children}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );

  const InputBase =
    "w-full rounded-2xl border bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition";
  const Focus =
    "focus:ring-2 focus:ring-red-500/30 focus:border-red-300";
  const Disabled =
    "disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed";

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className={[
        "mt-10",
        "rounded-3xl border border-zinc-200 bg-white",
        "shadow-sm",
        "overflow-hidden",
      ].join(" ")}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 py-5 border-b border-zinc-100 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
              Dados do cliente
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Use esses dados para finalizar o pedido e facilitar o atendimento.
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600">
            <Check className="h-4 w-4 text-emerald-600" />
            Preenchimento rápido
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 sm:px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nome */}
        <Field
          label="Nome completo"
          hint="Como você quer aparecer no pedido."
          icon={User}
          error={
            touched.nome && !nomeValido ? "Informe um nome válido." : null
          }
        >
          <input
            type="text"
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, nome: true }))}
            className={[
              InputBase,
              Focus,
              !nomeValido && touched.nome ? "border-red-300" : "border-zinc-200",
            ].join(" ")}
            placeholder="Ex: Paulo Guilherme"
            autoComplete="name"
            inputMode="text"
          />
        </Field>

        {/* CPF */}
        <Field
          label="CPF"
          hint="Necessário para identificação do pedido."
          icon={IdCard}
          error={
            touched.cpf && cpfDigits.length === 11 && !cpfValido
              ? "CPF inválido."
              : null
          }
        >
          <IMaskInput
            mask="000.000.000-00"
            value={cpf}
            onAccept={(value) => setCpf(value)}
            onBlur={() => setTouched((p) => ({ ...p, cpf: true }))}
            className={[
              InputBase,
              Focus,
              Disabled,
              touched.cpf && cpfDigits.length === 11 && !cpfValido
                ? "border-red-300"
                : "border-zinc-200",
            ].join(" ")}
            placeholder="000.000.000-00"
            inputMode="numeric"
            aria-invalid={
              touched.cpf && cpfDigits.length === 11 && !cpfValido
                ? "true"
                : "false"
            }
          />
        </Field>

        {/* Telefone */}
        <Field
          label="Telefone"
          hint="Para contato rápido se necessário."
          icon={Phone}
          action={
            usuarioData?.telefone && !editarTelefone ? (
              <button
                type="button"
                onClick={() => setEditarTelefone(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-semibold text-zinc-900"
              >
                <PencilLine className="h-4 w-4" />
                Editar
              </button>
            ) : null
          }
          error={touched.tel && !telValido ? "Telefone inválido." : null}
        >
          {editarTelefone || !usuarioData?.telefone ? (
            <IMaskInput
              mask="(00) 0 0000-0000"
              value={telefone}
              onAccept={(value) => setTelefone(value)}
              onBlur={() => setTouched((p) => ({ ...p, tel: true }))}
              className={[
                InputBase,
                Focus,
                touched.tel && !telValido ? "border-red-300" : "border-zinc-200",
              ].join(" ")}
              placeholder="(85) 9 9999-9999"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={touched.tel && !telValido ? "true" : "false"}
            />
          ) : (
            <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {usuarioData.telefone}
            </div>
          )}
        </Field>

        {/* Email */}
        <Field
          label="E-mail"
          hint="Enviaremos confirmações e atualizações."
          icon={Mail}
          action={
            usuarioData?.email && !editarEmail ? (
              <button
                type="button"
                onClick={() => setEditarEmail(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-semibold text-zinc-900"
              >
                <PencilLine className="h-4 w-4" />
                Editar
              </button>
            ) : null
          }
          error={touched.email && !emailValido ? "E-mail inválido." : null}
        >
          {editarEmail || !usuarioData?.email ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              className={[
                InputBase,
                Focus,
                touched.email && !emailValido
                  ? "border-red-300"
                  : "border-zinc-200",
              ].join(" ")}
              placeholder="seu@email.com"
              inputMode="email"
              autoComplete="email"
              aria-invalid={touched.email && !emailValido ? "true" : "false"}
            />
          ) : (
            <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              {usuarioData.email}
            </div>
          )}
        </Field>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-5 border-t border-zinc-100 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-zinc-500">
            Ao continuar, você confirma que os dados acima estão corretos.
          </p>

          <div className="flex flex-wrap gap-2">
            {(editarEmail || editarTelefone) && (
              <button
                type="button"
                onClick={() => {
                  setEditarEmail(false);
                  setEditarTelefone(false);
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-semibold text-zinc-900"
              >
                Concluir edição
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default DadosClienteForm;