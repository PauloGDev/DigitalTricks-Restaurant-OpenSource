import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";
import {
  User,
  LogOut,
  X,
  Sun,
  Moon,
  ShoppingCart,
  LayoutDashboard,
  UserCircle,
  PackageSearch,
  UtensilsCrossed,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCarrinho } from "../context/CarrinhoContext";

const PERFIL = {
  GUEST: "GUEST",
  CLIENTE: "CLIENTE",
  ADMIN: "ADMIN",
};

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("navbar-theme-override") || "dark";
  });

  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { carrinho, restauranteSlug } = useCarrinho();

  /* ── Scroll ── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Theme ── */
  useEffect(() => {
    localStorage.setItem("navbar-theme-override", theme);
  }, [theme]);

  /* ── Close menus on outside click ── */
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [menuOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [dropdownOpen]);

  /* ── Cart count ── */
  const cartCount = useMemo(() => {
    const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];
    return itens.reduce((a, i) => a + (Number(i?.quantidade) || 0), 0);
  }, [carrinho?.itens]);

  const isRestaurante =
    !!matchPath("/restaurante/:slug/*", location.pathname) ||
    !!matchPath("/restaurante/:slug", location.pathname);

  /* ── Perfil ── */
  const perfil = useMemo(() => {
    if (!user) return PERFIL.GUEST;
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (
      roles.some((r) =>
        ["ROLE_ADMIN", "ROLE_GERENTE", "ROLE_FUNCIONARIO", "ROLE_SUPER_ADMIN"].includes(r)
      )
    )
      return PERFIL.ADMIN;
    return PERFIL.CLIENTE;
  }, [user]);

  /* ── Links por perfil ── */
  const links = useMemo(() => {
    if (perfil === PERFIL.CLIENTE) {
      return [
        { label: "Cardápios", path: "/", external: false },
        { label: "Meus pedidos", path: "/meus-pedidos", external: false },
        { label: "Suporte", path: "https://wa.me/5585984642900", external: true },
      ];
    }

    if (perfil === PERFIL.ADMIN) {
      return [
        { label: "Dashboard", path: "/dashboard", external: false, icon: LayoutDashboard },
        { label: "Pedidos", path: "/dashboard", external: false, icon: PackageSearch },
        { label: "TV", path: "/dashboard/tv", external: false, icon: BarChart3 },
        { label: "Suporte", path: "https://wa.me/5585984642900", external: true },
      ];
    }

    return [
      { label: "Como funciona", path: "/#como-funciona" },
      { label: "Recursos", path: "/#recursos" },
      { label: "Planos", path: "/#planos" },
      { label: "Suporte", path: "https://wa.me/5585984642900", external: true },
    ];
  }, [perfil]);

  /* ── Actions ── */
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout?.();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  /* ── Helpers ── */
  const username = user?.username || user?.id || "";

  /* ── Classnames ── */
  const headerClass = [
    "fixed top-0 left-0 w-full z-50 transition-all duration-300",
    isDark
      ? scrolled
        ? "bg-[#1A1A1A] backdrop-blur-xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
        : "bg-[#1A1A1A]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
      : scrolled
      ? "bg-white/95 backdrop-blur-xl border-b border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      : "bg-white backdrop-blur-xl border-b border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]",
  ].join(" ");

  const avatarBase =
    "flex items-center justify-center w-11 h-11 rounded-2xl text-white bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300";

  const dropdownClass = [
    "absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] text-sm z-50 border",
    isDark ? "border-white/10 bg-[#1A1A1A]" : "border-zinc-200 bg-white/95",
  ].join(" ");

  const themeButtonClass = [
    "flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
      : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
  ].join(" ");

  const desktopNavClass = [
    "hidden md:flex items-center gap-8 text-sm font-medium transition-colors",
    isDark ? "text-white/75" : "text-zinc-700",
  ].join(" ");

  const desktopLinkClass = [
    "relative transition-all duration-300 hover:scale-[1.02]",
    isDark ? "hover:text-white" : "hover:text-[#1A1A1A]",
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-[#E5252A] after:transition-all after:duration-300 hover:after:w-full",
  ].join(" ");

  const mobileBarsColor = isDark ? "bg-white" : "bg-[#1A1A1A]";

  const cartButtonClass = [
    "relative md:hidden flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
      : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
  ].join(" ");

  /* ── Render ── */
  return (
    <header className={headerClass}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="min-h-[72px] flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={isDark ? "/logo1.svg" : "/logo2.svg"}
              className="h-9 w-auto object-contain transition-all duration-300"
              alt="Logo"
            />
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className={`text-[15px] font-bold tracking-tight transition-colors ${
                  isDark ? "text-white" : "text-[#1A1A1A]"
                }`}
              >
                Geste
              </span>
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isDark ? "text-white/55" : "text-zinc-500"
                }`}
              >
                Plataforma para negcios
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className={desktopNavClass}>
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.path}
                  className={`${desktopLinkClass} flex items-center gap-1.5`}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                >
                  {Icon && <Icon size={14} />}
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button onClick={toggleTheme} className={themeButtonClass} aria-label="Trocar tema">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Cart — only cliente */}
            {perfil === PERFIL.CLIENTE && (
              <button
                onClick={() => {
                  if (restauranteSlug) navigate(`/restaurante/${restauranteSlug}/carrinho`);
                }}
                className={cartButtonClass}
                aria-label="Carrinho"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-black text-xs font-extrabold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* ── GUEST ── */}
            {perfil === PERFIL.GUEST && (
              <>
                <Link
                  to="/register"
                  className={[
                    "hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300",
                    isDark
                      ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10 hover:text-white"
                      : "border-zinc-200 bg-white text-[#1A1A1A] hover:border-zinc-300 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  Quero ser parceiro
                </Link>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                >
                  Entrar
                </Link>
              </>
            )}

            {/* ── LOGGED (Cliente or Admin) ── */}
            {perfil !== PERFIL.GUEST && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className={avatarBase}
                  aria-label="Menu do usurio"
                >
                  <User size={19} />
                </button>

                {dropdownOpen && (
                  <div className={dropdownClass}>
                    {/* Header */}
                    <div
                      className={`px-5 py-4 border-b ${isDark ? "border-white/10" : "border-zinc-200"}`}
                    >
                      <p className={`font-semibold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>
                        {perfil === PERFIL.ADMIN ? "Painel Admin" : "Minha conta"}
                      </p>
                      <p className={`text-xs mt-1 truncate ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                        {username}
                      </p>
                    </div>

                    {/* Links por perfil */}
                    <div className="py-2">
                      {perfil === PERFIL.CLIENTE && (
                        <>
                          <Link
                            to="/perfil"
                            className={`flex items-center gap-2 px-5 py-3 transition ${
                              isDark
                                ? "text-white/85 hover:bg-white/5 hover:text-white"
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <UserCircle size={16} /> Meu perfil
                          </Link>
                          <Link
                            to="/meus-pedidos"
                            className={`flex items-center gap-2 px-5 py-3 transition ${
                              isDark
                                ? "text-white/85 hover:bg-white/5 hover:text-white"
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <PackageSearch size={16} /> Meus pedidos
                          </Link>
                        </>
                      )}

                      {perfil === PERFIL.ADMIN && (
                        <>
                          <Link
                            to="/dashboard"
                            className={`flex items-center gap-2 px-5 py-3 transition ${
                              isDark
                                ? "text-white/85 hover:bg-white/5 hover:text-white"
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <LayoutDashboard size={16} /> Dashboard
                          </Link>
                          <Link
                            to="/dashboard/tv"
                            className={`flex items-center gap-2 px-5 py-3 transition ${
                              isDark
                                ? "text-white/85 hover:bg-white/5 hover:text-white"
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <BarChart3 size={16} /> Modo TV
                          </Link>
                          <Link
                            to="/perfil"
                            className={`flex items-center gap-2 px-5 py-3 transition ${
                              isDark
                                ? "text-white/85 hover:bg-white/5 hover:text-white"
                                : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                            }`}
                            onClick={() => setDropdownOpen(false)}
                          >
                            <Settings size={16} /> Configuraes
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Footer: logout */}
                    <div
                      className={`border-t p-2 ${isDark ? "border-white/10" : "border-zinc-200"}`}
                    >
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 rounded-2xl px-4 py-3 transition ${
                          isDark
                            ? "text-red-300 hover:bg-white/5"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <LogOut size={16} /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              className={[
                "md:hidden flex flex-col justify-center items-center w-11 h-11 rounded-2xl border transition-all duration-300",
                isDark
                  ? "bg-white/5 border-white/10 hover:bg-white/10"
                  : "bg-white border-zinc-200 hover:bg-zinc-50",
              ].join(" ")}
              aria-label="Abrir menu"
            >
              <span className={`block h-0.5 w-5 ${mobileBarsColor} mb-1`} />
              <span className={`block h-0.5 w-5 ${mobileBarsColor} mb-1`} />
              <span className={`block h-0.5 w-5 ${mobileBarsColor}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          <div
            ref={sidebarRef}
            className={[
              "absolute top-0 right-0 h-full w-[320px] max-w-[90vw] p-6 flex flex-col border-l shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
              isDark
                ? "bg-[#1A1A1A] border-white/10 text-white"
                : "bg-white border-zinc-200 text-[#1A1A1A]",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link to="/" onClick={() => setMenuOpen(false)}>
                <img
                  src={isDark ? "/logo1.svg" : "/logo2.svg"}
                  className="h-9 w-auto object-contain"
                  alt="Logo"
                />
              </Link>
              <button
                className={[
                  "w-10 h-10 rounded-2xl border flex items-center justify-center transition",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10"
                    : "border-zinc-200 bg-white text-zinc-600 hover:text-[#1A1A1A] hover:bg-zinc-50",
                ].join(" ")}
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`h-px my-6 ${isDark ? "bg-white/10" : "bg-zinc-200"}`} />

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className={[
                "mb-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold border transition-all",
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-zinc-50 text-[#1A1A1A] hover:bg-zinc-100",
              ].join(" ")}
            >
              <span>{isDark ? "Modo Escuro" : "Modo Claro"}</span>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* ── Links por perfil ── */}
            {perfil === PERFIL.CLIENTE && (
              <div className={`mb-2 px-4 text-xs font-semibold uppercase tracking-widest ${isDark ? "text-white/40" : "text-zinc-400"}`}>
                rea do cliente
              </div>
            )}
            {perfil === PERFIL.ADMIN && (
              <div className={`mb-2 px-4 text-xs font-semibold uppercase tracking-widest ${isDark ? "text-white/40" : "text-zinc-400"}`}>
                Painel admin
              </div>
            )}

            {/* Cart button mobile — cliente */}
            {perfil === PERFIL.CLIENTE && cartCount > 0 && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  if (restauranteSlug) navigate(`/restaurante/${restauranteSlug}/carrinho`);
                  else navigate("/");
                }}
                className="mb-2 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart size={18} /> Carrinho
                </span>
                <span className="bg-amber-400 text-black text-xs font-extrabold px-2 py-0.5 rounded-full">
                  {cartCount} {cartCount === 1 ? "item" : "itens"}
                </span>
              </button>
            )}

            <div className="flex flex-col gap-2 text-sm font-semibold">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "px-4 py-3 rounded-2xl transition",
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/5"
                      : "text-zinc-700 hover:text-[#1A1A1A] hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA area */}
            <div className="mt-auto pt-6 flex flex-col gap-3">
              {perfil === PERFIL.GUEST ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-4 py-3 rounded-2xl text-center font-semibold text-white bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "w-full px-4 py-3 rounded-2xl text-center font-semibold border transition-all",
                      isDark
                        ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10 hover:text-white"
                        : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    Quero ser parceiro
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={perfil === PERFIL.ADMIN ? "/dashboard" : "/perfil"}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "w-full px-4 py-3 rounded-2xl text-center font-semibold border transition-all",
                      isDark
                        ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                        : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {perfil === PERFIL.ADMIN ? "Ir para o painel" : "Meu perfil"}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className={[
                      "w-full px-4 py-3 rounded-2xl text-center font-semibold border transition-all",
                      isDark
                        ? "text-red-200 border-red-500/20 bg-red-500/10 hover:bg-red-500/15"
                        : "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
                    ].join(" ")}
                  >
                    Sair
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
