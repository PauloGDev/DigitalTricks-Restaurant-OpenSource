import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Save,
  Edit3,
  Loader2,
  Plus,
  Trash,
  Image as ImageIcon,
  X,
  Tag,
  Clock3,
  Percent,
  BadgeDollarSign,
  MessageSquareText,
  Sparkles,
  Shapes,
  Package2,
} from "lucide-react";
import { useNotification } from "../../../context/NotificationContext";
import CategoriaManager from "./CategoriaManager";
import ProdutoOpcionaisManager from "./ProductForm/ProdutoOpcionaisManager";

const emptyForm = {
  id: null,
  nome: "",
  descricao: "",
  precoBase: "",
  estoque: "",
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
};

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
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

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

function SectionCard({ title, subtitle, icon: Icon, isDark, children, action }) {
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
          <span
            className={[
              "grid h-11 w-11 place-items-center rounded-3xl shadow-sm",
              isDark
                ? "bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white"
                : "bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white",
            ].join(" ")}
          >
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

function Toggle({ checked, onChange, isDark }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        "relative h-9 w-16 rounded-full border transition-all duration-300",
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

const ProductForm = ({ empresaId, produtoInicial = null, onSaved, onCancel }) => {
  const { showNotification } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL;

  const [theme, setTheme] = useState(getThemeState());
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [temVariacoes, setTemVariacoes] = useState(false);

  const isDark = theme === "dark";
  const isEdit = !!formData.id;

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getThemeState());
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    if (!produtoInicial) {
      setFormData(emptyForm);
      setTemVariacoes(false);
      setErrors([]);
      return;
    }

    setFormData({
      id: produtoInicial.id || null,
      nome: produtoInicial.nome || "",
      descricao: produtoInicial.descricao || "",
      precoBase:
        produtoInicial.precoBase !== null &&
        produtoInicial.precoBase !== undefined
          ? String(produtoInicial.precoBase)
          : "",
      estoque:
        produtoInicial.estoque !== null &&
        produtoInicial.estoque !== undefined
          ? String(produtoInicial.estoque)
          : "",
      imagemUrl: produtoInicial.imagemUrl || "",
      imagemFile: null,
      variacoes: Array.isArray(produtoInicial.variacoes)
        ? produtoInicial.variacoes.map((v) => ({
            id: v.id,
            nome: v.nome || "",
            preco:
              v.preco !== null && v.preco !== undefined ? String(v.preco) : "",
            precoPromocional:
              v.precoPromocional !== null && v.precoPromocional !== undefined
                ? String(v.precoPromocional)
                : "",
            estoque:
              v.estoque !== null && v.estoque !== undefined
                ? String(v.estoque)
                : "",
          }))
        : [],
      categorias: produtoInicial.categorias || [],

      permiteObservacao:
        produtoInicial.permiteObservacao !== undefined
          ? !!produtoInicial.permiteObservacao
          : true,
      maxObservacaoChars:
        produtoInicial.maxObservacaoChars !== null &&
        produtoInicial.maxObservacaoChars !== undefined
          ? String(produtoInicial.maxObservacaoChars)
          : "140",
      gruposOpcionais: Array.isArray(produtoInicial.gruposOpcionais)
        ? produtoInicial.gruposOpcionais.map(normalizeGrupoFromApi)
        : [],

      emOferta: !!produtoInicial.emOferta,
      tipoDesconto: produtoInicial.tipoDesconto || "PERCENTUAL",
      valorDesconto:
        produtoInicial.valorDesconto !== null &&
        produtoInicial.valorDesconto !== undefined
          ? String(produtoInicial.valorDesconto)
          : "",
      tituloOferta: produtoInicial.tituloOferta || "",
      inicioOferta: toDatetimeLocal(produtoInicial.inicioOferta),
      fimOferta: toDatetimeLocal(produtoInicial.fimOferta),
    });

    setTemVariacoes((produtoInicial.variacoes?.length ?? 0) > 0);
    setErrors([]);
  }, [produtoInicial]);

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;

    handleChange("imagemFile", file);

    const reader = new FileReader();
    reader.onloadend = () => handleChange("imagemUrl", reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imagemFile: null,
      imagemUrl: "",
    }));
  };

  const addVariacao = () => {
    handleChange("variacoes", [
      ...formData.variacoes,
      { id: null, nome: "", preco: "", precoPromocional: "", estoque: "" },
    ]);
  };

  const removeVariacao = (index) => {
    const novas = [...formData.variacoes];
    novas.splice(index, 1);
    handleChange("variacoes", novas);
  };

  const updateVariacao = (index, patch) => {
    const novas = [...formData.variacoes];
    novas[index] = { ...novas[index], ...patch };
    handleChange("variacoes", novas);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setTemVariacoes(false);
    setErrors([]);
  };

  const precoPreview = useMemo(() => {
    if (temVariacoes) {
      const precos = (formData.variacoes || [])
        .map((v) => Number(v.preco))
        .filter((n) => !Number.isNaN(n) && n > 0);

      if (!precos.length) return null;

      const menor = Math.min(...precos);

      if (formData.emOferta && Number(formData.valorDesconto) > 0) {
        const desconto = Number(formData.valorDesconto);
        let promocional = menor;

        if (formData.tipoDesconto === "PERCENTUAL") {
          promocional = menor - menor * (desconto / 100);
        } else {
          promocional = menor - desconto;
        }

        promocional = Math.max(promocional, 0);
        return { original: menor, promocional };
      }

      return { original: menor, promocional: menor };
    }

    const preco = Number(formData.precoBase);
    if (Number.isNaN(preco) || preco <= 0) return null;

    if (formData.emOferta && Number(formData.valorDesconto) > 0) {
      const desconto = Number(formData.valorDesconto);
      let promocional = preco;

      if (formData.tipoDesconto === "PERCENTUAL") {
        promocional = preco - preco * (desconto / 100);
      } else {
        promocional = preco - desconto;
      }

      promocional = Math.max(promocional, 0);
      return { original: preco, promocional };
    }

    return { original: preco, promocional: preco };
  }, [
    temVariacoes,
    formData.variacoes,
    formData.precoBase,
    formData.emOferta,
    formData.tipoDesconto,
    formData.valorDesconto,
  ]);

  const validateForm = () => {
    const newErrors = [];

    if (!formData.nome.trim()) newErrors.push("O nome do prato é obrigatório.");
    if (!formData.descricao.trim()) {
      newErrors.push("A descrição do prato é obrigatória.");
    }

    if (!formData.imagemUrl && !formData.imagemFile) {
      newErrors.push("A foto do prato é obrigatória.");
    }

    if (!formData.categorias?.length) {
      newErrors.push("Selecione pelo menos uma categoria.");
    }

    if (temVariacoes) {
      if ((formData.variacoes?.length ?? 0) < 2) {
        newErrors.push("Adicione pelo menos duas variações.");
      }

      formData.variacoes.forEach((v, i) => {
        if (!String(v.nome || "").trim()) {
          newErrors.push(`Informe o nome da variação ${i + 1}.`);
        }

        const preco = Number(v.preco);
        const estoque = Number(v.estoque);

        if (v.preco === "" || Number.isNaN(preco) || preco < 0) {
          newErrors.push(`Informe um preço válido para a variação ${i + 1}.`);
        }

        if (v.precoPromocional !== "" && v.precoPromocional !== null && v.precoPromocional !== undefined) {
          const precoProm = Number(v.precoPromocional);
          if (Number.isNaN(precoProm) || precoProm < 0) {
            newErrors.push(`Preço promocional inválido na variação ${i + 1}.`);
          }
        }

        if (v.estoque === "" || Number.isNaN(estoque) || estoque < 0) {
          newErrors.push(`Informe um estoque válido para a variação ${i + 1}.`);
        }
      });
    } else {
      const precoBase = Number(formData.precoBase);
      const estoque = Number(formData.estoque);

      if (formData.precoBase === "" || Number.isNaN(precoBase) || precoBase < 0) {
        newErrors.push("Preço do prato simples é obrigatório.");
      }

      if (formData.estoque === "" || Number.isNaN(estoque) || estoque < 0) {
        newErrors.push("Estoque do prato simples é obrigatório.");
      }
    }

    if (formData.permiteObservacao) {
      const maxChars = Number(formData.maxObservacaoChars);
      if (
        formData.maxObservacaoChars === "" ||
        Number.isNaN(maxChars) ||
        maxChars < 0
      ) {
        newErrors.push("Informe um limite válido para observação.");
      }
    }

    (formData.gruposOpcionais || []).forEach((grupo, gIndex) => {
      if (!String(grupo.nome || "").trim()) {
        newErrors.push(`Informe o nome do grupo opcional ${gIndex + 1}.`);
      }

      const min = Number(grupo.minSelecionaveis || 0);
      const max = Number(grupo.maxSelecionaveis || 0);

      if (Number.isNaN(min) || min < 0) {
        newErrors.push(`Min. inválido no grupo ${gIndex + 1}.`);
      }

      if (Number.isNaN(max) || max < 0) {
        newErrors.push(`Máx. inválido no grupo ${gIndex + 1}.`);
      }

      if (grupo.obrigatorio && min < 1) {
        newErrors.push(
          `Grupo ${gIndex + 1} é obrigatório, então o mínimo deve ser pelo menos 1.`
        );
      }

      if (grupo.tipoSelecao === "SINGLE" && max > 1) {
        newErrors.push(
          `Grupo ${gIndex + 1} com seleção única não pode ter máximo maior que 1.`
        );
      }

      if ((grupo.itens?.length ?? 0) === 0) {
        newErrors.push(`Adicione pelo menos um item no grupo ${gIndex + 1}.`);
      }

      (grupo.itens || []).forEach((item, iIndex) => {
        if (!String(item.nome || "").trim()) {
          newErrors.push(
            `Informe o nome do item ${iIndex + 1} do grupo ${gIndex + 1}.`
          );
        }

        const precoExtra = Number(item.precoExtra || 0);
        if (Number.isNaN(precoExtra) || precoExtra < 0) {
          newErrors.push(
            `Preço extra inválido no item ${iIndex + 1} do grupo ${gIndex + 1}.`
          );
        }

        if (
          item.estoque !== "" &&
          item.estoque !== null &&
          item.estoque !== undefined
        ) {
          const estoque = Number(item.estoque);
          if (Number.isNaN(estoque) || estoque < 0) {
            newErrors.push(
              `Estoque inválido no item ${iIndex + 1} do grupo ${gIndex + 1}.`
            );
          }
        }
      });
    });

    if (formData.emOferta) {
      if (!formData.tipoDesconto) {
        newErrors.push("Selecione o tipo de desconto da oferta.");
      }

      const valorDesconto = Number(formData.valorDesconto);
      if (
        formData.valorDesconto === "" ||
        Number.isNaN(valorDesconto) ||
        valorDesconto <= 0
      ) {
        newErrors.push("Informe um valor de desconto válido.");
      }

      if (
        formData.tipoDesconto === "PERCENTUAL" &&
        Number(formData.valorDesconto) > 100
      ) {
        newErrors.push("Desconto percentual não pode ser maior que 100%.");
      }

      if (formData.inicioOferta && formData.fimOferta) {
        const inicio = new Date(formData.inicioOferta);
        const fim = new Date(formData.fimOferta);
        if (fim < inicio) {
          newErrors.push(
            "A data final da oferta não pode ser menor que a data inicial."
          );
        }
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const buildProdutoPayload = () => {
    return {
      id: formData.id || null,
      ativo: true,
      nome: String(formData.nome || "").trim(),
      descricao: String(formData.descricao || "").trim(),
      categorias: Array.isArray(formData.categorias) ? formData.categorias : [],
      precoBase: temVariacoes ? null : Number(formData.precoBase || 0),
      estoque: temVariacoes ? null : Number(formData.estoque || 0),
      slug: null,
      imagemUrl: formData.imagemFile ? null : formData.imagemUrl || null,
      variacoes: temVariacoes
        ? (formData.variacoes || []).map((v) => ({
            id: v.id || null,
            nome: String(v.nome || "").trim(),
            preco: Number(v.preco || 0),
            precoPromocional:
              v.precoPromocional !== null && v.precoPromocional !== undefined && v.precoPromocional !== ""
                ? Number(v.precoPromocional)
                : null,
            estoque: Number(v.estoque || 0),
          }))
        : [],
      pedidos: produtoInicial?.pedidos ?? 0,
      precoMinimo: null,
      gruposOpcionais: (formData.gruposOpcionais || []).map(normalizeGrupoToPayload),
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
          ? new Date(formData.inicioOferta).toISOString()
          : null,
      fimOferta:
        formData.emOferta && formData.fimOferta
          ? new Date(formData.fimOferta).toISOString()
          : null,
      precoPromocional: null,
      ofertaVigente: produtoInicial?.ofertaVigente ?? false,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!empresaId) {
      showNotification("❌ Empresa não identificada.", "error");
      setLoading(false);
      return;
    }

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      const produtoPayload = buildProdutoPayload();

      data.append(
        "produto",
        new Blob([JSON.stringify(produtoPayload)], {
          type: "application/json",
        })
      );

      if (formData.imagemFile) {
        data.append("imagem", formData.imagemFile);
      }

      const url = formData.id
        ? `${API_URL}/empresas/${empresaId}/produtos/${formData.id}`
        : `${API_URL}/empresas/${empresaId}/produtos`;

      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Erro ao salvar produto");
      }

      const produtoSalvo = await res.json().catch(() => null);

      showNotification(
        isEdit ? "✅ Prato atualizado!" : "✅ Prato cadastrado!",
        "success"
      );

      resetForm();
      onSaved?.(produtoSalvo);
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      showNotification(err.message || "❌ Erro ao salvar prato", "error");
    } finally {
      setLoading(false);
    }
  };

  const titulo = isEdit ? "Editar prato" : "Cadastrar prato";
  const subtitulo = isEdit
    ? "Atualize foto, categorias, preço, opcionais e promoção."
    : "Adicione um novo item ao cardápio com foto, preço, categoria, opcionais e promoção.";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-sm">
            {isEdit ? <Edit3 className="h-6 w-6" /> : <PlusCircle className="h-6 w-6" />}
          </span>
          <div>
            <h3 className={["text-xl font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              {titulo}
            </h3>
            <p className={["text-sm", isDark ? "text-white/50" : "text-zinc-600"].join(" ")}>
              {subtitulo}
            </p>
          </div>
        </div>

        {isEdit ? (
          <button
            type="button"
            onClick={() => {
              resetForm();
              onCancel?.();
            }}
            className={[
              "h-11 rounded-2xl border px-4 text-sm font-extrabold transition",
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            ].join(" ")}
          >
            Cancelar edição
          </button>
        ) : null}
      </div>

      {errors.length > 0 && (
        <div
          className={[
            "rounded-2xl border p-4",
            isDark
              ? "border-red-500/20 bg-red-500/10"
              : "border-red-200 bg-red-50",
          ].join(" ")}
        >
          <p className={["mb-2 text-sm font-extrabold", isDark ? "text-red-300" : "text-red-800"].join(" ")}>
            Ajuste antes de salvar:
          </p>
          <ul className={["space-y-1 text-sm", isDark ? "text-red-200" : "text-red-700"].join(" ")}>
            {errors.map((e, i) => (
              <li key={i}>• {e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Foto do prato"
          subtitle="Imagem principal do produto"
          icon={ImageIcon}
          isDark={isDark}
        >
          <div>
            {formData.imagemUrl ? (
              <div
                className={[
                  "overflow-hidden rounded-2xl border",
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50",
                ].join(" ")}
              >
                <img
                  src={formData.imagemUrl}
                  alt="preview"
                  className="h-56 w-full object-cover"
                />
              </div>
            ) : (
              <div
                className={[
                  "grid h-56 place-items-center rounded-2xl border border-dashed text-center",
                  isDark
                    ? "border-white/10 bg-white/[0.03] text-white/45"
                    : "border-zinc-300 bg-zinc-50 text-zinc-500",
                ].join(" ")}
              >
                <div>
                  <ImageIcon className="mx-auto mb-2 h-7 w-7" />
                  <p className="text-sm font-semibold">Envie uma foto</p>
                  <p className="text-xs">JPG/PNG, recomendado 1:1 ou 4:3</p>
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <label className="block flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  className="hidden"
                />
                <span
                  className={[
                    "inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl border text-sm font-extrabold transition",
                    isDark
                      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {formData.imagemUrl ? "Trocar foto" : "Selecionar foto"}
                </span>
              </label>

              {formData.imagemUrl ? (
                <button
                  type="button"
                  onClick={removeImage}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold transition",
                    isDark
                      ? "bg-red-500/10 text-red-300 hover:bg-red-500/15"
                      : "bg-red-50 text-red-700 hover:bg-red-100",
                  ].join(" ")}
                >
                  <X className="h-4 w-4" />
                  Remover
                </button>
              ) : null}
            </div>
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard
            title="Informações do prato"
            subtitle="Nome, descrição, preço e estoque"
            icon={Package2}
            isDark={isDark}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Nome" isDark={isDark}>
                  <input
                    type="text"
                    placeholder="Ex: X-Bacon artesanal"
                    className={inputClass}
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Descrição" isDark={isDark}>
                  <textarea
                    rows={3}
                    className={textareaClass}
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-2 mt-1">
                <div className={subtleCardClass}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                        Possui variações?
                      </p>
                      <p className={["text-xs", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                        Use para tamanhos, sabores, combos, etc.
                      </p>
                    </div>

                    <Toggle
                      checked={temVariacoes}
                      onChange={() => setTemVariacoes((v) => !v)}
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>

              {!temVariacoes ? (
                <>
                  <Field label="Preço" isDark={isDark}>
                    <div className={shellInputClass}>
                      <span className={["text-sm font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full bg-transparent px-2 text-sm outline-none"
                        value={formData.precoBase}
                        onChange={(e) => handleChange("precoBase", e.target.value)}
                      />
                    </div>
                  </Field>

                  <Field label="Estoque" isDark={isDark}>
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={formData.estoque}
                      onChange={(e) => handleChange("estoque", e.target.value)}
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>

      {temVariacoes ? (
        <SectionCard
          title="Variações"
          subtitle="Cadastre preços e estoques por opção"
          icon={Shapes}
          isDark={isDark}
          action={
            <button
              type="button"
              onClick={addVariacao}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-extrabold text-white transition hover:bg-red-500"
            >
              <Plus className="h-4 w-4" />
              Adicionar variação
            </button>
          }
        >
          <div className="space-y-3">
            {formData.variacoes.map((v, i) => (
              <div key={i} className={subtleCardClass}>
                <div className="flex items-center justify-between gap-3">
                  <p className={["text-xs font-extrabold", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                    Variação {i + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeVariacao(i)}
                    className={["inline-flex items-center gap-2 text-sm font-extrabold", isDark ? "text-red-300 hover:underline" : "text-red-700 hover:underline"].join(" ")}
                  >
                    <Trash className="h-4 w-4" />
                    Remover
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Field label="Nome" isDark={isDark}>
                    <input
                      type="text"
                      value={v.nome}
                      className={inputClass}
                      onChange={(e) => updateVariacao(i, { nome: e.target.value })}
                    />
                  </Field>

                  <Field label="Preço" isDark={isDark}>
                    <div className={shellInputClass}>
                      <span className={["text-sm font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.preco}
                        className="w-full bg-transparent px-2 text-sm outline-none"
                        onChange={(e) => updateVariacao(i, { preco: e.target.value })}
                      />
                    </div>
                  </Field>

                  <Field label="Preço promocional" isDark={isDark} hint="Opcional">
                    <div className={shellInputClass}>
                      <span className={["text-sm font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={v.precoPromocional ?? ""}
                        placeholder="—"
                        className="w-full bg-transparent px-2 text-sm outline-none"
                        onChange={(e) => updateVariacao(i, { precoPromocional: e.target.value })}
                      />
                    </div>
                  </Field>

                  <Field label="Estoque" isDark={isDark}>
                    <input
                      type="number"
                      min="0"
                      value={v.estoque}
                      className={inputClass}
                      onChange={(e) => updateVariacao(i, { estoque: e.target.value })}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Observação do cliente"
        subtitle="Permita que o cliente envie instruções para o pedido"
        icon={MessageSquareText}
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
                onChange={() => handleChange("permiteObservacao", !formData.permiteObservacao)}
                isDark={isDark}
              />
            </div>
          </div>

          <Field label="Máximo de caracteres" isDark={isDark}>
            <input
              type="number"
              min="0"
              disabled={!formData.permiteObservacao}
              className={[
                inputClass,
                !formData.permiteObservacao
                  ? isDark
                    ? "opacity-50"
                    : "bg-zinc-100"
                  : "",
              ].join(" ")}
              value={formData.maxObservacaoChars}
              onChange={(e) => handleChange("maxObservacaoChars", e.target.value)}
            />
          </Field>
        </div>
      </SectionCard>

      <ProdutoOpcionaisManager
        grupos={formData.gruposOpcionais}
        onChange={(grupos) => handleChange("gruposOpcionais", grupos)}
      />

      <SectionCard
        title="Promoção / oferta"
        subtitle="Defina descontos e vigência"
        icon={Tag}
        isDark={isDark}
      >
        <div className={subtleCardClass}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                Produto em oferta?
              </p>
              <p className={["text-xs", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                Ative para mostrar preço promocional no cardápio.
              </p>
            </div>

            <Toggle
              checked={formData.emOferta}
              onChange={() => handleChange("emOferta", !formData.emOferta)}
              isDark={isDark}
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
                    className="w-full bg-transparent px-2 text-sm outline-none"
                    value={formData.tituloOferta}
                    onChange={(e) => handleChange("tituloOferta", e.target.value)}
                  />
                </div>
              </Field>
            </div>

            <Field label="Tipo de desconto" isDark={isDark}>
              <div className={shellInputClass}>
                {formData.tipoDesconto === "PERCENTUAL" ? (
                  <Percent className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                ) : (
                  <BadgeDollarSign className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                )}
                <select
                  className="w-full bg-transparent px-2 text-sm outline-none"
                  value={formData.tipoDesconto}
                  onChange={(e) => handleChange("tipoDesconto", e.target.value)}
                >
                  <option value="PERCENTUAL">Percentual</option>
                  <option value="VALOR_FIXO">Valor fixo</option>
                </select>
              </div>
            </Field>

            <Field
              label={formData.tipoDesconto === "PERCENTUAL" ? "Desconto (%)" : "Desconto (R$)"}
              isDark={isDark}
            >
              <div className={shellInputClass}>
                <span className={["text-sm font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                  {formData.tipoDesconto === "PERCENTUAL" ? "%" : "R$"}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent px-2 text-sm outline-none"
                  value={formData.valorDesconto}
                  onChange={(e) => handleChange("valorDesconto", e.target.value)}
                />
              </div>
            </Field>

            <Field label="Início da oferta" isDark={isDark}>
              <div className={shellInputClass}>
                <Clock3 className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                <input
                  type="datetime-local"
                  className="w-full bg-transparent px-2 text-sm outline-none"
                  value={formData.inicioOferta}
                  onChange={(e) => handleChange("inicioOferta", e.target.value)}
                />
              </div>
            </Field>

            <Field label="Fim da oferta" isDark={isDark}>
              <div className={shellInputClass}>
                <Clock3 className={["h-4 w-4", isDark ? "text-white/40" : "text-zinc-500"].join(" ")} />
                <input
                  type="datetime-local"
                  className="w-full bg-transparent px-2 text-sm outline-none"
                  value={formData.fimOferta}
                  onChange={(e) => handleChange("fimOferta", e.target.value)}
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

              {precoPreview ? (
                <div className="mt-2">
                  {precoPreview.promocional < precoPreview.original ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-extrabold text-red-500">
                        {formatMoney(precoPreview.promocional)}
                      </span>
                      <span className={["text-sm line-through", isDark ? "text-white/40" : "text-zinc-500"].join(" ")}>
                        {formatMoney(precoPreview.original)}
                      </span>
                    </div>
                  ) : (
                    <span className={["text-lg font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                      {formatMoney(precoPreview.original)}
                    </span>
                  )}

                  {formData.tituloOferta?.trim() ? (
                    <p
                      className={[
                        "mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
                        isDark
                          ? "border-red-500/20 bg-white/5 text-red-300"
                          : "border-red-200 bg-white text-red-700",
                      ].join(" ")}
                    >
                      {formData.tituloOferta}
                    </p>
                  ) : null}
                </div>
              ) : (
                <p className={["mt-2 text-sm", isDark ? "text-white/50" : "text-zinc-600"].join(" ")}>
                  Informe preço base ou variações para visualizar a promoção.
                </p>
              )}
            </div>
          </div>
        ) : null}
      </SectionCard>

      <div className="grid grid-cols-1 gap-4 pb-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard
            title="Categorias do cardápio"
            subtitle="Associe o produto às categorias corretas"
            icon={Sparkles}
            isDark={isDark}
          >
            <CategoriaManager
              empresaId={empresaId}
              categoriasSelecionadas={formData.categorias}
              onChange={(cats) => setFormData((prev) => ({ ...prev, categorias: cats }))}
            />
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <SectionCard
            title="Ações"
            subtitle="Revise os dados e salve o prato"
            icon={Save}
            isDark={isDark}
          >
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading}
                className={[
                  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-6 text-sm font-extrabold transition",
                  loading
                    ? isDark
                      ? "cursor-not-allowed bg-white/10 text-white/40"
                      : "cursor-not-allowed bg-zinc-200 text-zinc-500"
                    : "bg-red-600 text-white hover:bg-red-500",
                ].join(" ")}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Salvando...
                  </>
                ) : isEdit ? (
                  <>
                    <Save className="h-5 w-5" /> Atualizar prato
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5" /> Cadastrar prato
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className={[
                  "h-12 w-full rounded-2xl border px-6 text-sm font-extrabold transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
                ].join(" ")}
              >
                Limpar
              </button>
            </div>

            <div className={["mt-4 rounded-2xl border p-3", isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50"].join(" ")}>
              <p className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                Resumo
              </p>
              <div className={["mt-2 space-y-1 text-xs", isDark ? "text-white/50" : "text-zinc-600"].join(" ")}>
                <p>
                  Categorias:{" "}
                  <span className={["font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                    {formData.categorias?.length || 0}
                  </span>
                </p>
                <p>
                  Variações:{" "}
                  <span className={["font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                    {temVariacoes ? formData.variacoes?.length || 0 : "não"}
                  </span>
                </p>
                <p>
                  Grupos opcionais:{" "}
                  <span className={["font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                    {formData.gruposOpcionais?.length || 0}
                  </span>
                </p>
                <p>
                  Em oferta:{" "}
                  <span className={["font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
                    {formData.emOferta ? "sim" : "não"}
                  </span>
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;