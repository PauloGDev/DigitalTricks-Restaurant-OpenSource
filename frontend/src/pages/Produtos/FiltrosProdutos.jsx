import { useState, useEffect } from "react";
import { Search, ArrowDownUp } from "lucide-react";

// 🔹 Função debounce
const debounce = (fn, delay = 400) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const FiltrosProdutos = ({
  categoriasDisponiveis,
  categoriasSelecionadas,
  toggleCategoria,
  limpar,
  onFiltroChange,
}) => {
  const [search, setSearch] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("maisVendidos");

  // 🔹 Dispara o callback com debounce
  useEffect(() => {
    const debounced = debounce(() => {
      onFiltroChange({
        search,
        ordenarPor,
      });
    }, 400);
    debounced();
  }, [search, ordenarPor]);

  if (!categoriasDisponiveis || categoriasDisponiveis.length === 0) {
    return <p className="text-gray-400 text-center my-6">Carregando categorias...</p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 mb-10 w-full">
      {/* 🔹 Busca por nome */}
      <div className="flex items-center gap-3 w-full max-w-md bg-gray-800 rounded-full px-4 py-2">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent w-full text-gray-200 outline-none"
        />
      </div>

      {/* 🔹 Ordenar por */}
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <ArrowDownUp size={16} className="text-gray-400" />
        <span>Ordenar por:</span>
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md text-gray-200 px-3 py-1 focus:outline-none"
        >
          <option value="maisVendidos">Mais vendidos</option>
          <option value="menorPreco">Menor preço</option>
          <option value="maiorPreco">Maior preço</option>
          <option value="nomeAsc">Nome (A–Z)</option>
          <option value="nomeDesc">Nome (Z–A)</option>
        </select>
      </div>

      {/* 🔹 Categorias */}
      <div className="flex items-center justify-center flex-wrap gap-4 text-sm">
        {categoriasDisponiveis.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategoria(cat)}
            className={`px-4 py-2 rounded-full border transition-all duration-300 ${
              categoriasSelecionadas.includes(cat)
                ? "bg-gray-200 text-gray-950 border-gray-400"
                : "bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
        {categoriasSelecionadas.length > 0 && (
          <button
            onClick={limpar}
            className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltrosProdutos;
