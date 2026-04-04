import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  X,
  Plus,
  Trash,
  Loader2,
  Image as ImageIcon,
  Check,
  Tag,
  Percent,
  BadgeDollarSign,
  Clock3,
  MessageSquareText,
  Layers3,
  Package,
  Sparkles,
} from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";
import ProdutoOpcionaisManager from "./ProductForm/ProdutoOpcionaisManager";

const money = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v || 0));

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const normalizeEmpresaId = (raw) => {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "number" || typeof parsed === "string") {
      return parsed;
    }

    if (parsed?.id !== undefined && parsed?.id !== null) {
      return parsed.id;
    }

    return raw;
  } catch {
    return raw;
  }
};

const toDatetimeLocal = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return "";
  }
};

const normalizeGrupoFromApi = (grupo, index) => ({
  id: grupo?.id ?? null,
  nome: grupo?.nome || "",
  descricao: grupo?.descricao || "",
  obrigatorio: !!grupo?.obrigatorio,
  minSelecionaveis:
    grupo?.minSelecionaveis !== null && grupo?.minSelecionaveis !== undefined
      ? Number(grupo.minSelecionaveis)
      : 0,
  maxSelecionaveis:
    grupo?.maxSelecionaveis !== null && grupo?.maxSelecionaveis !== undefined
      ? Number(grupo.maxSelecionaveis)
      : 0,
  tipoSelecao: grupo?.tipoSelecao || "SINGLE",
  ativo: grupo?.ativo !== false,
  ordem:
    grupo?.ordem !== null && grupo?.ordem !== undefined
      ? Number(grupo.ordem)
      : index + 1,
  tipoGrupo: grupo?.tipoGrupo || "OPCIONAL_SELECAO",
  itens: Array.isArray(grupo?.itens)
    ? grupo.itens.map((item, itemIndex) => ({
        id: item?.id ?? null,
        nome: item?.nome || "",
        precoExtra:
          item?.precoExtra !== null && item?.precoExtra !== undefined
            ? String(item.precoExtra)
            : "0",
        ativo: item?.ativo !== false,
        estoque:
          item?.estoque !== null && item?.estoque !== undefined
            ? String(item.estoque)
            : "",
        ordem:
          item?.ordem !== null && item?.ordem !== undefined
            ? Number(item.ordem)
            : itemIndex + 1,
      }))
    : [],
});

const normalizeGrupoToPayload = (grupo, index) => ({
  id: grupo.id || null,
  nome: String(grupo.nome || "").trim(),
  descricao: String(grupo.descricao || "").trim(),
  obrigatorio: !!grupo.obrigatorio,
  minSelecionaveis: Number(grupo.minSelecionaveis || 0),
  maxSelecionaveis: Number(grupo.maxSelecionaveis || 0),
  tipoSelecao: grupo.tipoSelecao || "SINGLE",
  ativo: grupo.ativo !== false,
  ordem: Number(grupo.ordem || index + 1),
  tipoGrupo: grupo.tipoGrupo || "OPCIONAL_SELECAO",
  itens: Array.isArray(grupo.itens)
    ? grupo.itens.map((item, itemIndex) => ({
        id: item.id || null,
        nome: String(item.nome || "").trim(),
        precoExtra: Number(item.precoExtra || 0),
        ativo: item.ativo !== false,
        estoque:
          item.estoque === "" || item.estoque === null || item.estoque === undefined
            ? null
            : Number(item.estoque),
        ordem: Number(item.ordem || itemIndex + 1),
      }))
    : [],
});

