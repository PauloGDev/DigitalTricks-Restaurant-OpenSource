import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import {
  AlertTriangle,
  Check,
  Home,
  PencilLine,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const labels = {
  logradouro: { label: "Rua", placeholder: "Ex: Av. Santos Dumont" },
  numero: { label: "Número", placeholder: "Ex: 123" },
  complemento: {
    label: "Complemento",
    placeholder: "Apto, bloco, referência (opcional)",
  },
  bairro: { label: "Bairro", placeholder: "Ex: Aldeota" },
  cidade: { label: "Cidade", placeholder: "Ex: Fortaleza" },
  uf: { label: "UF", placeholder: "Ex: CE" },
  cep: { label: "CEP", placeholder: "Ex: 60150-161" },
};

const fmtCep = (v = "") =>
  v.replace(/[^\d]/g, "").replace(/^(\d{5})(\d)/, "$1-$2");

const onlyDigits = (v = "") => v.replace(/[^\d]/g, "");

function EnderecoModal({ modal, onClose, onSave, onEdit, onDelete, apiUrl }) {
  const { showNotification } = useNotification();

  const [form, setForm] = useState(() => ({
    id: modal?.data?.id ?? null,
    logradouro: modal?.data?.logradouro ?? "",
    numero: modal?.data?.numero ?? "",
    complemento: modal?.data?.complemento ?? "",
    bairro: modal?.data?.bairro ?? "",
    cidade: modal?.data?.cidade ?? "",
    uf: modal?.data?.uf ?? "",
    cep: modal?.data?.cep ?? "",
  }));

  const [loadingCep, setLoadingCep] = useState(false);

  const isDelete = modal?.type === "delete";
  const isEdit = modal?.type === "edit";

  const title =
    modal?.type === "add"
      ? "Novo endereço"
      : modal?.type === "edit"
      ? "Editar endereço"
      : "Excluir endereço";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const buscarCep = async (cep) => {
    const cepLimpo = onlyDigits(cep);
    if (cepLimpo.length !== 8) return;

    try {
      setLoadingCep(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${apiUrl}/cep/${cepLimpo}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        cep: data.cep || prev.cep,
        logradouro: prev.logradouro || data.logradouro || "",
        bairro: prev.bairro || data.bairro || "",
        cidade: prev.cidade || data.localidade || "",
        uf: prev.uf || data.uf || "",
        complemento: prev.complemento || data.complemento || "",
      }));
    } catch {
      showNotification("Não foi possível localizar o CEP.", "error");
    } finally {
      setLoadingCep(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (isDelete) return true;

    const cepOk = onlyDigits(form.cep).length === 8;
    const cidadeOk = String(form.cidade || "").trim().length >= 2;
    const ufOk = String(form.uf || "").trim().length === 2;
    const logOk = String(form.logradouro || "").trim().length >= 3;
    const numOk = String(form.numero || "").trim().length >= 1;
    const bairroOk = String(form.bairro || "").trim().length >= 2;

    return cepOk && cidadeOk && ufOk && logOk && numOk && bairroOk;
  }, [form, isDelete]);

  const handleSubmit = () => {
    if (isDelete) {
      onDelete(modal.data.id);
      return;
    }

    const payload = {
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento || "",
      bairro: form.bairro,
      cidade: form.cidade,
      uf: String(form.uf || "").toUpperCase(),
      cep: fmtCep(form.cep),
    };

    if (isEdit) onEdit({ ...payload, id: form.id });
    else onSave(payload);
  };

  const inputBase =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition";
  const focusClass = "focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

  return (
    <div className="fixed inset-0 z-[999]">
      <motion.div
        className="absolute inset-0 bg-black/55"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-0 flex items-end justify-center p-0 sm:items-center sm:p-4">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white text-zinc-900 shadow-2xl sm:max-h-[85vh] sm:max-w-xl sm:rounded-3xl"
        >
          <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/95 backdrop-blur">
            <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6">
              <div>
                <h3 className="text-base font-extrabold sm:text-lg">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {isDelete
                    ? "Essa ação não pode ser desfeita."
                    : "Preencha os dados para salvar e usar no pedido."}
                </p>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-50"
              >
                <X className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
          </div>

          <div className="overflow-auto px-4 py-4 sm:px-6">
            {isDelete ? (
              <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-200 bg-white">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-extrabold text-zinc-900">
                    Confirmar exclusão
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">
                    Você está prestes a excluir{" "}
                    <span className="font-semibold">
                      {modal.data.logradouro}, {modal.data.numero}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.cep.label}
                  </label>
                  <input
                    value={form.cep}
                    onChange={(e) => {
                      const value = fmtCep(e.target.value);
                      setForm((prev) => ({ ...prev, cep: value }));
                      if (onlyDigits(value).length === 8) buscarCep(value);
                    }}
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.cep.placeholder}
                    inputMode="numeric"
                    maxLength={9}
                  />
                  {loadingCep ? (
                    <p className="mt-1 text-xs text-zinc-500">Buscando CEP...</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.uf.label}
                  </label>
                  <input
                    value={form.uf}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        uf: e.target.value.toUpperCase().slice(0, 2),
                      }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.uf.placeholder}
                    maxLength={2}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.logradouro.label}
                  </label>
                  <input
                    value={form.logradouro}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, logradouro: e.target.value }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.logradouro.placeholder}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.numero.label}
                  </label>
                  <input
                    value={form.numero}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, numero: e.target.value }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.numero.placeholder}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.bairro.label}
                  </label>
                  <input
                    value={form.bairro}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bairro: e.target.value }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.bairro.placeholder}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.cidade.label}
                  </label>
                  <input
                    value={form.cidade}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, cidade: e.target.value }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.cidade.placeholder}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.complemento.label}
                  </label>
                  <input
                    value={form.complemento}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        complemento: e.target.value,
                      }))
                    }
                    className={`${inputBase} ${focusClass}`}
                    placeholder={labels.complemento.placeholder}
                  />
                </div>
              </div>
            )}

            <div className="h-24 sm:h-0" />
          </div>

          <div className="sticky bottom-0 z-10 border-t border-zinc-100 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <button
                onClick={onClose}
                type="button"
                className="hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:inline-flex"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                type="button"
                className={[
                  "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold transition",
                  !canSubmit
                    ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400"
                    : "bg-red-600 text-white shadow-[0_14px_30px_rgba(239,68,68,0.15)] hover:bg-red-500",
                ].join(" ")}
              >
                {isDelete ? (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Excluir endereço
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Salvar endereço
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AddressSelector({ onSelect }) {
  const { showNotification } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL;

  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = (withJson = false) => {
    const token = localStorage.getItem("token");

    return {
      ...(withJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const parseErrorResponse = async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      return data?.message || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const fetchEnderecos = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/enderecos/me`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const message = await parseErrorResponse(
          response,
          "Erro ao carregar endereços."
        );
        throw new Error(message);
      }

      const data = await response.json();
      const lista = Array.isArray(data) ? data : [];

      setEnderecos(lista);

      if (lista.length > 0) {
        const padrao = lista.find((e) => e.padrao) || lista[0];
        setEnderecoSelecionado(padrao);
        onSelect?.(padrao);
      } else {
        setEnderecoSelecionado(null);
        onSelect?.(null);
      }
    } catch (error) {
      console.error("Erro ao carregar endereços:", error);
      setEnderecos([]);
      setEnderecoSelecionado(null);
      onSelect?.(null);
      showNotification(error.message || "Erro ao carregar endereços.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnderecos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (endereco) => {
    setEnderecoSelecionado(endereco);
    onSelect?.(endereco);
  };

  const handleDefinirPadrao = async (endereco) => {
    try {
      const response = await fetch(`${API_URL}/enderecos/${endereco.id}/padrao`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const message = await parseErrorResponse(
          response,
          "Erro ao definir endereço padrão."
        );
        throw new Error(message);
      }

      const atualizado = await response.json();

      setEnderecos((prev) =>
        prev.map((e) =>
          e.id === atualizado.id
            ? { ...e, ...atualizado, padrao: true }
            : { ...e, padrao: false }
        )
      );

      const novoSelecionado =
        enderecoSelecionado?.id === atualizado.id
          ? { ...enderecoSelecionado, ...atualizado, padrao: true }
          : enderecoSelecionado;

      setEnderecoSelecionado(novoSelecionado);
      showNotification("Endereço padrão atualizado!", "success");
    } catch (error) {
      console.error("Erro ao definir endereço padrão:", error);
      showNotification(
        error.message || "Erro ao definir endereço padrão.",
        "error"
      );
    }
  };

  const handleSalvarEndereco = async (data) => {
    try {
      const payload = {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || "",
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: data.cep,
      };

      const response = await fetch(`${API_URL}/enderecos`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseErrorResponse(
          response,
          "Erro ao adicionar endereço."
        );
        throw new Error(message);
      }

      const salvo = await response.json();

      setEnderecos((prev) => {
        const lista = [...prev, salvo];

        if (lista.length === 1 || salvo.padrao) {
          setEnderecoSelecionado(salvo);
          onSelect?.(salvo);
        }

        return lista;
      });

      setModal(null);
      showNotification("Endereço adicionado!", "success");
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      showNotification(error.message || "Erro ao adicionar endereço.", "error");
    }
  };

  const handleEditarEndereco = async (data) => {
    try {
      const payload = {
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento || "",
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        cep: data.cep,
      };

      const response = await fetch(`${API_URL}/enderecos/${data.id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseErrorResponse(
          response,
          "Erro ao editar endereço."
        );
        throw new Error(message);
      }

      const atualizado = await response.json();

      setEnderecos((prev) =>
        prev.map((e) => (e.id === atualizado.id ? { ...e, ...atualizado } : e))
      );

      if (enderecoSelecionado?.id === atualizado.id) {
        const merged = { ...enderecoSelecionado, ...atualizado };
        setEnderecoSelecionado(merged);
        onSelect?.(merged);
      }

      setModal(null);
      showNotification("Endereço atualizado!", "success");
    } catch (error) {
      console.error("Erro ao editar endereço:", error);
      showNotification(error.message || "Erro ao editar endereço.", "error");
    }
  };

  const handleExcluirEndereco = async (id) => {
    try {
      const response = await fetch(`${API_URL}/enderecos/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const message = await parseErrorResponse(
          response,
          "Erro ao excluir endereço."
        );
        throw new Error(message);
      }

      const restantes = enderecos.filter((e) => e.id !== id);
      setEnderecos(restantes);

      if (enderecoSelecionado?.id === id) {
        const novoSelecionado =
          restantes.find((e) => e.padrao) || restantes[0] || null;
        setEnderecoSelecionado(novoSelecionado);
        onSelect?.(novoSelecionado);
      }

      setModal(null);
      showNotification("Endereço excluído!", "success");
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      showNotification(error.message || "Erro ao excluir endereço.", "error");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="text-sm text-zinc-600">Carregando endereços...</p>
      </div>
    );
  }

  const vazio = enderecos.length === 0;

  return (
    <div>
      {vazio ? (
        <div className="flex items-start gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-white">
            <Home className="h-5 w-5 text-zinc-700" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-extrabold text-zinc-900">
              Nenhum endereço cadastrado
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Adicione um endereço para continuar.
            </p>

            <button
              onClick={() => setModal({ type: "add" })}
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-500"
            >
              <Plus className="h-5 w-5" />
              Adicionar endereço
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {enderecos.map((endereco) => {
              const active = enderecoSelecionado?.id === endereco.id;

              return (
                <motion.div
                  key={endereco.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(endereco)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(endereco);
                    }
                  }}
                  className={[
                    "w-full cursor-pointer rounded-3xl border p-5 text-left transition",
                    "bg-white hover:bg-zinc-50",
                    active
                      ? "border-red-200 ring-2 ring-red-500/30"
                      : "border-zinc-200",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-extrabold text-zinc-900">
                        {endereco.logradouro}, {endereco.numero}
                      </p>

                      {endereco.complemento ? (
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-600">
                          {endereco.complemento}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-zinc-500">
                          Sem complemento
                        </p>
                      )}

                      <p className="mt-2 text-sm text-zinc-600">
                        {endereco.bairro} • {endereco.cidade}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        CEP {endereco.cep}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({ type: "edit", data: endereco });
                        }}
                        className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-50"
                      >
                        <PencilLine className="h-4 w-4 text-zinc-700" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({ type: "delete", data: endereco });
                        }}
                        className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {endereco.padrao ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                        <Star className="h-4 w-4" />
                        Endereço padrão
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDefinirPadrao(endereco);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-50"
                      >
                        <Star className="h-4 w-4 text-zinc-500" />
                        Tornar padrão
                      </button>
                    )}

                    {active ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                        <Check className="h-4 w-4" />
                        Selecionado
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">
                        Toque para selecionar
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-5">
            <button
              onClick={() => setModal({ type: "add" })}
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(239,68,68,0.15)] transition hover:bg-red-500 sm:w-auto"
            >
              <Plus className="h-5 w-5" />
              Adicionar novo endereço
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {modal && (
          <EnderecoModal
            modal={modal}
            onClose={() => setModal(null)}
            onSave={handleSalvarEndereco}
            onEdit={handleEditarEndereco}
            onDelete={handleExcluirEndereco}
            apiUrl={API_URL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}