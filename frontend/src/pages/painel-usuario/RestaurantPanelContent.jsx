import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Truck,
  PackageCheck,
  Image as ImageIcon,
  Clock3,
  Save,
  Eye,
  Upload,
  Building2,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const diasSemana = [
  { key: "domingo", label: "Dom" },
  { key: "segunda", label: "Seg" },
  { key: "terca", label: "Ter" },
  { key: "quarta", label: "Qua" },
  { key: "quinta", label: "Qui" },
  { key: "sexta", label: "Sex" },
  { key: "sabado", label: "Sáb" },
];

const buildInitialHorario = () => ({
  domingo: { aberto: false, inicio: "18:00", fim: "23:00" },
  segunda: { aberto: true, inicio: "18:00", fim: "23:00" },
  terca: { aberto: true, inicio: "18:00", fim: "23:00" },
  quarta: { aberto: true, inicio: "18:00", fim: "23:00" },
  quinta: { aberto: true, inicio: "18:00", fim: "23:00" },
  sexta: { aberto: true, inicio: "18:00", fim: "23:59" },
  sabado: { aberto: true, inicio: "18:00", fim: "23:59" },
});

const toMoneyInput = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const inputBase =
  "w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100";

const cardBase =
  "rounded-3xl border border-zinc-200 bg-white shadow-sm p-4 sm:p-5";

function gerarSlug(nome = "") {
  return String(nome)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-11 w-11 rounded-2xl bg-red-600 text-white grid place-items-center shadow-[0_12px_28px_rgba(220,38,38,0.22)]">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-zinc-600">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-extrabold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
      {hint ? <p className="text-xs text-zinc-500">{hint}</p> : null}
    </label>
  );
}

