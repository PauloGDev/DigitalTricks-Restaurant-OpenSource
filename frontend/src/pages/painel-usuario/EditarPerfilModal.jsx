import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  IdCard,
  MapPin,
  Hash,
  Building2,
  Map,
  Mailbox,
  Star,
  Trash2,
  Plus,
  Save,
} from "lucide-react";

/** Helpers de máscara leve (sem libs) */
const onlyDigits = (v = "") => String(v).replace(/\D/g, "");
const formatCPF = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
};
const formatCEP = (v = "") => {
  const d = onlyDigits(v).slice(0, 8);
  return d.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
};
const formatPhone = (v = "") => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3").trim();
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3").trim();
};

const sheetVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 140, damping: 22 } },
  exit: { opacity: 0, y: 24, transition: { duration: 0.15 } },
};

function Field({ icon: Icon, label, hint, children }) {
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

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800"
      aria-pressed={checked}
    >
      <span
        className={[
          "relative inline-flex h-6 w-11 items-center rounded-full transition",
          checked ? "bg-red-600" : "bg-zinc-300",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </span>
      {label}
    </button>
  );
}

const EnderecoCard = ({ endereco, index, onUpdate, onRemove, onSetPadrao }) => {
  const input =
    "w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";
  const inputNoIcon =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-zinc-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Endereço {index + 1}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Preencha o endereço para entrega.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
            aria-label="Remover endereço"
            title="Remover"
          >
            <Trash2 className="w-4 h-4 text-zinc-700" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field icon={Map} label="Logradouro">
          <input
            className={input}
            placeholder="Rua, Av..."
            value={endereco.logradouro || ""}
            onChange={(e) => onUpdate(index, { logradouro: e.target.value })}
            autoComplete="street-address"
          />
        </Field>

        <Field icon={Hash} label="Número">
          <input
            className={input}
            placeholder="Ex: 123"
            value={endereco.numero || ""}
            onChange={(e) => onUpdate(index, { numero: e.target.value })}
            inputMode="text"
          />
        </Field>

        <div className="sm:col-span-2">
          <label className="text-sm font-extrabold text-zinc-900">Complemento (opcional)</label>
          <input
            className={`${inputNoIcon} mt-1`}
            placeholder="Apto, bloco, referência..."
            value={endereco.complemento || ""}
            onChange={(e) => onUpdate(index, { complemento: e.target.value })}
          />
        </div>

        <Field icon={Building2} label="Bairro">
          <input
            className={input}
            placeholder="Seu bairro"
            value={endereco.bairro || ""}
            onChange={(e) => onUpdate(index, { bairro: e.target.value })}
          />
        </Field>

        <Field icon={Building2} label="Cidade">
          <input
            className={input}
            placeholder="Sua cidade"
            value={endereco.cidade || ""}
            onChange={(e) => onUpdate(index, { cidade: e.target.value })}
          />
        </Field>

        <Field icon={Map} label="UF">
          <input
            className={input}
            placeholder="CE"
            value={endereco.estado || ""}
            onChange={(e) => onUpdate(index, { estado: e.target.value.toUpperCase().slice(0, 2) })}
            maxLength={2}
          />
        </Field>

        <Field icon={Mailbox} label="CEP">
          <input
            className={input}
            placeholder="00000-000"
            value={formatCEP(endereco.cep || "")}
            onChange={(e) => onUpdate(index, { cep: formatCEP(e.target.value) })}
            inputMode="numeric"
            autoComplete="postal-code"
          />
        </Field>

        <div className="sm:col-span-2 flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Star className={["w-4 h-4", endereco.padrao ? "text-amber-500" : "text-zinc-300"].join(" ")} />
            <span className="text-sm font-semibold text-zinc-800">
              {endereco.padrao ? "Endereço padrão" : "Não é padrão"}
            </span>
          </div>

          {!endereco.padrao ? (
            <button
              type="button"
              onClick={() => onSetPadrao(index)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm font-extrabold text-zinc-800"
            >
              <Star className="w-4 h-4 text-amber-500" />
              Definir como padrão
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default function EditarPerfilModal({ isOpen, onClose, perfilAtual, onSave }) {
  const [perfil, setPerfil] = useState({
    nomeCompleto: "",
    telefone: "",
    cpf: "",
    enderecos: [],
  });

  const [saving, setSaving] = useState(false);
  const panelRef = useRef(null);

  // popular ao abrir
  useEffect(() => {
    if (!isOpen) return;

    const enderecos = Array.isArray(perfilAtual?.enderecos) ? perfilAtual.enderecos : [];
    // garante "padrao" boolean e ids (se vierem do back)
    const normalized = enderecos.map((e) => ({
      id: e.id,
      logradouro: e.logradouro || "",
      numero: e.numero || "",
      complemento: e.complemento || "",
      bairro: e.bairro || "",
      cidade: e.cidade || "",
      estado: e.estado || "",
      cep: e.cep || "",
      padrao: !!e.padrao,
    }));

    // se nenhum marcado como padrão e houver 1+, marca o primeiro
    const hasDefault = normalized.some((e) => e.padrao);
    const finalEnderecos =
      normalized.length > 0 && !hasDefault
        ? normalized.map((e, idx) => ({ ...e, padrao: idx === 0 }))
        : normalized;

    setPerfil({
      nomeCompleto: perfilAtual?.nomeCompleto || "",
      telefone: perfilAtual?.telefone || "",
      cpf: perfilAtual?.cpf || "",
      enderecos: finalEnderecos,
    });
  }, [isOpen, perfilAtual]);

  // trava scroll do body
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ESC fecha
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const input =
    "w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 py-3.5 text-[15px] leading-5 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  const onUpdateEndereco = (index, patch) => {
    setPerfil((prev) => {
      const next = [...prev.enderecos];
      next[index] = { ...next[index], ...patch };
      return { ...prev, enderecos: next };
    });
  };

  const onRemoveEndereco = (index) => {
    setPerfil((prev) => {
      const next = prev.enderecos.filter((_, i) => i !== index);
      // garante um padrão se sobrou algo
      const hasDefault = next.some((e) => e.padrao);
      const fixed = next.length > 0 && !hasDefault ? next.map((e, i) => ({ ...e, padrao: i === 0 })) : next;
      return { ...prev, enderecos: fixed };
    });
  };

  const onAddEndereco = () => {
    setPerfil((prev) => {
      const next = [
        ...prev.enderecos,
        {
          id: undefined,
          logradouro: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          padrao: prev.enderecos.length === 0, // primeiro vira padrão
        },
      ];
      return { ...prev, enderecos: next };
    });
    // foca no painel (evita “pulo” em mobile)
    requestAnimationFrame(() => panelRef.current?.scrollTo?.({ top: 99999, behavior: "smooth" }));
  };

  const onSetPadrao = (index) => {
    setPerfil((prev) => ({
      ...prev,
      enderecos: prev.enderecos.map((e, i) => ({ ...e, padrao: i === index })),
    }));
  };

  const canSave = useMemo(() => {
    if (!perfil.nomeCompleto.trim()) return false;
    if (onlyDigits(perfil.telefone).length < 10) return false;
    if (onlyDigits(perfil.cpf).length !== 11) return false;
    if (!perfil.enderecos || perfil.enderecos.length === 0) return true; // se você permitir sem endereço
    // valida mínimo do endereço padrão
    const padrao = perfil.enderecos.find((e) => e.padrao) || perfil.enderecos[0];
    if (!padrao) return true;
    if (!padrao.logradouro?.trim()) return false;
    if (!padrao.numero?.trim()) return false;
    if (!padrao.cidade?.trim()) return false;
    if (!padrao.estado?.trim()) return false;
    if (onlyDigits(padrao.cep).length !== 8) return false;
    return true;
  }, [perfil]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // normaliza antes de salvar (remove máscaras)
      const payload = {
        ...perfil,
        telefone: formatPhone(perfil.telefone),
        cpf: formatCPF(perfil.cpf),
        enderecos: (perfil.enderecos || []).map((e) => ({
          ...e,
          cep: formatCEP(e.cep),
          estado: (e.estado || "").toUpperCase().slice(0, 2),
          padrao: !!e.padrao,
        })),
      };

      await onSave?.(payload);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/55 z-40"
            onClick={onClose}
          />

          {/* Modal: mobile bottom-sheet, desktop central */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              variants={sheetVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-100 px-5 sm:px-8 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                      Editar perfil
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">
                      Atualize seus dados para pagamento e entrega.
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 text-zinc-700" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div
                ref={panelRef}
                className="max-h-[78vh] sm:max-h-[75vh] overflow-auto px-5 sm:px-8 py-5 space-y-6"
              >
                {/* Dados pessoais */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5">
                  <p className="text-sm font-extrabold text-zinc-900">
                    Dados pessoais
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Esses dados são usados no checkout e contato.
                  </p>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Field icon={User} label="Nome completo">
                        <input
                          className={input}
                          placeholder="Seu nome completo"
                          value={perfil.nomeCompleto}
                          onChange={(e) => setPerfil((p) => ({ ...p, nomeCompleto: e.target.value }))}
                        />
                      </Field>
                    </div>

                    <Field icon={Phone} label="Telefone" hint="Com DDD">
                      <input
                        className={input}
                        placeholder="(00) 00000-0000"
                        value={formatPhone(perfil.telefone)}
                        onChange={(e) => setPerfil((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
                        inputMode="numeric"
                        autoComplete="tel"
                      />
                    </Field>

                    <Field icon={IdCard} label="CPF" hint="Necessário para Pix/cartão">
                      <input
                        className={input}
                        placeholder="000.000.000-00"
                        value={formatCPF(perfil.cpf)}
                        onChange={(e) => setPerfil((p) => ({ ...p, cpf: formatCPF(e.target.value) }))}
                        inputMode="numeric"
                      />
                    </Field>
                  </div>
                </div>

                {/* Endereços */}
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-extrabold text-zinc-900">Endereços</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Adicione e selecione um endereço padrão para entrega.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onAddEndereco}
                      className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold transition"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>

                  {perfil.enderecos?.length ? (
                    <div className="space-y-3">
                      {perfil.enderecos.map((end, idx) => (
                        <EnderecoCard
                          key={end.id ?? `new-${idx}`}
                          endereco={end}
                          index={idx}
                          onUpdate={onUpdateEndereco}
                          onRemove={onRemoveEndereco}
                          onSetPadrao={onSetPadrao}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                      Nenhum endereço cadastrado. Toque em <strong>Adicionar</strong> para incluir um endereço.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-zinc-100 px-5 sm:px-8 py-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-extrabold text-zinc-800"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={!canSave || saving}
                    onClick={handleSave}
                    className={[
                      "w-full sm:w-auto inline-flex items-center justify-center gap-2",
                      "px-6 py-3 rounded-2xl font-extrabold transition",
                      "shadow-[0_14px_30px_rgba(220,38,38,0.18)]",
                      !canSave || saving
                        ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-500 text-white",
                    ].join(" ")}
                  >
                    {saving ? (
                      <>
                        <motion.span
                          className="inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        >
                          <Save className="w-5 h-5" />
                        </motion.span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar
                      </>
                    )}
                  </button>
                </div>

                {!canSave ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Preencha nome, telefone, CPF e pelo menos o endereço padrão (logradouro, número, cidade, UF e CEP).
                  </p>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}