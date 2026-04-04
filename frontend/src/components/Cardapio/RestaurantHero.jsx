import {
  Clock3,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Store,
  BadgeDollarSign,
  PackageCheck,
  Truck,
} from "lucide-react";
import DeliveryAddressCard from "./DeliveryAddressCard";
import { useEffect } from "react";

function MetaItem({ icon: Icon, children, tone = "default" }) {
  const toneClass =
    tone === "highlight"
      ? "bg-red-50 text-red-700 ring-red-100"
      : tone === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-zinc-100 text-zinc-700 ring-zinc-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="truncate">{children}</span>
    </span>
  );
}

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

function buildEnderecoRestaurante(restaurante) {
  const parts = [
    restaurante?.logradouro,
    restaurante?.numero ? `, ${restaurante.numero}` : "",
    restaurante?.bairro ? ` • ${restaurante.bairro}` : "",
    restaurante?.cidade ? ` • ${restaurante.cidade}` : "",
    restaurante?.uf ? `/${restaurante.uf}` : "",
  ].filter(Boolean);

  return parts.length ? parts.join("") : null;
}

export default function RestaurantHero({
  restaurante,
  endereco,
  onTrocarEndereco,
  onVerPerfil,
  onVerPedido,
}) {
  const logoSrc = restaurante?.logoUrl || restaurante?.logo || "";
  const capaSrc = restaurante?.capaUrl || restaurante?.capa || logoSrc || "";
  const nomeRestaurante =
    restaurante?.nomeFantasia || restaurante?.nome || "Restaurante";

  useEffect(() => {
    console.log("🔥 RESTAURANTE COMPLETO:", restaurante);
    console.log("🖼️ logoSrc:", logoSrc);
    console.log("🖼️ capaSrc:", capaSrc);
    console.log("📛 nomeRestaurante:", nomeRestaurante);
  }, [restaurante, logoSrc, capaSrc, nomeRestaurante]);

  const abertoAgora = Boolean(restaurante?.abertoAgora);
  const enderecoRestaurante = buildEnderecoRestaurante(restaurante);

  const aceitaDelivery = Boolean(restaurante?.aceitaDelivery);
  const aceitaRetirada = Boolean(restaurante?.aceitaRetirada);

  const pedidoMinimo =
    restaurante?.pedidoMinimoDelivery != null
      ? formatCurrency(restaurante.pedidoMinimoDelivery)
      : restaurante?.pedidoMinimo != null
      ? formatCurrency(restaurante.pedidoMinimo)
      : null;

  const taxaEntrega =
    restaurante?.taxaEntregaFixa != null
      ? formatCurrency(restaurante.taxaEntregaFixa)
      : restaurante?.taxaEntrega
      ? restaurante.taxaEntrega
      : null;

  const horarioResumo =
    restaurante?.horariosFuncionamento || restaurante?.horarios?.length
      ? "Horários configurados"
      : null;

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative h-[180px] sm:h-[220px] lg:h-[260px]">
        {capaSrc ? (
          <>
            <img
              src={capaSrc}
              alt={nomeRestaurante}
              className="h-full w-full object-cover"
              onLoad={() => console.log("✅ Banner carregado:", capaSrc)}
              onError={(e) => {
                console.error("❌ Erro ao carregar banner:", capaSrc);
                console.error("Evento banner:", e);
              }}
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              IMAGEM OK
            </div>
          </>
        ) : (
          <>
            <div className="h-full w-full bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              SEM IMAGEM
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-white" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8">
        <div className="mb-12 overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm sm:h-24 sm:w-24">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={nomeRestaurante}
                        className="h-full w-full object-cover"
                        onLoad={() => console.log("✅ Logo carregada:", logoSrc)}
                        onError={(e) => {
                          console.error("❌ Erro ao carregar logo:", logoSrc);
                          console.error("Evento logo:", e);
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-50 text-zinc-400">
                        <Store className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                          abertoAgora
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            abertoAgora ? "bg-emerald-500" : "bg-zinc-400"
                          }`}
                        />
                        {abertoAgora ? "Aberto agora" : "Fechado"}
                      </span>
                    </div>

                    <button
                      onClick={onVerPerfil}
                      className="group mt-2 max-w-full text-left"
                    >
                      <h1 className="line-clamp-2 text-xl font-black tracking-tight text-zinc-950 transition group-hover:text-red-600 sm:text-2xl lg:text-3xl">
                        {nomeRestaurante}
                      </h1>
                    </button>

                    {restaurante?.categoriaPreview ? (
                      <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500 sm:text-[15px]">
                        {restaurante.categoriaPreview}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {aceitaDelivery ? (
                        <MetaItem icon={Truck} tone="success">
                          Delivery
                        </MetaItem>
                      ) : null}

                      {aceitaRetirada ? (
                        <MetaItem icon={PackageCheck}>
                          Retirada
                        </MetaItem>
                      ) : null}

                      {pedidoMinimo ? (
                        <MetaItem icon={ShoppingBag}>
                          Mínimo {pedidoMinimo}
                        </MetaItem>
                      ) : null}

                      {taxaEntrega && aceitaDelivery ? (
                        <MetaItem icon={BadgeDollarSign}>
                          Entrega {taxaEntrega}
                        </MetaItem>
                      ) : null}

                      {enderecoRestaurante ? (
                        <MetaItem icon={MapPin}>
                          {enderecoRestaurante}
                        </MetaItem>
                      ) : null}

                      {horarioResumo ? (
                        <MetaItem icon={Clock3}>
                          {horarioResumo}
                        </MetaItem>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {onVerPedido ? (
                    <button
                      onClick={onVerPedido}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Ver pedido
                    </button>
                  ) : null}

                  {onVerPerfil ? (
                    <button
                      onClick={onVerPerfil}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
                    >
                      Perfil
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4">
                <DeliveryAddressCard
                  endereco={endereco}
                  onTrocarEndereco={onTrocarEndereco}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}