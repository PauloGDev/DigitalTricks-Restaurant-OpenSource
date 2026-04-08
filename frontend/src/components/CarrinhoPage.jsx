import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import CarrinhoItensSection from "./carrinhoPage/CarrinhoItensSection";
import EnderecoSection from "./carrinhoPage/EnderecoSection";
import usePagamentoHandler from "../hooks/UsePagamentoHandler";
import useUsuarioLogado from "../hooks/UseUsuarioLogado";
import { useNotification } from "../context/NotificationContext";
import { useCarrinho } from "../context/CarrinhoContext";
import PageTitle from "../context/PageTitle";
import FinalizarCompra from "./carrinhoPage/FinalizarCompra";
import ResumoValoresCarrinho from "./carrinho/ResumoValoresCarrinho";
import { ShoppingBag, MapPin, Store, Truck, Armchair } from "lucide-react";
import CupomSection from "./carrinhoPage/CupomSection";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const toNumber = (value) => {
  const n =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : Number(value);

  return Number.isFinite(n) ? n : 0;
};

export default function CarrinhoPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL;

  const [empresaId, setEmpresaId] = useState(null);

  const {
    carrinho,
    setCarrinho,
    incrementarItem,
    decrementarItem,
    removerDoCarrinho,
    limparCarrinho,
    loading,
    normalizarCarrinho,
    aplicarCupom,
    removerCupom,
    numeroMesa,
    setNumeroMesa,
  } = useCarrinho();

  const { usuario } = useUsuarioLogado(navigate);

  const [enderecoEntrega, setEnderecoEntrega] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mesaUrl = searchParams.get("mesa");
    if (mesaUrl && !numeroMesa) {
      setNumeroMesa(mesaUrl);
    }
  }, [searchParams, setNumeroMesa, numeroMesa]);

  const [freteInfo, setFreteInfo] = useState(null);
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState("DELIVERY");

  useEffect(() => {
  const carregarEmpresaDoRestaurante = async () => {
    try {
      if (!slug) return;

      const response = await fetch(`${API_URL}/public/restaurantes/${slug}`);
      if (!response.ok) throw new Error("Restaurante não encontrado");

      const data = await response.json();
      setEmpresaId(data?.id ?? null);
      console.log("Empresa ID do restaurante:", data?.id);
    } catch (error) {
      console.error("Erro ao carregar empresa do restaurante:", error);
      setEmpresaId(null);
    }
  };

  carregarEmpresaDoRestaurante();
}, [API_URL, slug]);

  const calcularFrete = async (endereco) => {
    try {
      if (!slug || !endereco?.id) {
        setFreteInfo(null);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      setLoadingFrete(true);

      const response = await fetch(
        `${API_URL}/restaurantes/${slug}/carrinho/frete?enderecoId=${endereco.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const t = await response.text().catch(() => "");
        throw new Error(t || "Não foi possível calcular o frete");
      }

      const data = await response.json();

      if (!data?.disponivel || !data?.frete) {
        setFreteInfo(null);
        showNotification(
          data?.mensagem || "Endereço fora da área de entrega.",
          "error"
        );
        return;
      }

      setFreteInfo(data.frete);
    } catch (error) {
      setFreteInfo(null);
      showNotification(error.message || "Erro ao calcular frete", "error");
    } finally {
      setLoadingFrete(false);
    }
  };

  useEffect(() => {
    if (!usuario) return;
    setTelefone((prev) => prev || usuario?.telefone || "");
  }, [usuario]);

  const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];

  const taxaEntrega = tipoEntrega === "DELIVERY" ? toNumber(freteInfo?.valor) : 0;

  const subtotalProdutos = useMemo(() => {
    if (carrinho?.subtotal != null) return toNumber(carrinho.subtotal);

    return itens.reduce((acc, item) => acc + toNumber(item?.subtotal), 0);
  }, [carrinho?.subtotal, itens]);

  const descontoCupom = useMemo(() => {
    return toNumber(carrinho?.descontoCupom);
  }, [carrinho?.descontoCupom]);

  const totalComFrete = useMemo(() => {
    const totalCarrinho = subtotalProdutos - descontoCupom;
    return Math.max(totalCarrinho, 0) + taxaEntrega;
  }, [subtotalProdutos, descontoCupom, taxaEntrega]);

  const podeFinalizar = useMemo(() => {
    const temItens = itens.length > 0;
    const isRetirada = tipoEntrega === "RETIRADA";
    if (isRetirada) {
      return temItens && !loading && !loadingFrete && Boolean(empresaId);
    }
    const temEndereco = Boolean(enderecoEntrega?.id);
    const freteOk = Boolean(freteInfo) || !temEndereco;
    return (
      temItens &&
      temEndereco &&
      freteOk &&
      !loading &&
      !loadingFrete &&
      Boolean(empresaId)
    );
  }, [itens.length, tipoEntrega, enderecoEntrega?.id, freteInfo, loading, loadingFrete, empresaId]);

  usePagamentoHandler({
    API_URL,
    carrinho,
    total: totalComFrete,
    freteInfo: tipoEntrega === "DELIVERY" ? freteInfo : null,
    enderecoEntrega: tipoEntrega === "RETIRADA" ? null : enderecoEntrega,
    tipoEntrega,
    usuarioData: usuario || {},
    cpf,
    telefone,
    showNotification,
    limparCarrinho: () => limparCarrinho(slug),
    setPagando,
    restauranteSlug: slug,
    numeroMesa,
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PageTitle title="Carrinho | Restaurante" />

      <div className="border-b pt-20 pb-6 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-start justify-between gap-4"
          >
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray/80">
                <ShoppingBag className="h-4 w-4" />
                Pedido
              </div>

              <h1 className="mt-2 text-2xl font-extrabold text-gray sm:text-3xl">
                Meu carrinho
              </h1>

              <p className="mt-1 text-sm text-gray/60">
                Revise os itens, selecione o endereço e finalize o pagamento.
              </p>
            </div>

            <button
              onClick={() => navigate(`/restaurante/${slug}`)}
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-gray/85 transition hover:bg-white/10 sm:inline-flex sm:items-center sm:justify-center"
            >
              Voltar ao cardápio
            </button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                    {tipoEntrega === "DELIVERY"
                      ? <Truck className="h-5 w-5 text-gray/80" />
                      : <Store className="h-5 w-5 text-gray/80" />}
                  </div>

                  <div>
                    <p className="font-extrabold text-gray">
                      {tipoEntrega === "DELIVERY" ? "Endereço de entrega" : "Retirada no local"}
                    </p>
                    <p className="text-xs text-gray/55">
                      {tipoEntrega === "DELIVERY"
                        ? "Selecione onde deseja receber o pedido"
                        : "Você irá buscar o pedido no estabelecimento"}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("DELIVERY")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-extrabold transition ${
                      tipoEntrega === "DELIVERY"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-white/10 bg-white/5 text-gray/70 hover:bg-white/10"
                    }`}
                  >
                    Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("RETIRADA")}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-extrabold transition ${
                      tipoEntrega === "RETIRADA"
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-white/10 bg-white/5 text-gray/70 hover:bg-white/10"
                    }`}
                  >
                    Retirada
                  </button>
                </div>

                {tipoEntrega === "DELIVERY" && (
                  <EnderecoSection
                    onSelect={(endereco) => {
                      setEnderecoEntrega(endereco);
                      calcularFrete(endereco);
                    }}
                    clienteId={usuario?.id}
                  />
                )}

                {tipoEntrega === "RETIRADA" && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <Store className="mx-auto h-6 w-6 text-green-600" />
                    <p className="mt-2 text-sm font-extrabold text-gray/80">Retirada no estabelecimento</p>
                    <p className="text-xs text-gray/55">Sem custo de frete</p>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <Armchair className="h-4 w-4 text-gray/60" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-gray/80">Número da Mesa <span className="font-normal text-gray/50 text-xs">(opcional)</span></p>
                      <p className="text-xs text-gray/55">Informe a mesa para pedidos no local</p>
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 5"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-gray/80 placeholder:text-gray/40 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                      <ShoppingBag className="h-5 w-5 text-gray/80" />
                    </div>

                    <div>
                      <p className="font-extrabold text-gray">Itens do carrinho</p>
                      <p className="text-xs text-gray/55">
                        {itens.length} {itens.length === 1 ? "item" : "itens"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/restaurantes/${slug}/cardapio`)}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray/85 transition hover:bg-white/10 sm:hidden"
                  >
                    Cardápio
                  </button>
                </div>

                <CarrinhoItensSection
                  carrinho={carrinho}
                  incrementarItem={(itemId) => incrementarItem(itemId, slug)}
                  decrementarItem={(itemId) => decrementarItem(itemId, slug)}
                  removerDoCarrinho={(itemId) => removerDoCarrinho(itemId, slug)}
                  showNotification={showNotification}
                  loading={loading}
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <CupomSection
                  slug={slug}
                  carrinho={carrinho}
                  setCarrinho={setCarrinho}
                  normalizarCarrinho={normalizarCarrinho}
                  showNotification={showNotification}
                  aplicarCupom={aplicarCupom}
                  removerCupom={removerCupom}
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <ResumoValoresCarrinho
                  itens={itens}
                  taxaEntrega={taxaEntrega}
                  prazoEntrega={freteInfo?.prazo ?? null}
                  tipoEntrega={tipoEntrega}
                  subtotalProdutos={subtotalProdutos}
                  descontoCupom={descontoCupom}
                  cupom={carrinho?.cupom}
                  total={totalComFrete}
                />
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div
                  id="finalizar-bloco"
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6"
                >
                  {!podeFinalizar && (
                    <div className="mb-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                      <p className="text-sm font-semibold text-gray/80">
                        Para finalizar:
                      </p>

                      <ul className="mt-2 space-y-1 text-xs text-gray/60">
                        {itens.length === 0 && <li>• Adicione itens ao carrinho</li>}
                        {tipoEntrega === "DELIVERY" && !enderecoEntrega?.id && <li>• Selecione um endereço</li>}
                        {!empresaId && <li>• Aguarde carregar os dados do restaurante</li>}
                      </ul>
                    </div>
                  )}

                  <FinalizarCompra
                    restauranteSlug={slug}
                    tipoEntrega={tipoEntrega}
                    setTipoEntrega={setTipoEntrega}
                    empresaId={empresaId}
                    enderecoId={enderecoEntrega?.id}
                    carrinho={carrinho}
                    enderecoEntrega={enderecoEntrega}
                    freteInfo={tipoEntrega === "DELIVERY" ? freteInfo : null}
                    cpf={cpf}
                    setCpf={setCpf}
                    telefone={telefone}
                    total={totalComFrete}
                    limparCarrinho={() => limparCarrinho(slug)}
                    slug={slug}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}