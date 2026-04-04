import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  MapPin,
  Receipt,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";

/**
 * UsuarioPerfilModal
 * - Fundo branco + ações vermelhas (tema restaurante)
 * - Modal central (popup)
 * - Lista de pedidos do cliente (assume perfil.pedidos[])
 *
 * Esperado (flexível):
 * perfil = {
 *   username, nome, email, telefone, status,
 *   enderecos: [{ id, logradouro, numero, complemento, bairro, cidade, estado, cep, padrao }],
 *   pedidos: [{
 *     id, codigo, createdAt/data, status, total, formaPagamento, entrega, itens:[{nome, quantidade, preco}]
 *   }]
 * }
 */
const UsuarioPerfilModal = ({ perfil, onClose }) => {
  const inicial = (perfil?.username?.[0] || perfil?.nome?.[0] || "?")
    .toString()
    .toUpperCase();

  const pedidos = useMemo(() => {
    const p = perfil?.pedidos;
    return Array.isArray(p) ? p : [];
  }, [perfil]);

  // ESC + trava scroll
  useEffect(() => {
    if (!perfil) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [perfil, onClose]);

  const brl = (v) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      Number(v || 0)
    );

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    const s = (status || "").toString().toUpperCase();
    if (s.includes("ENTREG")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("CANCEL")) return "bg-red-50 text-red-700 border-red-200";
    if (s.includes("PREPAR") || s.includes("COZIN")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("PEND") || s.includes("AGUAR")) return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-zinc-50 text-zinc-700 border-zinc-200";
  };

  if (!perfil) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-40 bg-black/45"
        onMouseDown={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        key="modal-wrap"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
      >
        <motion.div
          initial={{ y: 14, opacity: 0.95 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0.95 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Perfil do usuário"
          className={[
            "w-full sm:max-w-5xl",
            "bg-white text-zinc-900",
            "rounded-t-2xl sm:rounded-2xl",
            "border border-zinc-200 shadow-xl",
            "overflow-hidden",
            "max-h-[92vh] sm:max-h-[86vh]",
            "flex flex-col",
          ].join(" ")}
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-zinc-200 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-full bg-red-600 text-white grid place-items-center font-bold">
                  {inicial}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold truncate">
                    {perfil.username || perfil.nome || "Cliente"}
                  </h3>
                  <p className="text-sm text-zinc-600 truncate">{perfil.email || "—"}</p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={[
                        "inline-flex items-center gap-2",
                        "px-3 py-1 rounded-full border text-xs font-semibold",
                        statusBadge(perfil.status),
                      ].join(" ")}
                    >
                      <Shield className="w-4 h-4" />
                      {perfil.status || "—"}
                    </span>

                    {perfil.telefone ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700">
                        <Phone className="w-4 h-4" />
                        {perfil.telefone}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition grid place-items-center"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-zinc-700" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 sm:px-6 py-5 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Coluna 1: dados */}
              <div className="space-y-4">
                <SectionTitle icon={<User className="w-4 h-4" />} title="Dados do cliente" />
                <div className="grid gap-3">
                  <InfoRow icon={<User className="w-4 h-4" />} label="Nome" value={perfil.nome || "—"} />
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={perfil.email || "—"} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Telefone" value={perfil.telefone || "—"} />
                  <InfoRow icon={<Shield className="w-4 h-4" />} label="Status" value={perfil.status || "—"} />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs text-zinc-600">
                    Dica: aqui você pode conferir histórico e endereços para facilitar atendimento e entrega.
                  </p>
                </div>
              </div>

              {/* Coluna 2: endereços */}
              <div className="space-y-4">
                <SectionTitle icon={<MapPin className="w-4 h-4" />} title="Endereços" />

                {perfil.enderecos?.length > 0 ? (
                  <ul className="space-y-3">
                    {perfil.enderecos.map((e) => (
                      <li
                        key={e.id}
                        className="rounded-xl border border-zinc-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-900">
                              {e.logradouro}, {e.numero}
                            </p>

                            {e.complemento ? (
                              <p className="text-sm text-zinc-600">{e.complemento}</p>
                            ) : null}

                            <p className="text-sm text-zinc-600">
                              {e.bairro}, {e.cidade}/{e.estado} • {e.cep}
                            </p>
                          </div>

                          {e.padrao ? (
                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
                              Padrão
                            </span>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyBox text="Nenhum endereço cadastrado." />
                )}
              </div>

              {/* Coluna 3: pedidos */}
              <div className="space-y-4">
                <SectionTitle icon={<Receipt className="w-4 h-4" />} title="Pedidos do cliente" />

                {pedidos.length ? (
                  <div className="space-y-3">
                    {pedidos.map((p) => {
                      const itens = Array.isArray(p?.itens) ? p.itens : [];
                      const titulo = p?.codigo ? `Pedido #${p.codigo}` : `Pedido #${p?.id ?? "—"}`;
                      const total = p?.total ?? p?.valorTotal ?? 0;

                      return (
                        <div
                          key={p?.id ?? p?.codigo ?? Math.random()}
                          className="rounded-xl border border-zinc-200 bg-white"
                        >
                          <div className="p-4 border-b border-zinc-200">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-zinc-900 truncate">{titulo}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(p?.createdAt || p?.data || p?.criadoEm)}
                                  </span>

                                  {p?.formaPagamento ? (
                                    <span className="inline-flex items-center gap-1">
                                      <CreditCard className="w-4 h-4" />
                                      {p.formaPagamento}
                                    </span>
                                  ) : null}

                                  {p?.entrega ? (
                                    <span className="inline-flex items-center gap-1">
                                      <Truck className="w-4 h-4" />
                                      {p.entrega}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={[
                                    "inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold",
                                    statusBadge(p?.status),
                                  ].join(" ")}
                                >
                                  {p?.status || "—"}
                                </span>
                                <p className="mt-2 font-bold text-red-600">{brl(total)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4">
                            {itens.length ? (
                              <ul className="space-y-2">
                                {itens.slice(0, 4).map((it, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-center justify-between gap-3 text-sm"
                                  >
                                    <span className="text-zinc-800">
                                      <span className="font-semibold">{it.quantidade ?? 1}x</span>{" "}
                                      {it.nome || "Item"}
                                    </span>
                                    <span className="text-zinc-700 font-semibold">
                                      {brl(it.preco ?? it.valor ?? 0)}
                                    </span>
                                  </li>
                                ))}
                                {itens.length > 4 ? (
                                  <li className="text-xs text-zinc-500">
                                    + {itens.length - 4} item(ns)
                                  </li>
                                ) : null}
                              </ul>
                            ) : (
                              <p className="text-sm text-zinc-500">Itens não disponíveis neste pedido.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyBox text="Nenhum pedido encontrado para este cliente." />
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 border-t border-zinc-200 bg-white flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition font-semibold text-zinc-800"
            >
              Fechar
            </button>

            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-500 transition text-white font-semibold"
            >
              OK
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SectionTitle = ({ icon, title }) => (
  <div className="flex items-center gap-2">
    <span className="text-red-600">{icon}</span>
    <h4 className="text-sm font-bold text-zinc-900">{title}</h4>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3">
    <div className="text-red-600 mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-900 truncate">{value}</p>
    </div>
  </div>
);

const EmptyBox = ({ text }) => (
  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
    <p className="text-sm text-zinc-600">{text}</p>
  </div>
);

export default UsuarioPerfilModal;