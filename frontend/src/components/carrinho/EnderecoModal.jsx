function EnderecoModal({ modal, onClose, onSave, onEdit, onDelete, apiUrl }) {
  const { showNotification } = useNotification();

  const [form, setForm] = useState(() => ({
    logradouro: modal?.data?.logradouro || "",
    numero: modal?.data?.numero || "",
    complemento: modal?.data?.complemento || "",
    bairro: modal?.data?.bairro || "",
    cidade: modal?.data?.cidade || "",
    uf: modal?.data?.uf || "",
    cep: modal?.data?.cep || "",
    id: modal?.data?.id,
  }));

  const [loadingCep, setLoadingCep] = useState(false);

  const isDelete = modal.type === "delete";
  const isEdit = modal.type === "edit";

  const title =
    modal.type === "add"
      ? "Novo endereço"
      : modal.type === "edit"
      ? "Editar endereço"
      : "Excluir endereço";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
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
    if (isDelete) return onDelete(modal.data.id);

    const payload = {
      ...form,
      cep: fmtCep(form.cep),
      uf: String(form.uf || "").toUpperCase(),
    };

    if (isEdit) onEdit(payload);
    else onSave(payload);
  };

  const InputBase =
    "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition";
  const Focus = "focus:ring-2 focus:ring-red-500/25 focus:border-red-300";

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

      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          className={[
            "w-full sm:max-w-xl",
            "bg-white text-zinc-900",
            "rounded-t-3xl sm:rounded-3xl",
            "shadow-2xl overflow-hidden",
            "max-h-[92vh] sm:max-h-[85vh]",
            "flex flex-col",
          ].join(" ")}
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-100">
            <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold">{title}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {isDelete
                    ? "Essa ação não pode ser desfeita."
                    : "Preencha os dados para salvar e usar no pedido."}
                </p>
              </div>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
              >
                <X className="h-5 w-5 text-zinc-700" />
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 overflow-auto">
            {isDelete ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white border border-red-200 grid place-items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-zinc-900">
                    Confirmar exclusão
                  </p>
                  <p className="text-sm text-zinc-700 mt-1">
                    Você está prestes a excluir{" "}
                    <span className="font-semibold">
                      {modal.data.logradouro}, {modal.data.numero}
                    </span>
                    .
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.cep.label}
                  </label>
                  <input
                    value={form.cep}
                    onChange={(e) => {
                      const value = fmtCep(e.target.value);
                      setForm((p) => ({ ...p, cep: value }));
                      if (onlyDigits(value).length === 8) buscarCep(value);
                    }}
                    className={[InputBase, Focus].join(" ")}
                    placeholder={labels.cep.placeholder}
                    inputMode="numeric"
                    maxLength={9}
                  />
                  {loadingCep ? (
                    <p className="text-xs text-zinc-500 mt-1">Buscando CEP...</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-semibold text-zinc-800">
                    {labels.uf.label}
                  </label>
                  <input
                    value={form.uf}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        uf: e.target.value.toUpperCase().slice(0, 2),
                      }))
                    }
                    className={[InputBase, Focus].join(" ")}
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
                      setForm((p) => ({ ...p, logradouro: e.target.value }))
                    }
                    className={[InputBase, Focus].join(" ")}
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
                      setForm((p) => ({ ...p, numero: e.target.value }))
                    }
                    className={[InputBase, Focus].join(" ")}
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
                      setForm((p) => ({ ...p, bairro: e.target.value }))
                    }
                    className={[InputBase, Focus].join(" ")}
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
                      setForm((p) => ({ ...p, cidade: e.target.value }))
                    }
                    className={[InputBase, Focus].join(" ")}
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
                      setForm((p) => ({ ...p, complemento: e.target.value }))
                    }
                    className={[InputBase, Focus].join(" ")}
                    placeholder={labels.complemento.placeholder}
                  />
                </div>
              </div>
            )}

            <div className="h-24 sm:h-0" />
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-zinc-100">
            <div className="px-4 sm:px-6 py-4 flex items-center gap-3">
              <button
                onClick={onClose}
                className="hidden sm:inline-flex px-4 py-3 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-semibold text-zinc-900"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={[
                  "w-full inline-flex items-center justify-center gap-2",
                  "px-5 py-3 rounded-2xl font-semibold transition",
                  !canSubmit
                    ? "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-500 shadow-[0_14px_30px_rgba(239,68,68,0.15)]",
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