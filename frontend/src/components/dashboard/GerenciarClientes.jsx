import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, ShoppingBag, Wallet } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const GerenciarClientes = ({ empresaId, isDark = true }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (empresaId) {
      fetchClientes();
    }
  }, [empresaId]);

  const resumo = useMemo(() => {
    const totalClientes = clientes.length;
    const totalPedidos = clientes.reduce(
      (acc, cliente) => acc + Number(cliente.totalPedidos || 0),
      0
    );
    const totalGasto = clientes.reduce(
      (acc, cliente) => acc + Number(cliente.totalGasto || 0),
      0
    );

    return { totalClientes, totalPedidos, totalGasto };
  }, [clientes]);

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/empresas/${empresaId}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao carregar clientes");

      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* HEADER */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className={[
          "rounded-3xl border p-4 sm:p-5 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white shadow-sm",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white grid place-items-center shadow-[0_12px_28px_rgba(229,37,42,0.22)]">
              <Users className="w-5 h-5" />
            </span>

            <div>
              <h2
                className={`text-xl sm:text-2xl font-extrabold ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Gerenciar clientes
              </h2>
              <p
                className={`text-sm ${
                  isDark ? "text-white/50" : "text-zinc-600"
                }`}
              >
                Visualize os clientes que já compraram no restaurante.
              </p>
            </div>
          </div>

          <div
            className={[
              "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold",
              isDark
                ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                : "border-cyan-200 bg-cyan-50 text-cyan-700",
            ].join(" ")}
          >
            Relacionamento ativo
          </div>
        </div>

        {/* RESUMO */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Clientes"
            value={resumo.totalClientes}
            icon={<Users className="w-4 h-4" />}
            isDark={isDark}
          />
          <StatCard
            label="Pedidos"
            value={resumo.totalPedidos}
            icon={<ShoppingBag className="w-4 h-4" />}
            isDark={isDark}
          />
          <StatCard
            label="Total movimentado"
            value={formatCurrency(resumo.totalGasto)}
            icon={<Wallet className="w-4 h-4" />}
            isDark={isDark}
          />
        </div>
      </motion.div>

      {/* LISTAGEM */}
      <div
        className={[
          "rounded-3xl border p-4 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white shadow-sm",
        ].join(" ")}
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonClienteCard key={index} isDark={isDark} />
            ))}
          </div>
        ) : clientes.length === 0 ? (
          <div
            className={[
              "rounded-2xl border p-8 text-center",
              isDark
                ? "border-white/10 bg-white/5 text-white/50"
                : "border-zinc-200 bg-zinc-50 text-zinc-500",
            ].join(" ")}
          >
            Nenhum cliente encontrado.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {clientes.map((cliente, index) => (
              <motion.div
                key={cliente.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.04,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className={[
                  "rounded-2xl border p-4 transition-all",
                  isDark
                    ? "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className={`truncate text-sm font-extrabold ${
                        isDark ? "text-white" : "text-zinc-900"
                      }`}
                    >
                      {cliente.nome}
                    </h3>

                    <div
                      className={`mt-1 flex items-center gap-2 text-sm ${
                        isDark ? "text-white/55" : "text-zinc-600"
                      }`}
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                  </div>

                  <span
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-[11px] font-extrabold",
                      isDark
                        ? "border-white/10 bg-white/5 text-white/70"
                        : "border-zinc-200 bg-zinc-50 text-zinc-700",
                    ].join(" ")}
                  >
                    ID #{cliente.id}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniInfoCard
                    label="Pedidos"
                    value={cliente.totalPedidos ?? 0}
                    isDark={isDark}
                  />
                  <MiniInfoCard
                    label="Total gasto"
                    value={formatCurrency(cliente.totalGasto)}
                    isDark={isDark}
                    highlight
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const StatCard = ({ label, value, icon, isDark }) => (
  <div
    className={[
      "rounded-2xl border p-4",
      isDark
        ? "border-white/10 bg-white/5"
        : "border-zinc-200 bg-zinc-50",
    ].join(" ")}
  >
    <div
      className={`flex items-center gap-2 text-xs font-bold ${
        isDark ? "text-white/45" : "text-zinc-500"
      }`}
    >
      <span className="text-[#E5252A]">{icon}</span>
      {label}
    </div>

    <div
      className={`mt-2 text-lg font-extrabold ${
        isDark ? "text-white" : "text-zinc-900"
      }`}
    >
      {value}
    </div>
  </div>
);

const MiniInfoCard = ({ label, value, isDark, highlight = false }) => (
  <div
    className={[
      "rounded-2xl border px-3 py-3",
      highlight
        ? isDark
          ? "border-[#E5252A]/20 bg-[#E5252A]/10"
          : "border-red-200 bg-red-50"
        : isDark
        ? "border-white/10 bg-white/5"
        : "border-zinc-200 bg-zinc-50",
    ].join(" ")}
  >
    <p
      className={`text-[11px] font-extrabold uppercase tracking-[0.08em] ${
        highlight
          ? isDark
            ? "text-red-300"
            : "text-red-600"
          : isDark
          ? "text-white/45"
          : "text-zinc-500"
      }`}
    >
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-extrabold ${
        highlight
          ? isDark
            ? "text-white"
            : "text-zinc-900"
          : isDark
          ? "text-white"
          : "text-zinc-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const SkeletonClienteCard = ({ isDark }) => (
  <div
    className={[
      "rounded-2xl border p-4",
      isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white",
    ].join(" ")}
  >
    <div
      className={`h-4 w-40 rounded animate-pulse ${
        isDark ? "bg-white/10" : "bg-zinc-200"
      }`}
    />
    <div
      className={`mt-3 h-3 w-56 rounded animate-pulse ${
        isDark ? "bg-white/10" : "bg-zinc-200"
      }`}
    />
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div
        className={`h-16 rounded-2xl animate-pulse ${
          isDark ? "bg-white/10" : "bg-zinc-200"
        }`}
      />
      <div
        className={`h-16 rounded-2xl animate-pulse ${
          isDark ? "bg-white/10" : "bg-zinc-200"
        }`}
      />
    </div>
  </div>
);

export default GerenciarClientes;