function PreviewIfoodCard({ form }) {
  const addressLine = [
    form?.logradouro,
    form?.numero ? `, ${form.numero}` : "",
    form?.bairro ? ` • ${form.bairro}` : "",
    form?.cidade ? ` • ${form.cidade}` : "",
    form?.uf ? `/${form.uf}` : "",
  ]
    .filter(Boolean)
    .join("");

  const horarioResumo = diasSemana
    .filter((dia) => form?.horarios?.[dia.key]?.aberto)
    .slice(0, 3)
    .map((dia) => {
      const h = form?.horarios?.[dia.key];
      return `${dia.label} ${h?.inicio}–${h?.fim}`;
    })
    .join(" · ");

  return (
    <div className="rounded-[28px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-red-600 via-red-500 to-orange-400 relative">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="px-4 pb-4 relative">
        <div className="-mt-10 flex items-end gap-3">
          <div className="h-20 w-20 rounded-3xl border-4 border-white bg-white shadow-sm overflow-hidden grid place-items-center">
            {form?.logoPreview || form?.logoUrl ? (
              <img
                src={form.logoPreview || form.logoUrl}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="w-8 h-8 text-zinc-400" />
            )}
          </div>

          <div className="pb-2 min-w-0">
            <h3 className="text-lg font-extrabold text-zinc-900 truncate">
              {form?.nomeFantasia || "Seu restaurante"}
            </h3>
            <p className="text-sm text-zinc-500 truncate">
              {form?.categoriaPreview || "Pizzaria • Lanches • Brasileira"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full border text-xs font-extrabold px-3 py-1.5 inline-flex items-center gap-1.5 ${
                form?.abertoAgora
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {form?.abertoAgora ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {form?.abertoAgora ? "Aberto agora" : "Fechado"}
            </span>

            <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold px-3 py-1.5">
              {form?.aceitaDelivery ? "Delivery" : "Sem delivery"}
            </span>

            <span className="rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-extrabold px-3 py-1.5">
              {form?.aceitaRetirada ? "Retirada" : "Sem retirada"}
            </span>

            <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold px-3 py-1.5">
              Pedido mínimo {formatCurrency(form?.pedidoMinimoDelivery || 0)}
            </span>
          </div>

          <div className="text-sm text-zinc-600 space-y-1">
            <p className="truncate">{addressLine || "Endereço do restaurante"}</p>
            <p className="truncate">
              {horarioResumo || "Defina os horários de funcionamento"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantPanelContent({ empresa, actions }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL_RAW = import.meta.env.VITE_API_URL || "";
  const base = API_URL_RAW.replace(/\/$/, "");
  const API_URL = base.endsWith("/api") ? base : `${base}/api`;

  useEffect(() => {
    if (!empresa) return;

    let horarios = buildInitialHorario();

    console.log(empresa)

    if (empresa?.horariosFuncionamento) {
      try {
        const parsed =
          typeof empresa.horariosFuncionamento === "string"
            ? JSON.parse(empresa.horariosFuncionamento)
            : empresa.horariosFuncionamento;

        horarios = { ...horarios, ...parsed };
      } catch {
        horarios = buildInitialHorario();
      }
    }

    setForm({
      ...empresa,
      slug: empresa?.slug || gerarSlug(empresa?.nomeFantasia || ""),
      logoUrl: empresa?.logoUrl || "",
      logoPreview: "",
      logoFile: null,
      categoriaPreview: empresa?.categoriaPreview || "",
      horarios,
      taxaEntregaFixa: toMoneyInput(empresa?.taxaEntregaFixa),
      pedidoMinimoDelivery: toMoneyInput(empresa?.pedidoMinimoDelivery),
      valorPorKm: toMoneyInput(empresa?.valorPorKm),
      valorFreteGratis: toMoneyInput(empresa?.valorFreteGratis),
      raioEntregaKm: toMoneyInput(empresa?.raioEntregaKm),
    });
  }, [empresa]);

  const enderecoResumo = useMemo(() => {
    const parts = [
      form?.logradouro,
      form?.numero ? `, ${form.numero}` : "",
      form?.bairro ? ` • ${form.bairro}` : "",
      form?.cidade ? ` • ${form.cidade}` : "",
      form?.uf ? `/${form.uf}` : "",
      form?.cep ? ` • ${form.cep}` : "",
    ].filter(Boolean);

    return parts.length ? parts.join("") : "Endereço não informado";
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "nomeFantasia" && (!prev.slug || prev.slug === gerarSlug(prev.nomeFantasia || ""))) {
        next.slug = gerarSlug(value);
      }

      return next;
    });
  };

  const handleHorarioChange = (dia, field, value) => {
    setForm((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios?.[dia],
          [field]: value,
        },
      },
    }));
  };

  const handleLogoSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: preview,
    }));
  };

  const salvar = async () => {
    if (!empresa?.id) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      let uploadedLogoUrl = form.logoUrl || "";

      if (form.logoFile) {
        const formData = new FormData();
        formData.append("file", form.logoFile);

        const resLogo = await fetch(`${API_URL}/empresas/${empresa.id}/logo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!resLogo.ok) {
          const text = await resLogo.text().catch(() => "");
          throw new Error(text || "Erro ao enviar logo");
        }

        const dataLogo = await resLogo.json().catch(() => null);
        uploadedLogoUrl = dataLogo?.logoUrl || uploadedLogoUrl;

        setForm((prev) => ({
          ...prev,
          logoUrl: uploadedLogoUrl,
          logoPreview: "",
          logoFile: null,
        }));
      }

      const payload = {
        nomeFantasia: form.nomeFantasia || "",
        razaoSocial: form.razaoSocial || "",
        cnpj: form.cnpj || "",
        slug: form.slug || gerarSlug(form.nomeFantasia || ""),
        email: form.email || "",
        telefone: form.telefone || "",
        cep: form.cep || "",
        logradouro: form.logradouro || "",
        numero: form.numero || "",
        bairro: form.bairro || "",
        cidade: form.cidade || "",
        complemento: form.complemento || "",
        uf: form.uf || "",
        aceitaRetirada: Boolean(form.aceitaRetirada),
        aceitaDelivery: Boolean(form.aceitaDelivery),
        raioEntregaKm: toNumberOrNull(form.raioEntregaKm),
        taxaEntregaFixa: toNumberOrNull(form.taxaEntregaFixa),
        valorPorKm: toNumberOrNull(form.valorPorKm),
        pedidoMinimoDelivery: toNumberOrNull(form.pedidoMinimoDelivery),
        valorFreteGratis: toNumberOrNull(form.valorFreteGratis),

        logoUrl: uploadedLogoUrl || form.logoUrl || "",
        categoriaPreview: form.categoriaPreview || "",
        horariosFuncionamento: form.horarios,
      };

      const res = await fetch(`${API_URL}/empresas/${empresa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao salvar dados da empresa");
      }

      actions?.reload?.();
      alert("Dados do restaurante atualizados com sucesso.");
    } catch (error) {
      console.error(error);
      alert(error?.message || "Não foi possível salvar os dados do restaurante.");
    } finally {
      setSaving(false);
    }
  };

  if (!empresa) return null;

  return (
    <section className="space-y-4">
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className={cardBase}
      >
        <SectionHeader
          icon={Store}
          title="Perfil do restaurante"
          description="Edite dados públicos, endereço, entrega, horários e veja uma prévia de como seu restaurante aparece para o cliente."
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="space-y-4"
        >
          <div className={cardBase}>
            <SectionHeader
              icon={Building2}
              title="Dados principais"
              description="Informações institucionais e de contato do restaurante."
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome fantasia">
                <input
                  className={inputBase}
                  value={form.nomeFantasia || ""}
                  onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                  placeholder="Ex.: Pizzaria do Bairro"
                />
              </Field>

              <Field label="Razão social">
                <input
                  className={inputBase}
                  value={form.razaoSocial || ""}
                  onChange={(e) => handleChange("razaoSocial", e.target.value)}
                  placeholder="Razão social da empresa"
                />
              </Field>

              <Field label="CNPJ">
                <input
                  className={inputBase}
                  value={form.cnpj || ""}
                  onChange={(e) => handleChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </Field>

              <Field label="Slug" hint="Usado na URL pública do restaurante.">
                <input
                  className={inputBase}
                  value={form.slug || ""}
                  onChange={(e) => handleChange("slug", gerarSlug(e.target.value))}
                  placeholder="pizzaria-do-bairro"
                />
              </Field>

              <Field label="Telefone">
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    className={`${inputBase} pl-11`}
                    value={form.telefone || ""}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    placeholder="(85) 99999-9999"
                  />
                </div>
              </Field>

              <Field label="E-mail">
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    className={`${inputBase} pl-11`}
                    value={form.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contato@restaurante.com"
                  />
                </div>
              </Field>

              <Field label="Categoria destaque" hint="Usado na prévia pública.">
                <input
                  className={inputBase}
                  value={form.categoriaPreview || ""}
                  onChange={(e) => handleChange("categoriaPreview", e.target.value)}
                  placeholder="Pizza • Massas • Lanches"
                />
              </Field>
            </div>
          </div>

          <div className={cardBase}>
            <SectionHeader
              icon={MapPin}
              title="Endereço"
              description="Essas informações ajudam o cliente a localizar o restaurante e calculam a entrega."
            />

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="CEP">
                <input
                  className={inputBase}
                  value={form.cep || ""}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </Field>

              <Field label="UF">
                <input
                  className={inputBase}
                  value={form.uf || ""}
                  onChange={(e) => handleChange("uf", e.target.value)}
                  placeholder="CE"
                />
              </Field>

              <Field label="Logradouro">
                <input
                  className={inputBase}
                  value={form.logradouro || ""}
                  onChange={(e) => handleChange("logradouro", e.target.value)}
                  placeholder="Rua / Avenida"
                />
              </Field>

              <Field label="Número">
                <input
                  className={inputBase}
                  value={form.numero || ""}
                  onChange={(e) => handleChange("numero", e.target.value)}
                  placeholder="123"
                />
              </Field>

              <Field label="Bairro">
                <input
                  className={inputBase}
                  value={form.bairro || ""}
                  onChange={(e) => handleChange("bairro", e.target.value)}
                  placeholder="Centro"
                />
              </Field>

              <Field label="Cidade">
                <input
                  className={inputBase}
                  value={form.cidade || ""}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  placeholder="Fortaleza"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Complemento">
                  <input
                    className={inputBase}
                    value={form.complemento || ""}
                    onChange={(e) => handleChange("complemento", e.target.value)}
                    placeholder="Ponto de referência, bloco, sala..."
                  />
                </Field>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              {enderecoResumo}
            </div>
          </div>

          <div className={cardBase}>
            <SectionHeader
              icon={Truck}
              title="Configurações de entrega"
              description="Defina como o restaurante trabalha com delivery e retirada."
            />

            <div className="mt-5 flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.aceitaDelivery)}
                  onChange={(e) => handleChange("aceitaDelivery", e.target.checked)}
                />
                <Truck className="w-4 h-4 text-red-600" />
                Aceita delivery
              </label>

              <label className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                <input
                  type="checkbox"
                  checked={Boolean(form.aceitaRetirada)}
                  onChange={(e) => handleChange("aceitaRetirada", e.target.checked)}
                />
                <PackageCheck className="w-4 h-4 text-red-600" />
                Aceita retirada
              </label>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Field label="Taxa fixa de entrega">
                <div className="relative">
                  <BadgeDollarSign className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    className={`${inputBase} pl-11`}
                    value={form.taxaEntregaFixa ?? ""}
                    onChange={(e) => handleChange("taxaEntregaFixa", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field label="Pedido mínimo delivery">
                <input
                  type="number"
                  className={inputBase}
                  value={form.pedidoMinimoDelivery ?? ""}
                  onChange={(e) => handleChange("pedidoMinimoDelivery", e.target.value)}
                  placeholder="0.00"
                />
              </Field>

              <Field label="Valor por KM">
                <input
                  type="number"
                  className={inputBase}
                  value={form.valorPorKm ?? ""}
                  onChange={(e) => handleChange("valorPorKm", e.target.value)}
                  placeholder="0.00"
                />
              </Field>

              <Field label="Raio máximo de entrega (km)">
                <input
                  type="number"
                  className={inputBase}
                  value={form.raioEntregaKm ?? ""}
                  onChange={(e) => handleChange("raioEntregaKm", e.target.value)}
                  placeholder="5"
                />
              </Field>

              <Field label="Frete grátis a partir de">
                <input
                  type="number"
                  className={inputBase}
                  value={form.valorFreteGratis ?? ""}
                  onChange={(e) => handleChange("valorFreteGratis", e.target.value)}
                  placeholder="0.00"
                />
              </Field>
            </div>
          </div>

          <div className={cardBase}>
            <SectionHeader
              icon={Clock3}
              title="Horário de funcionamento"
              description="Configure abertura e fechamento por dia da semana."
            />

            <div className="mt-5 space-y-3">
              {diasSemana.map((dia) => {
                const atual = form?.horarios?.[dia.key] || {
                  aberto: false,
                  inicio: "18:00",
                  fim: "23:00",
                };

                return (
                  <div
                    key={dia.key}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-4"
                  >
                    <div className="w-24 shrink-0">
                      <p className="font-extrabold text-zinc-900">{dia.label}</p>
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">
                      <input
                        type="checkbox"
                        checked={Boolean(atual.aberto)}
                        onChange={(e) =>
                          handleHorarioChange(dia.key, "aberto", e.target.checked)
                        }
                      />
                      Aberto
                    </label>

                    <div className="flex flex-1 gap-3">
                      <input
                        type="time"
                        className={inputBase}
                        disabled={!atual.aberto}
                        value={atual.inicio || "18:00"}
                        onChange={(e) =>
                          handleHorarioChange(dia.key, "inicio", e.target.value)
                        }
                      />

                      <input
                        type="time"
                        className={inputBase}
                        disabled={!atual.aberto}
                        value={atual.fim || "23:00"}
                        onChange={(e) =>
                          handleHorarioChange(dia.key, "fim", e.target.value)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="space-y-4"
        >
          <div className={cardBase}>
            <SectionHeader
              icon={ImageIcon}
              title="Logo da empresa"
              description="Envie uma imagem quadrada para representar seu restaurante."
            />

            <div className="mt-5 space-y-4">
              <div className="h-40 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 overflow-hidden grid place-items-center">
                {form?.logoPreview || form?.logoUrl ? (
                  <img
                    src={form.logoPreview || form.logoUrl}
                    alt="Logo do restaurante"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-sm text-zinc-500 mt-2">
                      Nenhuma logo enviada
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-extrabold text-zinc-800 hover:bg-zinc-50 transition"
              >
                <Upload className="w-4 h-4" />
                Selecionar logo
              </button>
            </div>
          </div>

          <div className={cardBase}>
            <SectionHeader
              icon={Eye}
              title="Prévia do cliente"
              description="Veja como o restaurante pode aparecer para quem acessa seu cardápio."
            />

            <div className="mt-5">
              <PreviewIfoodCard form={form} />
            </div>
          </div>

          <div className={cardBase}>
            <div className="space-y-3">
              <button
                onClick={salvar}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-70 text-white px-5 py-3 font-extrabold transition"
              >
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>

              <button
                onClick={actions?.goDashboard}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 px-5 py-3 text-zinc-800 font-extrabold transition"
              >
                <Store className="w-4 h-4" />
                Ir para o Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}