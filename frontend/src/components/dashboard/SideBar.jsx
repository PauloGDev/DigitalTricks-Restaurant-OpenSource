import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  LayoutDashboard,
  Store,
  Home,
  LogOut,
  TicketPercent,
  ChevronRight,
  UserCog,
  Moon,
  Sun,
  X,
  BarChart3,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

function NavItemButton({ active, onClick, icon: Icon, label, hint, isDark }) {
  return (
    <button
      onClick={onClick}
      className={[
        "group w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        "flex items-center gap-3",
        active
          ? isDark
            ? "border-[#E5252A]/30 bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_16px_35px_rgba(229,37,42,0.25)]"
            : "border-red-200 bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white shadow-[0_16px_35px_rgba(229,37,42,0.22)]"
          : isDark
          ? "border-white/10 bg-white/5 text-white/85 hover:border-white/15 hover:bg-white/[0.075]"
          : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition-all duration-300",
          active
            ? "border-white/15 bg-white/10"
            : isDark
            ? "border-white/10 bg-white/5 group-hover:bg-white/10"
            : "border-zinc-200 bg-zinc-50 group-hover:bg-white",
        ].join(" ")}
      >
        <Icon
          className={[
            "h-5 w-5 transition",
            active ? "text-white" : isDark ? "text-[#ff6b6f]" : "text-[#E5252A]",
          ].join(" ")}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">{label}</span>
        {hint ? (
          <span
            className={[
              "mt-0.5 block truncate text-xs",
              active ? "text-white/80" : isDark ? "text-white/45" : "text-zinc-500",
            ].join(" ")}
          >
            {hint}
          </span>
        ) : null}
      </span>

      <ChevronRight
        className={[
          "h-4 w-4 shrink-0 transition-all duration-300",
          active
            ? "translate-x-0 text-white/85"
            : isDark
            ? "text-white/20 group-hover:text-white/35"
            : "text-zinc-300 group-hover:text-zinc-400",
        ].join(" ")}
      />
    </button>
  );
}

