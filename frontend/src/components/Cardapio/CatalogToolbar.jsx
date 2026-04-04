// components/cardapio/CatalogToolbar.jsx
import { ChevronDown, Search, ShoppingBag, SlidersHorizontal } from "lucide-react";

export default function CatalogToolbar({
  filtros,
  onSearchChange,
  onOrdenarChange,
  mobileFiltrosOpen,
  setMobileFiltrosOpen,
  onIrCarrinho,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,220px,auto] gap-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          defaultValue={filtros.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar pratos, combos, bebidas..."
          className="w-full h-14 rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
        />
      </div>

      <div className="relative">
        <select
          value={filtros.ordenarPor}
          onChange={(e) => onOrdenarChange(e.target.value)}
          className="w-full h-14 appearance-none rounded-2xl border border-zinc-200 bg-white px-4 pr-10 text-sm font-medium text-zinc-800 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition"
        >
          <option value="maisVendidos">Mais vendidos</option>
          <option value="menorPreco">Menor preço</option>
          <option value="maiorPreco">Maior preço</option>
          <option value="nomeAsc">Nome A-Z</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setMobileFiltrosOpen(!mobileFiltrosOpen)}
          className="inline-flex lg:hidden items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 h-14 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filtros
        </button>

        <button
          onClick={onIrCarrinho}
          className="hidden md:inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 h-14 text-sm font-semibold text-white hover:bg-red-500 transition shadow-sm"
        >
          <ShoppingBag className="h-5 w-5" />
          Ver pedido
        </button>
      </div>
    </div>
  );
}