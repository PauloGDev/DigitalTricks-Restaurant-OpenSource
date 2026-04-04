// components/cardapio/CategorySelector.jsx
export default function CategorySelector({
  categorias = [],
  categoriaAtual = "",
  disabled = false,
  onSelectCategoria,
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
      <div className="flex gap-2 min-w-max">
        {categorias.map((cat) => {
          const active = categoriaAtual === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategoria(cat)}
              disabled={disabled}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}