function NavItemLink({ to, icon: Icon, label, hint, isDark }) {
  return (
    <Link
      to={to}
      className={[
        "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        isDark
          ? "border-white/10 bg-white/5 text-white/85 hover:border-white/15 hover:bg-white/[0.075]"
          : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition",
          isDark
            ? "border-white/10 bg-white/5 group-hover:bg-white/10"
            : "border-zinc-200 bg-zinc-50 group-hover:bg-white",
        ].join(" ")}
      >
        <Icon className={`h-5 w-5 ${isDark ? "text-[#ff6b6f]" : "text-[#E5252A]"}`} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold">{label}</span>
        {hint ? (
          <span
            className={`mt-0.5 block truncate text-xs ${
              isDark ? "text-white/45" : "text-zinc-500"
            }`}
          >
            {hint}
          </span>
        ) : null}
      </span>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition ${
          isDark
            ? "text-white/20 group-hover:text-white/35"
            : "text-zinc-300 group-hover:text-zinc-400"
        }`}
      />
    </Link>
  );
}

function SectionTitle({ children, isDark }) {
  return (
    <p
      className={`px-2 text-[11px] font-extrabold uppercase tracking-[0.14em] ${
        isDark ? "text-white/35" : "text-zinc-400"
      }`}
    >
      {children}
    </p>
  );
}

const Sidebar = ({ section, changeSection, sidebarOpen, setSidebarOpen }) => {
  const [role, setRole] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("navbar-theme-override") || "dark";
  });

  const location = useLocation();
  const navigate = useNavigate();

  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => {
      setTheme(localStorage.getItem("navbar-theme-override") || "dark");
    };

    window.addEventListener("storage", syncTheme);
    syncTheme();

    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setRole(null);
      return;
    }

    const decoded = parseJwt(token);
    const userRoles = decoded?.roles || [];

    if (Array.isArray(userRoles) && userRoles.includes("ROLE_ADMIN")) {
      setRole("ADMIN");
    } else {
      setRole("USER");
    }
  }, [location.pathname]);

  const closeMobile = () => setSidebarOpen?.(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("empresaId");
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("username");
    setRole(null);
    window.location.href = "/dashboard/login";
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    localStorage.setItem("navbar-theme-override", next);
    setTheme(next);
    window.dispatchEvent(new Event("storage"));
  };

  const themeLabel = isDark ? "Modo Escuro" : "Modo Claro";

  const statusInfo = useMemo(() => {
    if (section === "pedidos") {
      return {
        label: "Monitorando pedidos",
        tone: isDark
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    }

    if (section === "produtos") {
      return {
        label: "Gerenciando cardápio",
        tone: isDark
          ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
          : "border-blue-200 bg-blue-50 text-blue-700",
      };
    }

    if (section === "cupons") {
      return {
        label: "Gerenciando cupons",
        tone: isDark
          ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
          : "border-amber-200 bg-amber-50 text-amber-700",
      };
    }

    if (section === "usuarios") {
      return {
        label: "Gerenciando equipe",
        tone: isDark
          ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
          : "border-violet-200 bg-violet-50 text-violet-700",
      };
    }

    if (section === "clientes") {
      return {
        label: "Gerenciando clientes",
        tone: isDark
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
          : "border-cyan-200 bg-cyan-50 text-cyan-700",
      };
    }

    if (section === "analytics") {
      return {
        label: "Analisando desempenho",
        tone: isDark
          ? "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300"
          : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      };
    }

    return {
      label: "Painel ativo",
      tone: isDark
        ? "border-white/10 bg-white/5 text-white/75"
        : "border-zinc-200 bg-zinc-50 text-zinc-700",
    };
  }, [section, isDark]);

  return (
    <>
      <div
        className={[
          "fixed inset-0 z-30 transition-opacity md:hidden",
          isDark ? "bg-black/60 backdrop-blur-[4px]" : "bg-black/40 backdrop-blur-[2px]",
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={closeMobile}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-[310px] transform border-r backdrop-blur-xl md:static md:z-0 md:w-72 md:translate-x-0",
          "transition-transform duration-300",
          isDark
            ? "border-white/10 bg-[#121212]/95 shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
            : "border-zinc-200 bg-white/95 shadow-xl md:shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div
            className={`px-6 pb-5 pt-6 border-b ${
              isDark ? "border-white/10" : "border-zinc-100"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={[
                    "grid h-12 w-12 place-items-center rounded-3xl text-white",
                    "bg-gradient-to-br from-[#E5252A] to-[#ff4b4f]",
                    "shadow-[0_14px_30px_rgba(229,37,42,0.28)]",
                  ].join(" ")}
                >
                  <LayoutDashboard className="h-6 w-6" />
                </span>

                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-extrabold ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}
                  >
                    Painel do Restaurante
                  </p>
                  <p
                    className={`truncate text-xs ${
                      isDark ? "text-white/45" : "text-zinc-500"
                    }`}
                  >
                    {role === "ADMIN"
                      ? "Administrador"
                      : role === "USER"
                      ? "Operador"
                      : "Visitante"}
                  </p>
                </div>
              </div>

              <button
                onClick={closeMobile}
                className={[
                  "md:hidden grid h-10 w-10 place-items-center rounded-2xl border transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800",
                ].join(" ")}
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <span
                className={[
                  "inline-flex min-w-0 items-center rounded-full border px-3 py-1.5 text-xs font-extrabold",
                  statusInfo.tone,
                ].join(" ")}
              >
                <span className="truncate">{statusInfo.label}</span>
              </span>

              <span
                className={`shrink-0 text-[11px] font-semibold ${
                  isDark ? "text-white/35" : "text-zinc-500"
                }`}
              >
                {new Date().toLocaleDateString("pt-BR")}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className={[
                "mt-4 w-full flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300",
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-zinc-50 text-[#1A1A1A] hover:bg-zinc-100",
              ].join(" ")}
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {themeLabel}
              </span>

              <span
                className={`text-[10px] font-extrabold uppercase tracking-[0.14em] ${
                  isDark ? "text-white/40" : "text-zinc-400"
                }`}
              >
              
              </span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-5">
              <div className="space-y-3">
                <SectionTitle isDark={isDark}>Gestão</SectionTitle>

                <div className="space-y-2">
                  <NavItemButton
                    active={section === "produtos"}
                    onClick={() => {
                      changeSection("produtos");
                      closeMobile();
                    }}
                    icon={Package}
                    label="Produtos / Cardápio"
                    hint="Itens, preços e disponibilidade"
                    isDark={isDark}
                  />

                  <NavItemButton
                    active={section === "usuarios"}
                    onClick={() => {
                      changeSection("usuarios");
                      closeMobile();
                    }}
                    icon={UserCog}
                    label="Equipe"
                    hint="Donos, gerentes e atendentes"
                    isDark={isDark}
                  />

                  <NavItemButton
                    active={section === "clientes"}
                    onClick={() => {
                      changeSection("clientes");
                      closeMobile();
                    }}
                    icon={Users}
                    label="Clientes"
                    hint="Quem já comprou no restaurante"
                    isDark={isDark}
                  />

                  <NavItemButton
                    active={section === "pedidos"}
                    onClick={() => {
                      changeSection("pedidos");
                      closeMobile();
                    }}
                    icon={ShoppingCart}
                    label="Pedidos"
                    hint="Acompanhe pedidos em tempo real"
                    isDark={isDark}
                  />

                  <NavItemButton
                    active={section === "cupons"}
                    onClick={() => {
                      changeSection("cupons");
                      closeMobile();
                    }}
                    icon={TicketPercent}
                    label="Cupons"
                    hint="Descontos, regras e vigência"
                    isDark={isDark}
                  />

                  <NavItemButton
                    active={section === "analytics"}
                    onClick={() => {
                      changeSection("analytics");
                      closeMobile();
                    }}
                    icon={BarChart3}
                    label="Analytics"
                    hint="Métricas e desempenho"
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className={`h-px ${isDark ? "bg-white/10" : "bg-zinc-100"}`} />

              <div className="space-y-3">
                <SectionTitle isDark={isDark}>Navegação</SectionTitle>

                <div className="space-y-2">
                  <NavItemLink
                    to="/"
                    icon={Home}
                    label="Home"
                    hint="Página inicial"
                    isDark={isDark}
                  />

                  <NavItemLink
                    to="/produtos"
                    icon={Store}
                    label="Visitar Loja"
                    hint="Visualizar o catálogo público"
                    isDark={isDark}
                  />
                </div>
              </div>

              <div className={`h-px ${isDark ? "bg-white/10" : "bg-zinc-100"}`} />

              <div className="space-y-3">
                <SectionTitle isDark={isDark}>Conta</SectionTitle>

                {role ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobile();
                    }}
                    className={[
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition-all duration-300",
                      isDark
                        ? "border-[#E5252A]/20 bg-[#E5252A]/10 text-red-200 hover:bg-[#E5252A]/15"
                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border",
                        isDark
                          ? "border-[#E5252A]/20 bg-white/5"
                          : "border-red-200 bg-white",
                      ].join(" ")}
                    >
                      <LogOut className={`h-5 w-5 ${isDark ? "text-red-300" : "text-red-600"}`} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate">Sair</span>
                      <span
                        className={`block truncate text-xs font-semibold ${
                          isDark ? "text-red-300/70" : "text-red-500"
                        }`}
                      >
                        Encerrar sessão atual
                      </span>
                    </span>
                  </button>
                ) : (
                  <Link
                    to="/dashboard/login"
                    onClick={closeMobile}
                    className="block rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 py-3 text-center font-extrabold text-white transition-all duration-300 hover:shadow-[0_14px_30px_rgba(229,37,42,0.25)]"
                  >
                    Fazer Login
                  </Link>
                )}
              </div>
            </nav>
          </div>

          <div className={`px-4 py-4 border-t ${isDark ? "border-white/10" : "border-zinc-100"}`}>
            <div
              className={[
                "rounded-2xl border px-4 py-3",
                isDark
                  ? "border-white/10 bg-white/5"
                  : "border-zinc-200 bg-zinc-50",
              ].join(" ")}
            >
              <p className={`text-xs font-bold ${isDark ? "text-white/85" : "text-zinc-700"}`}>
                Dica rápida
              </p>
              <p
                className={`mt-1 text-[11px] leading-relaxed ${
                  isDark ? "text-white/45" : "text-zinc-500"
                }`}
              >
                Use{" "}
                <span className={`font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Pedidos
                </span>{" "}
                para acompanhar cozinha e entregas,{" "}
                <span className={`font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Equipe
                </span>{" "}
                para acessos internos e{" "}
                <span className={`font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Clientes
                </span>{" "}
                para relacionamento.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;