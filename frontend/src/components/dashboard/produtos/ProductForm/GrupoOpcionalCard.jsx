import { useEffect, useState } from "react";
import {
  Plus,
  Trash,
  Info,
  Check,
  Layers3,
  Boxes,
  CircleDollarSign,
} from "lucide-react";

const getThemeState = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem("navbar-theme-override") || "dark";
};

const GrupoOpcionalCard = ({
  grupo,
  index,
  onChangeGrupo,
  onRemoveGrupo,
  onAddItem,
  onChangeItem,
  onRemoveItem,
}) => {
  const [theme, setTheme] = useState(getThemeState());

  useEffect(() => {
    const syncTheme = () => setTheme(getThemeState());
    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";
  const isSingle = grupo.tipoSelecao === "SINGLE";

  const getSingleMin = () => (grupo.obrigatorio ? 1 : 0);
  const getSingleMax = () => 1;

  const handleGrupoChange = (field, value) => {
    let patch = { [field]: value };

    if (field === "tipoSelecao") {
      if (value === "SINGLE") {
        patch.minSelecionaveis = grupo.obrigatorio ? 1 : 0;
        patch.maxSelecionaveis = 1;
      }
    }

    if (field === "obrigatorio") {
      if (grupo.tipoSelecao === "SINGLE") {
        patch.minSelecionaveis = value ? 1 : 0;
        patch.maxSelecionaveis = 1;
      } else {
        if (value === false && Number(grupo.minSelecionaveis) > 0) {
          patch.minSelecionaveis = 0;
        }
        if (value === true && Number(grupo.minSelecionaveis) < 1) {
          patch.minSelecionaveis = 1;
        }
      }
    }

    onChangeGrupo(index, patch);
  };

  const minValue = isSingle ? getSingleMin() : grupo.minSelecionaveis;
  const maxValue = isSingle ? getSingleMax() : grupo.maxSelecionaveis;

  const inputClass = [
    "mt-1 w-full h-11 rounded-2xl border px-4 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
      : "border-zinc-200 bg-white text-zinc-700 placeholder:text-zinc-400",
  ].join(" ");

  const selectClass = [
    "mt-1 w-full h-11 rounded-2xl border px-4 text-sm outline-none transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] text-white"
      : "border-zinc-200 bg-white text-zinc-700",
  ].join(" ");

  const disabledInputClass = [
    "mt-1 w-full h-11 rounded-2xl border px-4 text-sm outline-none cursor-not-allowed",
    isDark
      ? "border-white/10 bg-white/[0.03] text-white/35"
      : "border-zinc-200 bg-zinc-100 text-zinc-400",
  ].join(" ");

  const containerClass = [
    "rounded-[28px] border p-4 transition-colors duration-300",
    isDark
      ? "border-white/10 bg-white/[0.04] shadow-[0_18px_50px_rgba(0,0,0,0.24)]"
      : "border-zinc-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]",
  ].join(" ");

  const subtleCardClass = [
    "rounded-2xl border p-3",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50",
  ].join(" ");

  const itemCardClass = [
    "rounded-2xl border p-3",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-white",
  ].join(" ");

  const checkboxCardClass = [
    "flex items-center gap-2 rounded-2xl border px-4 py-3",
    isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50",
  ].join(" ");

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
            Grupo {index + 1}
          </p>
          <p className={["text-xs mt-1", isDark ? "text-white/45" : "text-zinc-500"].join(" ")}>
            Configure seleção, obrigatoriedade e itens disponíveis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemoveGrupo(index)}
          className={["inline-flex items-center gap-2 text-sm font-extrabold transition", isDark ? "text-red-300 hover:text-red-200" : "text-red-700 hover:underline"].join(" ")}
        >
          <Trash className="h-4 w-4" />
          Remover grupo
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-2">
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Nome do grupo
          </label>
          <input
            type="text"
            value={grupo.nome}
            onChange={(e) => handleGrupoChange("nome", e.target.value)}
            placeholder="Ex: Tamanho, adicionais, borda recheada"
            className={inputClass}
          />
        </div>

        <div className="xl:col-span-2">
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Descrição
          </label>
          <input
            type="text"
            value={grupo.descricao}
            onChange={(e) => handleGrupoChange("descricao", e.target.value)}
            placeholder="Ex: escolha até 2 opções"
            className={inputClass}
          />
        </div>

        <div>
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Tipo de grupo
          </label>
          <select
            value={grupo.tipoGrupo}
            onChange={(e) => handleGrupoChange("tipoGrupo", e.target.value)}
            className={selectClass}
          >
            <option value="OPCIONAL_SELECAO">Seleção (ex: Tamanho)</option>
            <option value="ADICIONAL_QUANTIDADE">
              Quantidade (ex: adicional de bacon)
            </option>
          </select>
        </div>

        <div>
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Tipo de seleção
          </label>
          <select
            value={grupo.tipoSelecao}
            onChange={(e) => handleGrupoChange("tipoSelecao", e.target.value)}
            className={selectClass}
          >
            <option value="SINGLE">Única</option>
            <option value="MULTIPLE">Múltipla</option>
          </select>
        </div>

        <div>
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Mínimo
          </label>
          <input
            type="number"
            min="0"
            value={minValue}
            disabled={isSingle}
            onChange={(e) => handleGrupoChange("minSelecionaveis", e.target.value)}
            className={isSingle ? disabledInputClass : inputClass}
          />
        </div>

        <div>
          <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
            Máximo
          </label>
          <input
            type="number"
            min="0"
            value={maxValue}
            disabled={isSingle}
            onChange={(e) => handleGrupoChange("maxSelecionaveis", e.target.value)}
            className={isSingle ? disabledInputClass : inputClass}
          />
        </div>
      </div>

      <div
        className={[
          "mt-4 rounded-2xl border p-3",
          isDark
            ? "border-blue-500/15 bg-blue-500/10"
            : "border-blue-100 bg-blue-50",
        ].join(" ")}
      >
        <div className="flex items-start gap-2">
          <Info className={["mt-0.5 h-4 w-4", isDark ? "text-blue-300" : "text-blue-600"].join(" ")} />
          <div className={["space-y-1 text-xs", isDark ? "text-blue-100" : "text-blue-800"].join(" ")}>
            <p className="font-extrabold">Como funciona:</p>
            <p>
              <strong>Única:</strong> o cliente escolhe apenas uma opção. Nesse
              modo, o sistema controla automaticamente o mínimo e o máximo.
            </p>
            <p>
              <strong>Múltipla:</strong> o cliente pode escolher várias opções.
              Nesse modo, você define manualmente o mínimo e o máximo.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className={checkboxCardClass}>
          <input
            type="checkbox"
            checked={grupo.obrigatorio}
            onChange={(e) => handleGrupoChange("obrigatorio", e.target.checked)}
          />
          <span className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
            Obrigatório
          </span>
        </label>

        <label className={checkboxCardClass}>
          <input
            type="checkbox"
            checked={grupo.ativo}
            onChange={(e) => handleGrupoChange("ativo", e.target.checked)}
          />
          <span className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
            Ativo
          </span>
        </label>
      </div>

      <div className={[ "mt-5 rounded-2xl border p-3", isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-zinc-50" ].join(" ")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={["text-sm font-extrabold", isDark ? "text-white" : "text-zinc-900"].join(" ")}>
              Itens do grupo
            </p>
            <p className={["text-xs mt-1", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
              Ex: cheddar, bacon, catupiry, ao ponto, bem passado.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddItem(index)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-3 text-sm font-extrabold text-white transition hover:bg-red-500"
          >
            <Plus className="h-4 w-4" />
            Adicionar item
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {(grupo.itens || []).map((item, itemIndex) => (
            <div
              key={item.id || `item-${itemIndex}`}
              className={itemCardClass}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={["text-xs font-extrabold", isDark ? "text-white/45" : "text-zinc-600"].join(" ")}>
                  Item {itemIndex + 1}
                </p>

                <button
                  type="button"
                  onClick={() => onRemoveItem(index, itemIndex)}
                  className={["inline-flex items-center gap-2 text-sm font-extrabold transition", isDark ? "text-red-300 hover:text-red-200" : "text-red-700 hover:underline"].join(" ")}
                >
                  <Trash className="h-4 w-4" />
                  Remover item
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                    Nome
                  </label>
                  <div className="relative">
                    <Layers3 className={["pointer-events-none absolute left-3 top-[50%] h-4 w-4 -translate-y-1/2", isDark ? "text-white/30" : "text-zinc-400"].join(" ")} />
                    <input
                      type="text"
                      value={item.nome}
                      onChange={(e) =>
                        onChangeItem(index, itemIndex, { nome: e.target.value })
                      }
                      className={[inputClass, "pl-10"].join(" ")}
                    />
                  </div>
                </div>

                <div>
                  <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                    Preço extra
                  </label>
                  <div className="relative">
                    <CircleDollarSign className={["pointer-events-none absolute left-3 top-[50%] h-4 w-4 -translate-y-1/2", isDark ? "text-white/30" : "text-zinc-400"].join(" ")} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.precoExtra}
                      onChange={(e) =>
                        onChangeItem(index, itemIndex, {
                          precoExtra: e.target.value,
                        })
                      }
                      className={[inputClass, "pl-10"].join(" ")}
                    />
                  </div>
                </div>

                <div>
                  <label className={["text-xs font-extrabold", isDark ? "text-white/70" : "text-zinc-700"].join(" ")}>
                    Estoque
                  </label>
                  <div className="relative">
                    <Boxes className={["pointer-events-none absolute left-3 top-[50%] h-4 w-4 -translate-y-1/2", isDark ? "text-white/30" : "text-zinc-400"].join(" ")} />
                    <input
                      type="number"
                      min="0"
                      value={item.estoque}
                      onChange={(e) =>
                        onChangeItem(index, itemIndex, {
                          estoque: e.target.value,
                        })
                      }
                      placeholder="Opcional"
                      className={[inputClass, "pl-10"].join(" ")}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <label className={checkboxCardClass}>
                  <input
                    type="checkbox"
                    checked={item.ativo}
                    onChange={(e) =>
                      onChangeItem(index, itemIndex, { ativo: e.target.checked })
                    }
                  />
                  <span className={["text-sm font-semibold", isDark ? "text-white/85" : "text-zinc-800"].join(" ")}>
                    Ativo
                  </span>
                </label>
              </div>
            </div>
          ))}

          {(grupo.itens?.length ?? 0) === 0 ? (
            <div
              className={[
                "rounded-2xl border border-dashed p-4 text-center text-sm",
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white/45"
                  : "border-zinc-300 bg-white text-zinc-600",
              ].join(" ")}
            >
              Nenhum item neste grupo.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GrupoOpcionalCard;