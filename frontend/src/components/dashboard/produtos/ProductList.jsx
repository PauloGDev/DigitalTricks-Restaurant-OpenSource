import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const ProductSkeletonCard = () => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow animate-pulse flex flex-col gap-3">
      <div className="bg-gray-600 h-40 rounded-md w-full" />
      <div className="bg-gray-600 h-4 w-3/4 rounded" />
      <div className="bg-gray-600 h-3 w-full rounded" />
      <div className="bg-gray-600 h-3 w-5/6 rounded" />
      <div className="bg-gray-600 h-8 w-1/2 rounded mt-2 self-start" />
    </div>
  );
};

const ProductList = ({
  produtos,
  onChange,
  onEdit,
  loading,
  onProdutoAtualizado,
}) => {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ProductSkeletonCard />
          </motion.div>
        ))}
      </div>
    );
  }

  if (!produtos?.length) {
    return (
      <p className="text-gray-400 text-center mt-12">
        Nenhum produto encontrado.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {produtos.map((p) => (
        <ProductCard
          key={p.id}
          produto={p}
          onChange={onChange}
          onEdit={onEdit}
          onProdutoAtualizado={onProdutoAtualizado}
        />
      ))}
    </div>
  );
};

export default ProductList;