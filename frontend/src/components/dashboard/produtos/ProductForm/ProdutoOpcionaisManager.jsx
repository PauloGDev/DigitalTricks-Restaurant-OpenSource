import { useEffect, useState } from "react";
import { Plus, Settings2, Sparkles, Layers3 } from "lucide-react";
import GrupoOpcionalCard from "./GrupoOpcionalCard";

const createEmptyItem = (ordem = 1) => ({
  id: null,
  nome: "",
  precoExtra: "0",
  ativo: true,
  estoque: "",
  ordem,
});

const createEmptyGrupo = (ordem = 1) => ({
  id: null,
  nome: "",
  descricao: "",
  obrigatorio: false,
  minSelecionaveis: 0,
  maxSelecionaveis: 1,
  tipoSelecao: "SINGLE",
  ativo: true,
  ordem,
  tipoGrupo: "OPCIONAL_SELECAO",
  itens: [createEmptyItem(1)],
});

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const ProdutoOpcionaisManager = ({ grupos = [], onChange }) => {
  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());
    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const updateGrupo = (index, patch) => {
    const next = [...grupos];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeGrupo = (index) => {
    const next = grupos.filter((_, i) => i !== index).map((g, idx) => ({
      ...g,
      ordem: idx + 1,
    }));
    onChange(next);
  };

  const addGrupo = () => {
    onChange([...(grupos || []), createEmptyGrupo((grupos?.length || 0) + 1)]);
  };

  const addItem = (grupoIndex) => {
    const next = [...grupos];
    const itens = next[grupoIndex].itens || [];
    next[grupoIndex] = {
      ...next[grupoIndex],
      itens: [...itens, createEmptyItem(itens.length + 1)],
    };
    onChange(next);
  };

  const updateItem = (grupoIndex, itemIndex, patch) => {
    const next = [...grupos];
    const itens = [...(next[grupoIndex].itens || [])];
    itens[itemIndex] = { ...itens[itemIndex], ...patch };
    next[grupoIndex] = { ...next[grupoIndex], itens };
    onChange(next);
  };

  const removeItem = (grupoIndex, itemIndex) => {
    const next = [...grupos];
    const itens = (next[grupoIndex].itens || [])
      .filter((_, i) => i !== itemIndex)
      .map((item, idx) => ({ ...item, ordem: idx + 1 }));

    next[grupoIndex] = { ...next[grupoIndex], itens };
    onChange(next);
  };

  const totalItens = (grupos || []).reduce(
    (acc, grupo) => acc + (grupo?.itens?.length || 0),
    0
  );

  const shellClass = [
    "rounded-[28px] border p-4 sm:p-5 transition-colors duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
      : "border-zinc-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
  ].join(" ");

  const subtleCardClass = [
    "rounded-2xl border p-3",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50",
  ].join(" ");

  return (
    <div className={shellClass}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-sm">
            <Settings2 className="h-5 w-5" />
          </span>

          <div>
            <h3
              className={[
                "text-base font-extrabold",
                isDark ? "text-white" : "text-zinc-900",
              ].join(" ")}
            >
              Opcionais e adicionais
            </h3>
            <p
              className={[
                "mt-1 text-sm",
                isDark ? "text-white/50" : "text-zinc-600",
              ].join(" ")}
            >
              Crie grupos como adicionais, borda recheada, ponto da carne,
              acompanhamentos e outras personalizações.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addGrupo}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-extrabold text-white transition hover:bg-red-500"
        >
          <Plus className="h-4 w-4" />
          Adicionar grupo
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={subtleCardClass}>
          <div className="flex items-center gap-2">
            <Layers3 className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
            <p
              className={[
                "text-xs font-extrabold uppercase tracking-[0.12em]",
                isDark ? "text-white/40" : "text-zinc-500",
              ].join(" ")}
            >
              Grupos
            </p>
          </div>
          <p
            className={[
              "mt-2 text-2xl font-black",
              isDark ? "text-white" : "text-zinc-900",
            ].join(" ")}
          >
            {grupos.length}
          </p>
        </div>

        <div className={subtleCardClass}>
          <div className="flex items-center gap-2">
            <Sparkles className={["h-4 w-4", isDark ? "text-red-300" : "text-red-600"].join(" ")} />
            <p
              className={[
                "text-xs font-extrabold uppercase tracking-[0.12em]",
                isDark ? "text-white/40" : "text-zinc-500",
              ].join(" ")}
            >
              Itens
            </p>
          </div>
          <p
            className={[
              "mt-2 text-2xl font-black",
              isDark ? "text-white" : "text-zinc-900",
            ].join(" ")}
          >
            {totalItens}
          </p>
        </div>

        <div className={subtleCardClass}>
          <p
            className={[
              "text-xs font-extrabold uppercase tracking-[0.12em]",
              isDark ? "text-white/40" : "text-zinc-500",
            ].join(" ")}
          >
            Uso recomendado
          </p>
          <p
            className={[
              "mt-2 text-sm font-semibold leading-relaxed",
              isDark ? "text-white/80" : "text-zinc-800",
            ].join(" ")}
          >
            Use grupos para deixar o produto flexível sem duplicar pratos no
            cardápio.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {grupos.length === 0 ? (
          <div
            className={[
              "rounded-[28px] border border-dashed p-6 text-center",
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-zinc-300 bg-zinc-50",
            ].join(" ")}
          >
            <div className="mx-auto flex max-w-md flex-col items-center">
              <div
                className={[
                  "mb-3 grid h-14 w-14 place-items-center rounded-3xl",
                  isDark ? "bg-white/5 text-white/40" : "bg-white text-zinc-400",
                ].join(" ")}
              >
                <Settings2 className="h-7 w-7" />
              </div>

              <p
                className={[
                  "text-sm font-extrabold",
                  isDark ? "text-white" : "text-zinc-900",
                ].join(" ")}
              >
                Nenhum grupo opcional ainda
              </p>

              <p
                className={[
                  "mt-1 text-sm leading-relaxed",
                  isDark ? "text-white/50" : "text-zinc-600",
                ].join(" ")}
              >
                Adicione grupos para montar o produto com opções e adicionais,
                como borda recheada, ponto da carne, complementos ou acompanhamentos.
              </p>

              <button
                type="button"
                onClick={addGrupo}
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 text-sm font-extrabold text-white transition hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                Criar primeiro grupo
              </button>
            </div>
          </div>
        ) : (
          grupos.map((grupo, index) => (
            <GrupoOpcionalCard
              key={grupo.id || `grupo-${index}`}
              grupo={grupo}
              index={index}
              onChangeGrupo={updateGrupo}
              onRemoveGrupo={removeGrupo}
              onAddItem={addItem}
              onChangeItem={updateItem}
              onRemoveItem={removeItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProdutoOpcionaisManager;