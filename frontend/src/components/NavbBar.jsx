import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, X, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("navbar-theme-override") || "dark";
  });

  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("navbar-theme-override", theme);
  }, [theme]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const role = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : [];

    if (
      roles.includes("ROLE_ADMIN") ||
      roles.includes("ROLE_GERENTE") ||
      roles.includes("ROLE_FUNCIONARIO") ||
      roles.includes("ROLE_SUPER_ADMIN")
    ) {
      return "ADMIN";
    }

    if (roles.includes("ROLE_USER")) {
      return "USER";
    }

    return null;
  }, [user]);

  const handleLogout = () => {
    logout?.();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const links = [
    { label: "Como funciona", path: "/#como-funciona" },
    { label: "Recursos", path: "/#recursos" },
    { label: "Planos", path: "/#planos" },
    { label: "Suporte", path: "https://wa.me/5585984642900" },
  ];

  const isDark = theme === "dark";
  const themeLabel = isDark ? "Modo Escuro" : "Modo Claro";

  const Brand = () => (
    <div className="flex items-center gap-3">
      <img
        src={isDark ? "/logo1.svg" : "/logo2.svg"}
        className="h-9 w-auto object-contain transition-all duration-300"
        alt="Geste"
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
          Plataforma para negócios
        </span>
      </div>
    </div>
  );

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

  const themeButtonClass = [
    "flex items-center justify-center w-11 h-11 rounded-2xl border transition-all duration-300",
    isDark
      ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
      : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
  ].join(" ");

  const dropdownClass = [
    "absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] text-sm z-50 border",
    isDark ? "border-white/10 bg-[#1A1A1A]" : "border-zinc-200 bg-white/95",
  ].join(" ");

  return (
    <header className={headerClass}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="min-h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Brand />
          </Link>

          <nav className={desktopNavClass}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.path}
                className={desktopLinkClass}
                target={link.path.startsWith("http") ? "_blank" : "_self"}
                rel={link.path.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={themeButtonClass}
              aria-label={themeLabel}
              title={themeLabel}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {!role && (
              <Link
                to="/cadastro"
                className={[
                  "hidden sm:inline-flex items-center justify-center px-4 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-300",
                  isDark
                    ? "border-white/10 bg-white/5 text-white/85 hover:bg-white/10 hover:text-white"
                    : "border-zinc-200 bg-white text-[#1A1A1A] hover:border-zinc-300 hover:bg-zinc-50",
                ].join(" ")}
              >
                Quero ser parceiro
              </Link>
            )}

            {role ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl text-white bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                  aria-label="Menu do usuário"
                >
                  <User size={19} />
                </button>

                {dropdownOpen && (
                  <div className={dropdownClass}>
                    <div
                      className={`px-5 py-4 border-b ${
                        isDark ? "border-white/10" : "border-zinc-200"
                      }`}
                    >
                      <p
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-[#1A1A1A]"
                        }`}
                      >
                        {role === "ADMIN" ? "Conta Admin" : "Conta Cliente"}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDark ? "text-white/50" : "text-zinc-500"
                        }`}
                      >
                        Acesso à sua conta
                      </p>
                    </div>

                    <div
                      className={`px-5 py-3 border-b ${
                        isDark ? "border-white/10" : "border-zinc-200"
                      }`}
                    >
                      <div
                        className={`text-xs font-semibold uppercase tracking-[0.12em] ${
                          isDark ? "text-white/45" : "text-zinc-400"
                        }`}
                      >
                        Aparência
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={[
                          "mt-3 w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-all",
                          isDark
                            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                            : "border-zinc-200 bg-zinc-50 text-[#1A1A1A] hover:bg-zinc-100",
                        ].join(" ")}
                      >
                        <span className="font-medium">{themeLabel}</span>
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      </button>
                    </div>

                    <div className="py-2">
                      {role === "USER" && (
                        <Link
                          to="/perfil"
                          className={`block px-5 py-3 transition ${
                            isDark
                              ? "text-white/85 hover:bg-white/5 hover:text-white"
                              : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                          }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          Meu perfil
                        </Link>
                      )}

                      {role === "ADMIN" && (
                        <Link
                          to="/dashboard"
                          className={`block px-5 py-3 transition ${
                            isDark
                              ? "text-white/85 hover:bg-white/5 hover:text-white"
                              : "text-zinc-700 hover:bg-zinc-50 hover:text-[#1A1A1A]"
                          }`}
                          onClick={() => setDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                    </div>

                    <div
                      className={`border-t p-2 ${
                        isDark ? "border-white/10" : "border-zinc-200"
                      }`}
                    >
                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-2 rounded-2xl px-4 py-3 transition ${
                          isDark
                            ? "text-red-300 hover:bg-white/5"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <LogOut size={16} />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                >
                  Entrar
                </Link>
              </div>
            )}

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
            <div className="flex items-center justify-between">
              <Brand />

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

            <button
              onClick={toggleTheme}
              className={[
                "mb-4 w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold border transition-all",
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-zinc-50 text-[#1A1A1A] hover:bg-zinc-100",
              ].join(" ")}
            >
              <span>{themeLabel}</span>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex flex-col gap-2 text-sm font-semibold">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  target={link.path.startsWith("http") ? "_blank" : "_self"}
                  rel={link.path.startsWith("http") ? "noreferrer" : undefined}
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

            <div className="mt-auto pt-6 flex flex-col gap-3">
              {!role ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-4 py-3 rounded-2xl text-center font-semibold text-white bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] hover:shadow-[0_14px_35px_rgba(229,37,42,0.35)] transition-all"
                  >
                    Entrar
                  </Link>

                  <Link
                    to="/cadastro"
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
                    to={role === "ADMIN" ? "/dashboard" : "/perfil"}
                    onClick={() => setMenuOpen(false)}
                    className={[
                      "w-full px-4 py-3 rounded-2xl text-center font-semibold border transition-all",
                      isDark
                        ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                        : "border-zinc-200 bg-white text-[#1A1A1A] hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    Ir para minha área
                  </Link>

                  <button
                    onClick={handleLogout}
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

export default Navbar;