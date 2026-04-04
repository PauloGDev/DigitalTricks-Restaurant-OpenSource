import { Hourglass, PlusCircle, MinusCircle, Trash2, ShoppingBag } from "lucide-react";
import CarrinhoLista from "../../components/carrinho/CarrinhoLista";

export default function CarrinhoItensSection({
  carrinho,
  incrementarItem,
  decrementarItem,
  removerDoCarrinho,
  showNotification,
  loading,
}) {
  // ✅ Compatível com carrinho como { itens: [] } OU como array direto []
  const itens = Array.isArray(carrinho) ? carrinho : carrinho?.itens || [];
  const vazio = !loading && itens.length === 0;

  if (loading) {
    return (
      <div className="py-10">
        <div className="flex items-center gap-3 text-zinc-600">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50">
            <Hourglass className="h-5 w-5 animate-spin" />
          </span>
          <div>
            <p className="font-extrabold text-zinc-900">Carregando seu carrinho</p>
            <p className="text-sm text-zinc-500">Aguarde um instante…</p>
          </div>
        </div>

        {/* skeleton list */}
        <div className="mt-6 grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100" />
                <div className="flex-1">
                  <div className="h-4 w-2/3 rounded bg-zinc-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
                  <div className="mt-4 h-10 w-full rounded-2xl bg-zinc-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (vazio) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-zinc-200 grid place-items-center">
          <ShoppingBag className="h-6 w-6 text-zinc-600" />
        </div>
        <h3 className="mt-4 text-base sm:text-lg font-extrabold text-zinc-900">
          Nenhum item no carrinho
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          Volte ao cardápio e adicione seus itens para continuar.
        </p>
      </div>
    );
  }

  return (
    <CarrinhoLista
      itens={itens}
      incrementar={(id) => {
        incrementarItem(id);
        showNotification(
          <>
            <PlusCircle className="inline w-4 h-4 mr-1" />
            Quantidade atualizada
          </>,
          "info"
        );
      }}
      decrementar={(id) => {
        decrementarItem(id);
        showNotification(
          <>
            <MinusCircle className="inline w-4 h-4 mr-1" />
            Quantidade atualizada
          </>,
          "info"
        );
      }}
      remover={(id) => {
        removerDoCarrinho(id);
        showNotification(
          <>
            <Trash2 className="inline w-4 h-4 mr-1" />
            Produto removido do carrinho
          </>,
          "error"
        );
      }}
    />
  );
}