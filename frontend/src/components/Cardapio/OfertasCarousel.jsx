import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Percent } from "lucide-react";
import ProdutoModal from "../../pages/Produtos/ProdutoModal";

const formatMoney = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const parseMoney = (value) => {
  if (value == null) return 0;
  if (typeof value === "number") return value;

  const raw = String(value).trim();
  if (!raw) return 0;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  let normalized = raw.replace(/[^\d,.-]/g, "");

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getMenorPrecoOriginalVariacao = (produto) => {
  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];

  const precos = variacoes
    .map((v) => parseMoney(v?.preco ?? v?.precoBase ?? 0))
    .filter((v) => v > 0);

  return precos.length ? Math.min(...precos) : 0;
};

const getMenorPrecoPromocionalVariacao = (produto) => {
  const variacoes = Array.isArray(produto?.variacoes) ? produto.variacoes : [];

  const promocionais = variacoes
    .map((v) =>
      parseMoney(v?.precoPromocional ?? v?.precoOferta ?? v?.promocaoPreco ?? 0)
    )
    .filter((v) => v > 0);

  return promocionais.length ? Math.min(...promocionais) : 0;
};

const getPreco = (produto) => {
  const precoDireto = parseMoney(
    produto?.preco ??
      produto?.precoBase ??
      produto?.precoMinimo ??
      produto?.valor ??
      produto?.precoVenda ??
      0
  );

  if (precoDireto > 0) return precoDireto;

  return getMenorPrecoOriginalVariacao(produto);
};

const getPrecoPromocional = (produto) => {
  const promocionalDireto = parseMoney(
    produto?.precoPromocional ??
      produto?.valorPromocional ??
      produto?.precoOferta ??
      produto?.promocaoPreco ??
      0
  );

  if (promocionalDireto > 0) return promocionalDireto;

  return getMenorPrecoPromocionalVariacao(produto);
};

const hasOferta = (produto) => {
  const preco = getPreco(produto);
  const precoPromocional = getPrecoPromocional(produto);

  return (
    produto?.ofertaVigente === true ||
    produto?.emOferta === true ||
    (preco > 0 && precoPromocional > 0 && precoPromocional < preco)
  );
};

const pickTotalStock = (produto) => {
  const vars = Array.isArray(produto?.variacoes) ? produto.variacoes : [];
  if (vars.length) {
    let total = 0;
    for (const v of vars) total += Number(v?.estoque) || 0;
    return total;
  }
  return Number(produto?.estoque) || 0;
};

export default function OfertasCarousel({ produtos = [], onAdicionar }) {
  const navigate = useNavigate();
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const produtosValidos = useMemo(
    () =>
      (Array.isArray(produtos) ? produtos : []).filter(
        (produto) => produto?.id && hasOferta(produto)
      ),
    [produtos]
  );

  const goLoginIfNeeded = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return true;
    }
    return false;
  }, [navigate]);

  const handleOpenProduto = useCallback(
    (produto) => {
      const estoqueTotal = pickTotalStock(produto);
      const indisponivel = !produto?.ativo || estoqueTotal <= 0;

      const preco = getPreco(produto);
      const precoPromocional = getPrecoPromocional(produto);

      const precoFinal =
        preco > 0 && precoPromocional > 0 && precoPromocional < preco
          ? precoPromocional
          : preco;

      if (indisponivel || precoFinal <= 0) return;
      if (goLoginIfNeeded()) return;

      setProdutoSelecionado(produto);
    },
    [goLoginIfNeeded]
  );

  if (produtosValidos.length === 0) return null;

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Percent className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 sm:text-2xl">
              Em oferta hoje
            </h2>
            <p className="text-sm text-zinc-500">
              Aproveite os itens com preço especial
            </p>
          </div>
        </div>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none">
          {produtosValidos.map((produto) => {
            const preco = getPreco(produto);
            const precoPromocional = getPrecoPromocional(produto);

            const precoExibido =
              preco > 0 && precoPromocional > 0 && precoPromocional < preco
                ? precoPromocional
                : preco;

            const desconto =
              preco > 0 && precoExibido > 0 && precoExibido < preco
                ? Math.round(((preco - precoExibido) / preco) * 100)
                : 0;

            const semPrecoValido = preco <= 0 && precoExibido <= 0;

            return (
              <button
                key={produto.id}
                type="button"
                onClick={() => handleOpenProduto(produto)}
                className="group min-w-[285px] max-w-[285px] snap-start overflow-hidden rounded-[2rem] border border-zinc-200 bg-white text-left shadow-sm transition hover:-translate-y-1 sm:min-w-[320px] sm:max-w-[320px]"
              >
                <div className="relative h-44 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={
                      produto?.imagem ||
                      produto?.imagemUrl ||
                      produto?.foto ||
                      "/placeholder-food.jpg"
                    }
                    alt={produto?.nome || "Produto"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                  {desconto > 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                      -{desconto}%
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-black text-zinc-900">
                      {produto?.nome}
                    </h3>

                    {produto?.descricao && (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                        {produto.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="flex flex-col">
                      {semPrecoValido ? (
                        <span className="text-sm font-semibold text-zinc-500">
                          Consulte opções
                        </span>
                      ) : precoExibido < preco ? (
                        <>
                          <span className="text-sm text-zinc-400 line-through">
                            {formatMoney(preco)}
                          </span>
                          <span className="text-lg font-black text-emerald-600">
                            {formatMoney(precoExibido)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-black text-zinc-900">
                          {formatMoney(precoExibido)}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700">
                      Ver
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {produtoSelecionado?.ativo && (
        <ProdutoModal
          produto={produtoSelecionado}
          onClose={() => setProdutoSelecionado(null)}
          onAdicionar={onAdicionar}
        />
      )}
    </>
  );
}