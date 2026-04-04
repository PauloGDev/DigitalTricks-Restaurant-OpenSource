import { motion } from "framer-motion";
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

export default function CardapioCategoriaSection({
  cat,
  sec,
  sectionRef,
  sentinelRef,
  slug,
  navigate,
  onAdicionar,
}) {
  return (
    <section
      data-cat={cat}
      ref={sectionRef}
      className="scroll-mt-[260px]"
    >
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">
            {cat}
          </h2>
        </div>
      </div>

      {sec.items.length === 0 && sec.loading ? (
        <div className="rounded-3xl border border-zinc-200 bg-white py-10 px-6 text-zinc-500 shadow-sm">
          Carregando…
        </div>
      ) : sec.items.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white py-10 px-6 text-zinc-500 shadow-sm">
          {sec.error ? "Erro ao carregar itens." : "Nenhum item nesta categoria."}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5"
        >
          {sec.items.map((produto) => (
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

      <div ref={sentinelRef} className="h-10" />

      {sec.loading && sec.items.length > 0 && (
        <div className="text-center text-zinc-500 py-6">Carregando mais…</div>
      )}

      {!sec.hasMore && sec.items.length > 0 && (
        <div className="pt-8">
          <div className="h-px w-full bg-zinc-200" />
        </div>
      )}
    </section>
  );
}