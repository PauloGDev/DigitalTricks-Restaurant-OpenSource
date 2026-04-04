import { formatCurrency, formatNumber } from "./AnalyticsUtils";

export default function TopProdutosRanking({ produtos = [], isDark = true }) {
  if (!produtos.length) return null;

  return (
    <div
      className={`rounded-3xl border p-5 ${
        isDark ? "border-white/10 bg-[#121212]" : "bg-white"
      }`}
    >
      <h3 className="font-bold mb-4">Top produtos</h3>

      <div className="space-y-3">
        {produtos.map((p, i) => (
          <div key={p.produtoId} className="flex items-center gap-3">
            {/* ranking */}
            <div className="text-lg font-bold w-6">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
            </div>

            {/* imagem */}
            {p.imagemUrl && (
              <img
                src={p.imagemUrl}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}

            {/* info */}
            <div className="flex-1">
              <p className="text-sm font-semibold">{p.nome}</p>
              <p className="text-xs opacity-60">
                {formatNumber(p.quantidade)} vendidos •{" "}
                {formatCurrency(p.faturamento)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}