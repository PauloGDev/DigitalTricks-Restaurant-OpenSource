import {
  Clock3,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Store,
  BadgeDollarSign,
  PackageCheck,
  Star,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import DeliveryAddressCard from "./DeliveryAddressCard";
import RestaurantHoursCard from "./RestaurantHoursCard";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

function buildEnderecoRestaurante(restaurante) {
  if (!restaurante) return null;
  const parts = [];
  if (restaurante.logradouro) parts.push(restaurante.logradouro);
  if (restaurante.numero) parts.push(", " + restaurante.numero);
  if (restaurante.bairro) parts.push(" - " + restaurante.bairro);
  if (restaurante.cidade) parts.push(" - " + restaurante.cidade);
  if (restaurante.uf) parts.push("/" + restaurante.uf);
  return parts.length > 0 ? parts.join("") : null;
}

function buildHorarioResumo(horariosFuncionamento) {
  if (!horariosFuncionamento) return null;
  try {
    const map = typeof horariosFuncionamento === "string" ? JSON.parse(horariosFuncionamento) : horariosFuncionamento;
    const abertos = Object.entries(map)
      .filter(([, v]) => v?.aberto)
      .sort(([, a], [, b]) => {
        const order = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
        return order.indexOf(a.inicio) - order.indexOf(b.inicio);
      });
    if (abertos.length === 0) return "Fechado hoje";

    const diasMap = {
      segunda: "Seg", terca: "Ter", quarta: "Qua", quinta: "Qui",
      sexta: "Sex", sabado: "Sab", domingo: "Dom",
    };
    const primeiro = abertos[0];
    const ultimo = abertos[abertos.length - 1];
    const diaLabels = abertos.map(([d]) => diasMap[d] || d);

    if (abertos.length === 7) return `Todos os dias ${primeiro[1].inicio}-${primeiro[1].fim}`;
    if (abertos.length >= 6) return `Seg-Dom ${primeiro[1].inicio}-${primeiro[1].fim}`;
    if (abertos.length >= 3) return `${diaLabels[0]}-${diaLabels.at(-1)} ${primeiro[1].inicio}-${primeiro[1].fim}`;
    return diaLabels.join(", ") + " " + primeiro[1].inicio + " " + ultimo[1].fim;
  } catch {
    return null;
  }
}

function buildHorariosDetalhados(horariosFuncionamento) {
  if (!horariosFuncionamento) return [];
  try {
    const map = typeof horariosFuncionamento === "string" ? JSON.parse(horariosFuncionamento) : horariosFuncionamento;
    const orden = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
    const labels = {
      segunda: "Segunda", terca: "Terca", quarta: "Quarta", quinta: "Quinta",
      sexta: "Sexta", sabado: "Sabado", domingo: "Domingo",
    };
    return orden
      .filter((d) => map[d])
      .map((d) => ({
        dia: labels[d],
        abre: map[d].inicio || "--:--",
        fecha: map[d].fim || "--:--",
      }));
  } catch {
    return [];
  }
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
  const nomeRestaurante = restaurante?.nomeFantasia || restaurante?.nome || "Restaurante";

  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    console.log("[restaurante] dados:", restaurante);
  }, [restaurante]);

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

  const horarioResumo = buildHorarioResumo(restaurante?.horariosFuncionamento);
  const horariosDetalhados = buildHorariosDetalhados(restaurante?.horariosFuncionamento);

  return (
    <section className="relative overflow-hidden bg-zinc-50 pb-4 sm:pb-6">
      <div className="relative h-[200px] sm:h-[260px] lg:h-[300px]">
        {capaSrc ? (
          <>
            <img
              src={capaSrc}
              alt={nomeRestaurante}
              className="h-full w-full object-cover"
              onLoad={() => console.log("Banner carregado:", capaSrc)}
              onError={(e) => {
                console.error("Erro ao carregar banner:", capaSrc);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/50" />
          </>
        ) : (
          <div className="relative h-full w-full bg-gradient-to-br from-red-600 via-red-500 to-orange-400">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
          </div>
        )}

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md ${
              abertoAgora
                ? "bg-emerald-600/90 text-white"
                : "bg-zinc-800/80 text-zinc-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${abertoAgora ? "bg-white" : "bg-zinc-400"}`} />
            {abertoAgora ? "Aberto" : "Fechado"}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-zinc-200/80 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:p-5">
          <div className="flex items-start gap-4">
            <div className="relative -mt-8 sm:-mt-12 h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border-4 border-white bg-zinc-100 shadow-lg sm:h-24 sm:w-24 sm:rounded-[1.5rem]">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={nomeRestaurante}
                  className="h-full w-full object-cover"
                  onLoad={() => console.log("Logo carregada:", logoSrc)}
                  onError={(e) => {
                    console.error("Erro ao carregar logo:", logoSrc);
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400">
                  <Store className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pt-0">
              <h1 className="line-clamp-1 text-xl font-black tracking-tight text-zinc-900 sm:text-2xl">
                {nomeRestaurante}
              </h1>

              {restaurante?.categoriaPreview && (
                <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">
                  {restaurante.categoriaPreview}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  <span className="font-bold text-zinc-900">
                    {restaurante?.avaliacao || "4.8"}
                  </span>
                </span>

                {horariosDetalhados.length > 0 && horarioResumo && (
                  <button
                    onClick={() => setShowHours((p) => !p)}
                    className="inline-flex items-center gap-1 transition hover:text-red-600"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-semibold">{horarioResumo}</span>
                    <ChevronDown className={`h-3 w-3 transition ${showHours ? "rotate-180" : ""}`} />
                  </button>
                )}

                {enderecoRestaurante && (
                  <span className="inline-flex items-center gap-1 truncate max-w-[200px]" title={enderecoRestaurante}>
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="truncate">{enderecoRestaurante}</span>
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {aceitaDelivery && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Delivery
                    {taxaEntrega && (
                      <span className="text-emerald-500">- {taxaEntrega}</span>
                    )}
                  </span>
                )}

                {aceitaRetirada && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-700">
                    <PackageCheck className="h-3.5 w-3.5" />
                    Retirada
                  </span>
                )}

                {pedidoMinimo && aceitaDelivery && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                    <BadgeDollarSign className="h-3.5 w-3.5" />
                    Min {pedidoMinimo}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden shrink-0 flex-col gap-2 sm:flex">
              {onVerPedido && (
                <button
                  onClick={onVerPedido}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Ver pedido
                </button>
              )}
            </div>
          </div>

          {showHours && horariosDetalhados.length > 0 && (
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <RestaurantHoursCard
                abertoAgora={abertoAgora}
                horarios={horariosDetalhados}
              />
            </div>
          )}

          <div className="mt-4 border-t border-zinc-100 pt-4">
            <DeliveryAddressCard
              endereco={endereco}
              onTrocarEndereco={onTrocarEndereco}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