function SectionCard({ icon: Icon, title, subtitle, isDark, children, action }) {
  return (
    <div
      className={[
        "rounded-[28px] border p-4 sm:p-5 transition-colors duration-300",
        isDark
          ? "border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
          : "border-zinc-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-sm">
            <Icon className="h-5 w-5" />
          </span>

          <div>
            <h3 className={["text-base font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              {title}
            </h3>
            {subtitle ? (
              <p className={["mt-1 text-sm", isDark ? "text-white/50" : "text-zinc-600"].join(" ")}>
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {action ? <div>{action}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, children, hint, isDark }) {
  return (
    <div>
      <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className={["mt-1 text-xs", isDark ? "text-white/40" : "text-zinc-500"].join(" ")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Toggle({ checked, onChange, isDark, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={[
        "relative h-9 w-16 rounded-full border transition-all duration-300",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        checked
          ? "border-red-600 bg-red-600"
          : isDark
          ? "border-white/10 bg-white/10"
          : "border-zinc-300 bg-zinc-100",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-1 h-7 w-7 rounded-full shadow transition-all duration-300",
          checked
            ? "left-8 bg-white"
            : isDark
            ? "left-1 bg-white/70"
            : "left-1 bg-gray-700",
        ].join(" ")}
      />
    </button>
  );
}

const EditProductModal = ({ produto, onClose, onSaved }) => {
  const { showNotification } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL;

  const [theme, setTheme] = useState(getThemeState());
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [saving, setSaving] = useState(false);

  const empresaId = useMemo(
    () => normalizeEmpresaId(localStorage.getItem("empresaId")),
    []
  );

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    precoBase: 0,
    estoque: 0,
    imagemUrl: "",
    imagemFile: null,
    variacoes: [],
    categorias: [],
    permiteObservacao: true,
    maxObservacaoChars: 140,
    gruposOpcionais: [],
    emOferta: false,
    tipoDesconto: "PERCENTUAL",
    valorDesconto: "",
    tituloOferta: "",
    inicioOferta: "",
    fimOferta: "",
  });

  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    setFormData({
      nome: produto?.nome || "",
      descricao: produto?.descricao || "",
      precoBase: produto?.precoBase ?? 0,
      estoque: produto?.estoque ?? 0,
      imagemUrl: produto?.imagemUrl || "",
      imagemFile: null,
      variacoes: Array.isArray(produto?.variacoes)
        ? produto.variacoes.map((v) => ({
            id: v.id,
            nome: v.nome || "",
            preco: Number(v.preco || 0),
            estoque: Number(v.estoque || 0),
          }))
        : [],
      categorias: Array.isArray(produto?.categorias) ? produto.categorias : [],
      permiteObservacao:
        produto?.permiteObservacao !== undefined
          ? !!produto.permiteObservacao
          : true,
      maxObservacaoChars:
        produto?.maxObservacaoChars !== null &&
        produto?.maxObservacaoChars !== undefined
          ? Number(produto.maxObservacaoChars)
          : 140,
      gruposOpcionais: Array.isArray(produto?.gruposOpcionais)
        ? produto.gruposOpcionais.map(normalizeGrupoFromApi)
        : [],
      emOferta: !!produto?.emOferta,
      tipoDesconto: produto?.tipoDesconto || "PERCENTUAL",
      valorDesconto:
        produto?.valorDesconto !== null && produto?.valorDesconto !== undefined
          ? String(produto.valorDesconto)
          : "",
      tituloOferta: produto?.tituloOferta || "",
      inicioOferta: toDatetimeLocal(produto?.inicioOferta),
      fimOferta: toDatetimeLocal(produto?.fimOferta),
    });

    const categoriasProduto = Array.isArray(produto?.categorias) ? produto.categorias : [];
    setCategoriasDisponiveis((prev) =>
      [...new Set([...(prev || []), ...categoriasProduto])].sort((a, b) =>
        String(a).localeCompare(String(b), "pt-BR")
      )
    );
  }, [produto]);

  const setField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const temVariacoes = useMemo(
    () => Array.isArray(formData.variacoes) && formData.variacoes.length > 0,
    [formData.variacoes]
  );

  const precoBasePreview = useMemo(() => {
    if (!temVariacoes) return Number(formData.precoBase || 0);

    const precos = formData.variacoes
      .map((v) => Number(v?.preco || 0))
      .filter((n) => Number.isFinite(n) && n >= 0);

    return precos.length ? Math.min(...precos) : 0;
  }, [temVariacoes, formData.precoBase, formData.variacoes]);

  const precoFinalPreview = useMemo(() => {
    const base = Number(precoBasePreview || 0);
    if (!formData.emOferta) return base;

    const desconto = Number(formData.valorDesconto || 0);
    if (desconto <= 0) return base;

    if (formData.tipoDesconto === "PERCENTUAL") {
      return Math.max(base - base * (desconto / 100), 0);
    }

    return Math.max(base - desconto, 0);
  }, [
    precoBasePreview,
    formData.emOferta,
    formData.tipoDesconto,
    formData.valorDesconto,
  ]);

  const estoqueTotal = useMemo(() => {
    if (!temVariacoes) return Number(formData.estoque || 0);
    return formData.variacoes.reduce(
      (acc, v) => acc + (Number(v?.estoque) || 0),
      0
    );
  }, [temVariacoes, formData.estoque, formData.variacoes]);

  const inputClass = [
    "mt-1 w-full rounded-2xl border px-4 text-sm outline-none transition-all duration-300",
    "h-11",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:ring-2 focus:ring-red-500/20"
      : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-red-500/20",
  ].join(" ");

  const textareaClass = [
    "mt-1 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 focus:ring-2 focus:ring-red-500/20"
      : "border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-red-500/20",
  ].join(" ");

  const shellInputClass = [
    "mt-1 flex items-center h-11 rounded-2xl border px-3 transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white"
      : "border-zinc-200 bg-white text-zinc-900",
  ].join(" ");

  const subtleCardClass = [
    "rounded-2xl border p-3",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50",
  ].join(" ");

  const handleImageUpload = (file) => {
    if (!file) return;
    setField("imagemFile", file);

    const reader = new FileReader();
    reader.onloadend = () => setField("imagemUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const addVariacao = () => {
    setField("variacoes", [
      ...(formData.variacoes || []),
      { id: null, nome: "", preco: 0, estoque: 0 },
    ]);
  };

  const removeVariacao = (index) => {
    const newVars = [...(formData.variacoes || [])];
    newVars.splice(index, 1);
    setField("variacoes", newVars);
  };

  const updateVariacao = (index, patch) => {
    const newVars = [...(formData.variacoes || [])];
    newVars[index] = { ...newVars[index], ...patch };
    setField("variacoes", newVars);
  };

  const toggleCategoria = (categoriaNome) => {
    const listaAtual = Array.isArray(formData.categorias)
      ? formData.categorias
      : [];
    const atual = listaAtual.includes(categoriaNome);

    setField(
      "categorias",
      atual
        ? listaAtual.filter((c) => c !== categoriaNome)
        : [...listaAtual, categoriaNome]
    );
  };

  const handleAddCategoria = () => {
    const nome = novaCategoria.trim();
    if (!nome) {
      showNotification("Digite o nome da categoria.", "warning");
      return;
    }

    const listaAtual = Array.isArray(formData.categorias)
      ? formData.categorias
      : [];

    if (listaAtual.includes(nome)) {
      showNotification("Essa categoria já foi adicionada.", "warning");
      return;
    }

    setField("categorias", [...listaAtual, nome]);
    setCategoriasDisponiveis((prev) =>
      [...new Set([...(prev || []), nome])].sort((a, b) =>
        String(a).localeCompare(String(b), "pt-BR")
      )
    );

    setNovaCategoria("");
    showNotification("✅ Categoria adicionada!", "success");
  };

  const validate = () => {
    if (!empresaId) {
      showNotification("Empresa não identificada.", "error");
      return false;
    }

    if (!formData.nome.trim()) {
      showNotification("Informe o nome do produto.", "warning");
      return false;
    }

    if (!formData.descricao.trim()) {
      showNotification("Informe a descrição do produto.", "warning");
      return false;
    }

    if (!formData.categorias?.length) {
      showNotification("Selecione pelo menos 1 categoria.", "warning");
      return false;
    }

    if (temVariacoes) {
      const ok = formData.variacoes.every(
        (v) =>
          (v?.nome || "").trim() &&
          Number(v?.preco) >= 0 &&
          Number(v?.estoque) >= 0
      );
      if (!ok) {
        showNotification(
          "Preencha corretamente nome, preço e estoque das variações.",
          "warning"
        );
        return false;
      }
    } else {
      if (Number(formData.precoBase) <= 0) {
        showNotification("Defina um preço base maior que 0.", "warning");
        return false;
      }
      if (Number(formData.estoque) < 0) {
        showNotification("Estoque não pode ser negativo.", "warning");
        return false;
      }
    }

    if (formData.permiteObservacao && Number(formData.maxObservacaoChars) < 0) {
      showNotification("Limite de observação inválido.", "warning");
      return false;
    }

    if (formData.emOferta) {
      const desconto = Number(formData.valorDesconto);
      if (!formData.tipoDesconto) {
        showNotification("Selecione o tipo de desconto.", "warning");
        return false;
      }

      if (!desconto || desconto <= 0) {
        showNotification("Informe um valor de desconto válido.", "warning");
        return false;
      }

      if (formData.tipoDesconto === "PERCENTUAL" && desconto > 100) {
        showNotification(
          "Desconto percentual não pode ser maior que 100%.",
          "warning"
        );
        return false;
      }

      if (formData.inicioOferta && formData.fimOferta) {
        const inicio = new Date(formData.inicioOferta);
        const fim = new Date(formData.fimOferta);
        if (fim < inicio) {
          showNotification(
            "A data final da oferta não pode ser menor que a inicial.",
            "warning"
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const data = new FormData();

      const produtoPayload = {
        id: produto.id,
        ativo: produto?.ativo ?? true,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        categorias: formData.categorias,
        precoBase: temVariacoes ? null : Number(formData.precoBase || 0),
        estoque: temVariacoes ? null : Number(formData.estoque || 0),
        slug: produto?.slug ?? null,
        imagemUrl: formData.imagemFile ? null : produto?.imagemUrl ?? null,
        variacoes: temVariacoes
          ? formData.variacoes.map((v) => ({
              id: v.id ?? null,
              nome: String(v?.nome || "").trim(),
              preco: Number(v?.preco || 0),
              estoque: Number(v?.estoque || 0),
              precoPromocional: null,
            }))
          : [],
        pedidos: Number(produto?.pedidos || 0),
        precoMinimo: produto?.precoMinimo ?? null,
        gruposOpcionais: (formData.gruposOpcionais || []).map(
          normalizeGrupoToPayload
        ),
        permiteObservacao: !!formData.permiteObservacao,
        maxObservacaoChars: formData.permiteObservacao
          ? Number(formData.maxObservacaoChars || 0)
          : 0,
        emOferta: !!formData.emOferta,
        tipoDesconto: formData.emOferta ? formData.tipoDesconto : null,
        valorDesconto: formData.emOferta
          ? Number(formData.valorDesconto || 0)
          : null,
        tituloOferta: formData.emOferta
          ? String(formData.tituloOferta || "").trim() || null
          : null,
        inicioOferta:
          formData.emOferta && formData.inicioOferta
            ? `${formData.inicioOferta}:00`
            : null,
        fimOferta:
          formData.emOferta && formData.fimOferta
            ? `${formData.fimOferta}:00`
            : null,
        precoPromocional: produto?.precoPromocional ?? null,
        ofertaVigente: produto?.ofertaVigente ?? false,
      };

      data.append(
        "produto",
        new Blob([JSON.stringify(produtoPayload)], {
          type: "application/json",
        })
      );

      if (formData.imagemFile) {
        data.append("imagem", formData.imagemFile);
      }

      const res = await axios.put(
        `${API_URL}/api/empresas/${empresaId}/produtos/${produto.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showNotification("✅ Produto atualizado com sucesso!", "success");
      onSaved?.(res.data);
    } catch (err) {
      console.error(err);
      showNotification("❌ Não foi possível atualizar o produto", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-3 sm:p-6"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Editar produto"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={[
          "w-full max-w-6xl overflow-hidden rounded-3xl border shadow-2xl",
          isDark
            ? "border-white/10 bg-[#0F0F10] text-white"
            : "border-zinc-200 bg-zinc-50 text-zinc-900",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between border-b px-5 py-4 sm:px-6",
            isDark ? "border-white/10 bg-[#121212]" : "border-zinc-200 bg-white",
          ].join(" ")}
        >
          <div className="min-w-0">
            <h2 className={["truncate text-lg font-extrabold sm:text-xl", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              Editar prato
            </h2>
            <p className={["mt-0.5 text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
              Preço base:{" "}
              <span className="font-bold text-red-500">{money(precoBasePreview)}</span>{" "}
              • Preço final:{" "}
              <span className={["font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                {money(precoFinalPreview)}
              </span>{" "}
              • Estoque total:{" "}
              <span className={["font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                {estoqueTotal}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className={[
              "grid h-10 w-10 place-items-center rounded-2xl border transition",
              isDark
                ? "border-white/10 bg-white/5 hover:bg-white/10"
                : "border-zinc-200 bg-white hover:bg-zinc-100",
            ].join(" ")}
            aria-label="Fechar"
            disabled={saving}
          >
            <X className={["h-5 w-5", isDark ? "text-white/70" : "text-zinc-700"].join(" ")} />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-6 xl:col-span-1">
              <SectionCard
                icon={ImageIcon}
                title="Foto do prato"
                subtitle="Imagem principal do produto"
                isDark={isDark}
              >
                <div
                  className={[
                    "grid h-56 place-items-center overflow-hidden rounded-2xl border",
                    isDark
                      ? "border-white/10 bg-white/[0.03]"
                      : "border-zinc-200 bg-zinc-50",
                  ].join(" ")}
                >
                  {formData.imagemUrl ? (
                    <img
                      src={formData.imagemUrl}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className={["flex flex-col items-center gap-2", isDark ? "text-white/35" : "text-zinc-400"].join(" ")}>
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}
                </div>

                <label
                  className={[
                    "mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl font-extrabold text-white transition",
                    saving ? "bg-red-400/70 cursor-not-allowed" : "bg-red-600 hover:bg-red-500",
                  ].join(" ")}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    disabled={saving}
                  />
                  <Plus className="h-4 w-4" />
                  Trocar foto
                </label>
              </SectionCard>

              <SectionCard
                icon={Package}
                title="Informações"
                subtitle="Dados principais do produto"
                isDark={isDark}
              >
                <div className="space-y-4">
                  <Field label="Nome do prato" isDark={isDark}>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setField("nome", e.target.value)}
                      className={inputClass}
                      placeholder="Ex: Pizza Calabresa"
                      disabled={saving}
                    />
                  </Field>

                  <Field label="Descrição" isDark={isDark}>
                    <textarea
                      rows={5}
                      value={formData.descricao}
                      onChange={(e) => setField("descricao", e.target.value)}
                      className={textareaClass}
                      placeholder="Ex: molho, queijo, calabresa, cebola..."
                      disabled={saving}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                icon={Tag}
                title="Categorias"
                subtitle="Categorias vinculadas ao produto"
                isDark={isDark}
              >
                <div className="flex flex-wrap gap-2">
                  {categoriasDisponiveis.map((nome) => {
                    const isSelected = formData.categorias?.includes(nome);

                    return (
                      <button
                        key={nome}
                        type="button"
                        onClick={() => toggleCategoria(nome)}
                        disabled={saving}
                        className={[
                          "rounded-full border px-3 py-1.5 text-xs font-extrabold transition",
                          isSelected
                            ? "border-red-500 bg-red-600 text-white"
                            : isDark
                            ? "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1">
                            <Check className="h-4 w-4" /> {nome}
                          </span>
                        ) : (
                          nome
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Nova categoria"
                    className={`${inputClass} flex-1`}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategoria}
                    disabled={saving}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-500 px-4 font-extrabold text-white transition hover:bg-emerald-400"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6 xl:col-span-2">
              {!temVariacoes && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SectionCard
                    icon={BadgeDollarSign}
                    title="Preço base"
                    subtitle="Usado quando o produto não tem variações"
                    isDark={isDark}
                  >
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precoBase}
                      onChange={(e) =>
                        setField("precoBase", Number(e.target.value || 0))
                      }
                      className={inputClass}
                      disabled={saving}
                    />
                  </SectionCard>

                  <SectionCard
                    icon={Sparkles}
                    title="Estoque base"
                    subtitle="Quantidade disponível"
                    isDark={isDark}
                  >
                    <input
                      type="number"
                      value={formData.estoque}
                      onChange={(e) =>
                        setField("estoque", Number(e.target.value || 0))
                      }
                      className={inputClass}
                      disabled={saving}
                    />
                  </SectionCard>
                </div>
              )}

              <SectionCard
                icon={Layers3}
                title="Variações"
                subtitle="Tamanhos, sabores, combos e outras opções"
                isDark={isDark}
                action={
                  <button
                    type="button"
                    onClick={addVariacao}
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-2xl bg-red-600 px-4 font-extrabold text-white transition hover:bg-red-500"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </button>
                }
              >
                <div className="space-y-3">
                  {formData.variacoes?.length ? (
                    formData.variacoes.map((v, i) => (
                      <div key={v?.id ?? i} className={subtleCardClass}>
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="min-w-[220px] flex-1">
                            <label className={["mb-1 block text-xs font-bold", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                              Nome
                            </label>
                            <input
                              type="text"
                              value={v.nome ?? ""}
                              onChange={(e) =>
                                updateVariacao(i, { nome: e.target.value })
                              }
                              className={inputClass}
                              disabled={saving}
                            />
                          </div>

                          <div className="w-full min-w-[160px] sm:w-[170px]">
                            <label className={["mb-1 block text-xs font-bold", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                              Preço
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={v.preco ?? 0}
                              onChange={(e) =>
                                updateVariacao(i, {
                                  preco: Number(e.target.value || 0),
                                })
                              }
                              className={inputClass}
                              disabled={saving}
                            />
                          </div>

                          <div className="w-full min-w-[120px] sm:w-[140px]">
                            <label className={["mb-1 block text-xs font-bold", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                              Estoque
                            </label>
                            <input
                              type="number"
                              value={v.estoque ?? 0}
                              onChange={(e) =>
                                updateVariacao(i, {
                                  estoque: Number(e.target.value || 0),
                                })
                              }
                              className={inputClass}
                              disabled={saving}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeVariacao(i)}
                            disabled={saving}
                            className="grid h-11 w-11 place-items-center rounded-2xl bg-red-600 text-white transition hover:bg-red-500"
                            title="Remover variação"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>

                        <div className={["mt-2 flex flex-wrap items-center justify-between gap-2 text-xs", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
                          <span>
                            Preço:{" "}
                            <span className="font-bold text-red-500">
                              {money(v.preco)}
                            </span>
                          </span>
                          <span>
                            Estoque:{" "}
                            <span className={["font-bold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                              {Number(v.estoque || 0)}
                            </span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={["rounded-2xl border p-4 text-sm", isDark ? "border-white/10 bg-white/[0.03] text-white/50" : "border-zinc-200 bg-zinc-50 text-zinc-500"].join(" ")}>
                      Sem variações. Se tiver tamanhos ou sabores, adicione aqui.
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                icon={MessageSquareText}
                title="Observação do cliente"
                subtitle="Permita instruções personalizadas no pedido"
                isDark={isDark}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className={subtleCardClass}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                          Permitir observação?
                        </p>
                        <p className={["text-xs", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                          Ex: sem cebola, molho à parte, ponto da carne.
                        </p>
                      </div>

                      <Toggle
                        checked={formData.permiteObservacao}
                        onChange={() =>
                          setField("permiteObservacao", !formData.permiteObservacao)
                        }
                        isDark={isDark}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <Field label="Máximo de caracteres" isDark={isDark}>
                    <input
                      type="number"
                      min="0"
                      disabled={!formData.permiteObservacao || saving}
                      value={formData.maxObservacaoChars}
                      onChange={(e) =>
                        setField(
                          "maxObservacaoChars",
                          Number(e.target.value || 0)
                        )
                      }
                      className={[
                        inputClass,
                        !formData.permiteObservacao
                          ? isDark
                            ? "opacity-50"
                            : "bg-zinc-100"
                          : "",
                      ].join(" ")}
                    />
                  </Field>
                </div>
              </SectionCard>

              <ProdutoOpcionaisManager
                grupos={formData.gruposOpcionais}
                onChange={(grupos) => setField("gruposOpcionais", grupos)}
              />

              <SectionCard
                icon={Package}
                title="Oferta / promoção"
                subtitle="Defina descontos e vigência"
                isDark={isDark}
              >
                <div className={subtleCardClass}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                        Produto em oferta?
                      </p>
                      <p className={["text-xs", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                        Ative para mostrar preço promocional.
                      </p>
                    </div>

                    <Toggle
                      checked={formData.emOferta}
                      onChange={() => setField("emOferta", !formData.emOferta)}
                      isDark={isDark}
                      disabled={saving}
                    />
                  </div>
                </div>

                {formData.emOferta ? (
                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="xl:col-span-2">
                      <Field label="Título da oferta" isDark={isDark}>
                        <div className={shellInputClass}>
                          <Tag className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                          <input
                            type="text"
                            value={formData.tituloOferta}
                            onChange={(e) =>
                              setField("tituloOferta", e.target.value)
                            }
                            className="w-full bg-transparent px-2 text-sm outline-none"
                            placeholder="Ex: Promoção da semana"
                            disabled={saving}
                          />
                        </div>
                      </Field>
                    </div>

                    <Field label="Tipo" isDark={isDark}>
                      <div className={shellInputClass}>
                        {formData.tipoDesconto === "PERCENTUAL" ? (
                          <Percent className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                        ) : (
                          <BadgeDollarSign className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                        )}
                        <select
                          value={formData.tipoDesconto}
                          onChange={(e) =>
                            setField("tipoDesconto", e.target.value)
                          }
                          className="w-full bg-transparent px-2 text-sm outline-none"
                          disabled={saving}
                        >
                          <option value="PERCENTUAL">Percentual</option>
                          <option value="VALOR_FIXO">Valor fixo</option>
                        </select>
                      </div>
                    </Field>

                    <Field
                      label={
                        formData.tipoDesconto === "PERCENTUAL"
                          ? "Desconto (%)"
                          : "Desconto (R$)"
                      }
                      isDark={isDark}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.valorDesconto}
                        onChange={(e) => setField("valorDesconto", e.target.value)}
                        className={inputClass}
                        disabled={saving}
                      />
                    </Field>

                    <Field label="Início" isDark={isDark}>
                      <div className={shellInputClass}>
                        <Clock3 className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                        <input
                          type="datetime-local"
                          value={formData.inicioOferta}
                          onChange={(e) =>
                            setField("inicioOferta", e.target.value)
                          }
                          className="w-full bg-transparent px-2 text-sm outline-none"
                          disabled={saving}
                        />
                      </div>
                    </Field>

                    <Field label="Fim" isDark={isDark}>
                      <div className={shellInputClass}>
                        <Clock3 className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                        <input
                          type="datetime-local"
                          value={formData.fimOferta}
                          onChange={(e) => setField("fimOferta", e.target.value)}
                          className="w-full bg-transparent px-2 text-sm outline-none"
                          disabled={saving}
                        />
                      </div>
                    </Field>

                    <div
                      className={[
                        "rounded-2xl border p-4 md:col-span-2 xl:col-span-2",
                        isDark
                          ? "border-red-500/15 bg-red-500/10"
                          : "border-red-100 bg-red-50",
                      ].join(" ")}
                    >
                      <p className={["text-xs font-extrabold", isDark ? "text-red-300" : "text-red-700"].join(" ")}>
                        Prévia do preço
                      </p>

                      {precoFinalPreview < precoBasePreview ? (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-extrabold text-red-500">
                            {money(precoFinalPreview)}
                          </span>
                          <span className={["text-sm line-through", isDark ? "text-white/40" : "text-zinc-500"].join(" ")}>
                            {money(precoBasePreview)}
                          </span>
                        </div>
                      ) : (
                        <p className={["mt-2 text-lg font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                          {money(precoBasePreview)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}
              </SectionCard>
            </div>
          </div>
        </div>

        <div
          className={[
            "flex items-center justify-end gap-3 border-t px-5 py-4 sm:px-6",
            isDark ? "border-white/10 bg-[#121212]" : "border-zinc-200 bg-white",
          ].join(" ")}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className={[
              "h-11 rounded-2xl border px-5 font-extrabold transition disabled:opacity-50",
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={[
              "inline-flex h-11 items-center gap-2 rounded-2xl px-5 font-extrabold transition",
              saving
                ? "cursor-not-allowed bg-red-400/70 text-white"
                : "bg-red-600 text-white hover:bg-red-500 shadow-[0_14px_30px_rgba(239,68,68,0.20)]",
            ].join(" ")}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;