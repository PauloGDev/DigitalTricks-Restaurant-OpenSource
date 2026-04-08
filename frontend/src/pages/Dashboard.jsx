import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingBag, ChevronRight, Package, Users, TicketPercent, BarChart3, Store, QrCode } from "lucide-react";
import PageTitle from "../context/PageTitle";
import GerenciarProdutos from "../components/dashboard/GerenciarProdutos";
import GerenciarUsuarios from "../components/dashboard/GerenciarUsuarios";
import GerenciarClientes from "../components/dashboard/GerenciarClientes";
import GerenciarPedidos from "../components/dashboard/GerenciarPedidos";
import Sidebar from "../components/dashboard/SideBar";
import GerenciarCupons from "../components/dashboard/cupons/GerenciarCupons";
import DashboardAnalytics from "../components/dashboard/analytics/DashboardAnalytics";
import GerenciarPerfil from "../components/dashboard/GerenciarPerfil";
import GerenciarQRCode from "../components/dashboard/GerenciarQRCode";
import { useRestaurantNotifications } from "../context/RestaurantNotificationContext";
import { useAuth } from "../context/AuthContext";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

const Dashboard = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState("pedidos");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pedidoRefreshKey, setPedidoRefreshKey] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("navbar-theme-override") || "dark"
  );

  const { user, loadingAuth } = useAuth();

  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/dashboard/login", { replace: true });
    }
  }, [user, loadingAuth, navigate]);

  const empresaId = user?.empresaId;

  useEffect(() => {
    const syncTheme = () => {
      setTheme(localStorage.getItem("navbar-theme-override") || "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const isDark = theme === "dark";

  const {
    conectado,
    notificacoes,
    ultimoPedido,
    quantidadeNaoLidas,
    marcarTodasComoLidas,
    limparNotificacoes,
  } = useRestaurantNotifications();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");

      if (
        ["produtos", "usuarios", "clientes", "pedidos", "cupons", "analytics", "perfil", "qrcode"].includes(hash)
      ) {
        setSection(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (!ultimoPedido) return;
    setPedidoRefreshKey((prev) => prev + 1);
  }, [ultimoPedido]);

  const changeSection = (key) => {
    window.location.hash = key;
    setSection(key);
    setSidebarOpen(false);
  };

  const abrirNotificacoes = () => {
    const proximoEstado = !notifOpen;
    setNotifOpen(proximoEstado);

    if (proximoEstado) {
      marcarTodasComoLidas();
    }
  };

  const irParaPedidos = () => {
    changeSection("pedidos");
    setNotifOpen(false);
    marcarTodasComoLidas();
  };

  const renderSection = {
    produtos: <GerenciarProdutos user={user} />,
    usuarios: <GerenciarUsuarios isDark={isDark} empresaId={empresaId} />,
    clientes: <GerenciarClientes isDark={isDark} empresaId={empresaId} />,
    pedidos: <GerenciarPedidos isDark={isDark} refreshKey={pedidoRefreshKey} />,
    cupons: <GerenciarCupons isDark={isDark} user={user} />,
    analytics: <DashboardAnalytics isDark={isDark} empresaId={empresaId} />,
    perfil: <GerenciarPerfil isDark={isDark} empresaId={empresaId} />,
    qrcode: <GerenciarQRCode isDark={isDark} />,
  }[section];

  const sectionLabel =
    section === "pedidos"
      ? "Pedidos"
      : section === "produtos"
      ? "Cardápio"
      : section === "cupons"
      ? "Cupons"
      : section === "usuarios"
      ? "Equipe"
      : section === "clientes"
      ? "Clientes"
      : section === "analytics"
      ? "Analytics"
      : section === "perfil"
      ? "Perfil do restaurante"
      : section === "qrcode"
      ? "QR Code Cardápio"
      : "Dashboard";

  const sectionDescription =
    section === "produtos"
      ? "o cardápio do restaurante"
      : section === "usuarios"
      ? "a equipe da empresa"
      : section === "clientes"
      ? "os clientes cadastrados"
      : section === "cupons"
      ? "os cupons e regras promocionais"
      : section === "analytics"
      ? "as métricas e indicadores"
      : section === "perfil"
      ? "os dados, endereço e pagamentos do restaurante"
      : "os pedidos em tempo real";

  const sectionMeta = useMemo(() => {
    if (section === "pedidos") {
      return {
        icon: ShoppingBag,
        badge: "Operação ao vivo",
        badgeClass: isDark
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (section === "produtos") {
      return {
        icon: Package,
        badge: "Cardápio ativo",
        badgeClass: isDark
          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
          : "border-sky-200 bg-sky-50 text-sky-700",
      };
    }

    if (section === "usuarios") {
      return {
        icon: Users,
        badge: "Controle interno",
        badgeClass: isDark
          ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
          : "border-violet-200 bg-violet-50 text-violet-700",
      };
    }

    if (section === "clientes") {
      return {
        icon: Users,
        badge: "Relacionamento",
        badgeClass: isDark
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
          : "border-cyan-200 bg-cyan-50 text-cyan-700",
      };
    }

    if (section === "cupons") {
      return {
        icon: TicketPercent,
        badge: "Promoções em foco",
        badgeClass: isDark
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    if (section === "perfil") {
      return {
        icon: Store,
        badge: "Configurações",
        badgeClass: isDark
          ? "border-gray-500/20 bg-gray-500/10 text-gray-300"
          : "border-gray-200 bg-gray-50 text-gray-700",
      };
    }

    return {
      icon: BarChart3,
      badge: "Inteligência de negócio",
      badgeClass: isDark
        ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
        : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
    };
  }, [section, isDark]);

  const CurrentSectionIcon = sectionMeta.icon;

  if (loadingAuth || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <section
      className={[
        "min-h-screen flex transition-colors duration-300",
        isDark ? "bg-[#0D0D0D] text-white" : "bg-[#F6F7FB] text-zinc-900",
      ].join(" ")}
    >
      <Sidebar
        section={section}
        changeSection={changeSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 min-h-screen overflow-y-auto px-4 pb-10 pt-20 sm:px-6 lg:px-10 md:pt-20">
        <PageTitle title={`Dashboard | ${sectionLabel}`} />

        <div className="mt-6 space-y-6">
          <div
            className={[
              "relative overflow-hidden rounded-[28px] border backdrop-blur-xl transition-colors duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                : "border-zinc-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]",
            ].join(" ")}
          >
            <div
              className={[
                "pointer-events-none absolute inset-0 opacity-100",
                isDark
                  ? "bg-[radial-gradient(circle_at_top_right,rgba(229,37,42,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_30%)]"
                  : "bg-[radial-gradient(circle_at_top_right,rgba(229,37,42,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.05),transparent_30%)]",
              ].join(" ")}
            />

            <div className="relative px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={[
                      "grid h-14 w-14 shrink-0 place-items-center rounded-3xl border",
                      isDark
                        ? "border-[#E5252A]/20 bg-gradient-to-br from-[#E5252A]/20 to-[#ff4b4f]/10 text-[#ff6b6f]"
                        : "border-red-200 bg-gradient-to-br from-red-50 to-white text-[#E5252A]",
                    ].join(" ")}
                  >
                    <CurrentSectionIcon className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-extrabold sm:text-2xl">{sectionLabel}</h1>

                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em]",
                          sectionMeta.badgeClass,
                        ].join(" ")}
                      >
                        {sectionMeta.badge}
                      </span>
                    </div>

                    <p
                      className={[
                        "mt-2 max-w-2xl text-sm leading-relaxed",
                        isDark ? "text-white/55" : "text-zinc-600",
                      ].join(" ")}
                    >
                      Gerencie {sectionDescription} com uma interface mais rápida,
                      organizada e preparada para operação diária.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold",
                      conectado
                        ? isDark
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isDark
                        ? "border-white/10 bg-white/5 text-white/70"
                        : "border-zinc-200 bg-zinc-100 text-zinc-600",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        conectado ? "bg-emerald-400" : isDark ? "bg-white/35" : "bg-zinc-400",
                      ].join(" ")}
                    />
                    {conectado ? "Tempo real ativo" : "Reconectando..."}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={abrirNotificacoes}
                      className={[
                        "relative rounded-2xl border p-3 transition-all duration-300 hover:scale-[1.02]",
                        isDark
                          ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
                      ].join(" ")}
                      aria-label="Abrir notificações"
                    >
                      <Bell className="h-5 w-5" />

                      {quantidadeNaoLidas > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-lg">
                          {quantidadeNaoLidas > 99 ? "99+" : quantidadeNaoLidas}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div
                        className={[
                          "absolute right-0 z-30 mt-3 w-[360px] overflow-hidden rounded-3xl border backdrop-blur-2xl shadow-2xl",
                          isDark
                            ? "border-white/10 bg-[#121212]"
                            : "border-zinc-200 bg-white",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex items-center justify-between border-b px-4 py-4",
                            isDark ? "border-white/10" : "border-zinc-100",
                          ].join(" ")}
                        >
                          <div>
                            <p className="text-sm font-extrabold">Notificações</p>
                            <p
                              className={[
                                "text-xs",
                                isDark ? "text-white/45" : "text-zinc-500",
                              ].join(" ")}
                            >
                              Novos pedidos em tempo real
                            </p>
                          </div>

                          {notificacoes.length > 0 && (
                            <button
                              type="button"
                              onClick={limparNotificacoes}
                              className="text-xs font-bold text-red-500 transition hover:opacity-80"
                            >
                              Limpar
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {notificacoes.length === 0 ? (
                            <div
                              className={[
                                "px-4 py-8 text-center text-sm",
                                isDark ? "text-white/45" : "text-zinc-500",
                              ].join(" ")}
                            >
                              Nenhuma notificação por enquanto.
                            </div>
                          ) : (
                            notificacoes.slice(0, 10).map((n, index) => (
                              <button
                                key={`${n.pedidoId}-${index}`}
                                type="button"
                                onClick={irParaPedidos}
                                className={[
                                  "flex w-full items-start gap-3 border-b px-4 py-4 text-left transition-all duration-300",
                                  isDark
                                    ? "border-white/10 hover:bg-white/5"
                                    : "border-zinc-100 hover:bg-zinc-50",
                                  !n.lida
                                    ? isDark
                                      ? "bg-red-500/5"
                                      : "bg-red-50/70"
                                    : "",
                                ].join(" ")}
                              >
                                <div
                                  className={[
                                    "mt-0.5 rounded-2xl p-2",
                                    isDark
                                      ? "bg-red-500/10 text-red-300"
                                      : "bg-red-100 text-red-600",
                                  ].join(" ")}
                                >
                                  <ShoppingBag className="h-4 w-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold">
                                    Novo pedido #{n.pedidoId}
                                  </p>
                                  <p
                                    className={[
                                      "mt-1 text-sm",
                                      isDark ? "text-white/60" : "text-zinc-600",
                                    ].join(" ")}
                                  >
                                    {n.nomeCliente || "Cliente"}
                                  </p>
                                  <p
                                    className={[
                                      "mt-1 text-xs",
                                      isDark ? "text-white/40" : "text-zinc-500",
                                    ].join(" ")}
                                  >
                                    Total: {formatCurrency(n.total)}
                                  </p>
                                </div>

                                <ChevronRight
                                  className={[
                                    "mt-1 h-4 w-4 shrink-0",
                                    isDark ? "text-white/25" : "text-zinc-300",
                                  ].join(" ")}
                                />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => changeSection("pedidos")}
                    className={[
                      "rounded-2xl px-4 py-3 text-sm font-extrabold transition-all duration-300 hover:scale-[1.02]",
                      section === "pedidos"
                        ? "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_14px_35px_rgba(229,37,42,0.25)]"
                        : isDark
                        ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                        : "border border-red-200 bg-white text-red-700 hover:bg-red-50",
                    ].join(" ")}
                  >
                    Ir para pedidos
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={[
              "overflow-hidden rounded-[28px] border transition-colors duration-300",
              isDark
                ? "border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
                : "border-zinc-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]",
            ].join(" ")}
          >
            <div
              className={[
                "border-b px-5 py-4 sm:px-6",
                isDark ? "border-white/10" : "border-zinc-100",
              ].join(" ")}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">
                    Painel de gerenciamento
                  </h2>
                  <p
                    className={[
                      "mt-1 text-sm",
                      isDark ? "text-white/45" : "text-zinc-500",
                    ].join(" ")}
                  >
                    Área principal para administrar {sectionDescription}.
                  </p>
                </div>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold",
                    isDark
                      ? "border-white/10 bg-white/5 text-white/70"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600",
                  ].join(" ")}
                >
                  {new Date().toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6">{renderSection}</div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default Dashboard;