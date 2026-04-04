import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import ProdutoCard from "../../pages/Produtos/ProdutoCard";

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.03 } },
  exit: { opacity: 0 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

export default function CardapioSearchResults({
  filtros,
  loadingInicial,
  searchList,
  searchSentinelRef,
  searchLoading,
  searchHasMore,
  slug,
  navigate,
  onAdicionar,
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm">
        <p className="text-sm text-zinc-500">
          Resultados para{" "}
          <span className="font-bold text-zinc-900">“{filtros.search}”</span>
        </p>
      </div>

      {loadingInicial && searchList.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-500 shadow-sm">
          Carregando…
        </div>
      ) : searchList.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white py-16 text-center text-zinc-600 shadow-sm flex items-center justify-center gap-2">
          <XCircle className="w-6 h-6" />
          Nenhum item encontrado.
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
        >
          {searchList.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              variants={cardVariants}
              onClick={() =>
                navigate(`/restaurante/${slug}/produtos/${produto.slug}`)
              }
              onAdicionar={onAdicionar}
            />
          ))}
        </motion.div>
      )}

      <div ref={searchSentinelRef} className="h-8" />

      {searchLoading && (
        <div className="text-center text-zinc-500 py-6">Carregando mais…</div>
      )}

      {!searchHasMore && searchList.length > 0 && (
        <p className="text-center text-zinc-400 text-sm py-6">
          Você chegou ao fim dos resultados.
        </p>
      )}
    </div>
  );
}