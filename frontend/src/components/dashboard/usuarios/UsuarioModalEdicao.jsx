import { motion } from "framer-motion";
import { X, Shield, ToggleLeft, Loader2, AlertCircle } from "lucide-react";
import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ATIVO", label: "Ativo" },
  { value: "INATIVO", label: "Inativo" },
];

const PAPEL_OPTIONS = [
  { value: "DONO", label: "Dono" },
  { value: "GERENTE", label: "Gerente" },
  { value: "ATENDENTE", label: "Atendente" },
];

const UsuarioModalEdicao = ({
  usuarioSelecionado,
  setUsuarioSelecionado,
  onClose,
  onSave,
  isDark = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const statusAtual = usuarioSelecionado?.ativo ? "ATIVO" : "INATIVO";

  const statusTone = useMemo(() => {
    if (statusAtual === "ATIVO") {
      return isDark
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    return isDark
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }, [statusAtual, isDark]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setErro("");
      await onSave();
    } catch (e) {
      setErro(e?.message || "Não foi possível salvar as alterações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div
        className={[
          "absolute inset-0 backdrop-blur-sm",
          isDark ? "bg-black/70" : "bg-black/40",
        ].join(" ")}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <motion.div
          initial={{ y: 20, opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={[
            "w-full overflow-hidden rounded-t-3xl border shadow-2xl sm:max-w-xl sm:rounded-3xl",
            isDark
              ? "border-white/10 bg-[#121212]/95 text-white"
              : "border-zinc-200 bg-white text-zinc-900",
          ].join(" ")}
        >
          <div
            className={`border-b px-6 py-5 ${
              isDark ? "border-white/10" : "border-zinc-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold">Editar vínculo da equipe</h3>
                <p
                  className={`mt-1 text-xs ${
                    isDark ? "text-white/50" : "text-zinc-500"
                  }`}
                >
                  Atualize papel e status do usuário.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone}`}
                  >
                    {statusAtual}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isDark
                        ? "border-white/10 bg-white/5 text-white/80"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {usuarioSelecionado?.papel || "SEM PAPEL"}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                ].join(" ")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            {erro && (
              <div
                className={[
                  "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm",
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700",
                ].join(" ")}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <div
              className={`rounded-2xl border p-4 ${
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <p className="font-bold">
                {usuarioSelecionado?.nome || usuarioSelecionado?.username}
              </p>
              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-white/50" : "text-zinc-500"
                }`}
              >
                {usuarioSelecionado?.email || "Sem email"}
              </p>
              <p
                className={`mt-1 text-xs ${
                  isDark ? "text-white/40" : "text-zinc-400"
                }`}
              >
                Usuário #{usuarioSelecionado?.id} · vínculo #{usuarioSelecionado?.usuarioEmpresaId}
              </p>
            </div>

            <div>
              <FieldLabel label="Papel na empresa" isDark={isDark} />
              <SelectField
                icon={<Shield className="h-4 w-4" />}
                value={usuarioSelecionado?.papel || "ATENDENTE"}
                onChange={(e) =>
                  setUsuarioSelecionado({
                    ...usuarioSelecionado,
                    papel: e.target.value,
                  })
                }
                options={PAPEL_OPTIONS}
                isDark={isDark}
              />
            </div>

            <div>
              <FieldLabel label="Status do usuário" isDark={isDark} />
              <SelectField
                icon={<ToggleLeft className="h-4 w-4" />}
                value={statusAtual}
                onChange={(e) =>
                  setUsuarioSelecionado({
                    ...usuarioSelecionado,
                    ativo: e.target.value === "ATIVO",
                  })
                }
                options={STATUS_OPTIONS}
                isDark={isDark}
              />
            </div>
          </div>

          <div
            className={`flex justify-end gap-3 border-t px-6 py-4 ${
              isDark ? "border-white/10" : "border-zinc-100"
            }`}
          >
            <button
              onClick={onClose}
              disabled={loading}
              className={[
                "h-10 rounded-xl px-4 font-bold transition",
                isDark
                  ? "border border-white/10 bg-white/5 hover:bg-white/10"
                  : "bg-zinc-100 hover:bg-zinc-200",
                loading ? "opacity-50" : "",
              ].join(" ")}
            >
              Cancelar
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-5 font-bold text-white shadow-lg transition hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FieldLabel = ({ label, isDark }) => (
  <p
    className={`mb-2 text-xs font-bold ${
      isDark ? "text-white/70" : "text-zinc-700"
    }`}
  >
    {label}
  </p>
);

const SelectField = ({ icon, value, onChange, options, isDark }) => (
  <div
    className={[
      "flex h-11 items-center gap-2 rounded-xl border px-3 transition",
      isDark
        ? "border-white/10 bg-white/5 focus-within:border-[#E5252A]/40"
        : "border-zinc-200 bg-white focus-within:border-red-300",
    ].join(" ")}
  >
    <span className="text-[#E5252A]">{icon}</span>

    <select
      value={value}
      onChange={onChange}
      className={`flex-1 bg-transparent text-sm outline-none ${
        isDark ? "text-white" : "text-zinc-900"
      }`}
    >
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
          className={isDark ? "bg-[#1a1a1a]" : "bg-white"}
        >
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default UsuarioModalEdicao;