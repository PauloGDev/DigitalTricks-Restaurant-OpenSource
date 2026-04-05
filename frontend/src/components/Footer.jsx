import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { RiInstagramLine, RiWhatsappLine } from "react-icons/ri";
import { FaPix, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDinersClub } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useCarrinho } from "../context/CarrinhoContext";

const PERFIL = { GUEST: "GUEST", CLIENTE: "CLIENTE", ADMIN: "ADMIN" };

const Footer = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { carrinho, restauranteSlug } = useCarrinho();

  const perfil = useMemo(() => {
    if (!user) return PERFIL.GUEST;
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    if (roles.some((r) => ["ROLE_ADMIN", "ROLE_GERENTE", "ROLE_FUNCIONARIO", "ROLE_SUPER_ADMIN"].includes(r)))
      return PERFIL.ADMIN;
    return PERFIL.CLIENTE;
  }, [user]);

  const isRestaurante =
    location.pathname.startsWith("/restaurante/");
  const isCardapio =
    !!location.pathname.match(/^\/restaurante\/[^/]+$/);

  const cartTotal = useMemo(() => {
    const itens = Array.isArray(carrinho?.itens) ? carrinho.itens : [];
    return itens.reduce((a, i) => a + (Number(i?.quantidade) || 0), 0);
  }, [carrinho?.itens]);

  /* Links por perfil */
  const colNav = useMemo(() => {
    if (perfil === PERFIL.CLIENTE) {
      return {
        titulo: "Minha conta",
        links: [
          { label: "Card\u00e1pios", path: "/" },
          { label: "Meus pedidos", path: "/meus-pedidos" },
          { label: "Meu perfil", path: "/perfil" },
          { label: "Suporte", path: "https://wa.me/5585984642900", external: true },
        ],
      };
    }
    if (perfil === PERFIL.ADMIN) {
      return {
        titulo: "Painel administrativo",
        links: [
          { label: "Dashboard", path: "/dashboard" },
          { label: "Modo TV", path: "/dashboard/tv" },
          { label: "Perfil", path: "/perfil" },
          { label: "Suporte", path: "https://wa.me/5585984642900", external: true },
        ],
      };
    }
    return {
      titulo: "Plataforma",
      links: [
        { label: "Recursos", path: "/#recursos" },
        { label: "Como funciona", path: "/#como-funciona" },
        { label: "Planos", path: "/#planos" },
        { label: "D\u00favidas", path: "/#duvidas" },
        { label: "Acessar painel", path: "/login" },
        { label: "Quero ser parceiro", path: "/register" },
        { label: "Privacidade e Termos", path: "/direitos" },
      ],
    };
  }, [perfil]);

  return (
    <footer className="w-full z-10 bg-zinc-950 text-white/80 relative border-t border-white/10">
      {/* CTA carrinho — apenas em p\u00e1ginas de restaurante */}
      {isRestaurante && cartTotal > 0 && (
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
            <p className="text-sm text-white/60">
              {cartTotal} {cartTotal === 1 ? "item" : "itens"} no carrinho
            </p>
            <Link
              to={restauranteSlug ? `/restaurante/${restauranteSlug}/carrinho` : "/"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition shadow-[0_10px_30px_rgba(229,37,42,0.25)]"
            >
              Ver carrinho
            </Link>
          </div>
        </div>
      )}

      {/* \u00c1rea principal */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-12`}>
        {/* Coluna 1 — Navega\u00e7\u00e3o por perfil */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <h3 className="text-base font-extrabold text-white">{colNav.titulo}</h3>
          {colNav.links.map((link) => (
            link.external ? (
              <a
                key={link.label}
                href={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-300 transition"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.path} className="hover:text-red-300 transition">
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* Coluna 2 — Marca */}
        <div className="flex flex-col items-center text-center space-y-4">
          <img
            src="/logo1.svg"
            alt="Plataforma para Restaurantes"
            className="w-36 sm:w-44"
          />

          {perfil === PERFIL.GUEST && (
            <>
              <p className="max-w-sm text-white/60 text-sm leading-relaxed">
                Uma plataforma para restaurantes parceiros criarem{" "}
                <strong className="text-white/85">p\u00e1gina pr\u00f3pria</strong> e{" "}
                <strong className="text-white/85">card\u00e1pio online</strong>, com
                recebimento de pedidos de forma simples.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/75">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                sua-plataforma.com/
                <span className="text-red-300 font-semibold">pizzaria-da-maria</span>
              </div>
            </>
          )}

          {perfil === PERFIL.CLIENTE && (
            <p className="max-w-sm text-white/60 text-sm leading-relaxed">
              Peça comida dos melhores restaurantes da sua regi\u00e3o.{" "}
              <strong className="text-white/85">Entrega r\u00e1pida</strong> e{" "}
              <strong className="text-white/85">pagamento seguro</strong>.
            </p>
          )}

          {perfil === PERFIL.ADMIN && (
            <p className="max-w-sm text-white/60 text-sm leading-relaxed">
              Gerencie seus{" "}
              <strong className="text-white/85">pedidos</strong>,{" "}
              <strong className="text-white/85">produtos</strong> e{" "}
              <strong className="text-white/85">equipe</strong> em um só lugar.
            </p>
          )}
        </div>

        {/* Coluna 3 — Contato / Social */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <h3 className="text-base font-extrabold text-white">Fale com a gente</h3>

          <div className="flex gap-5">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-300 transition"
              aria-label="Instagram"
            >
              <RiInstagramLine className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/5585984642900"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-300 transition"
              aria-label="WhatsApp"
            >
              <RiWhatsappLine className="w-6 h-6" />
            </a>
          </div>

          <a
            href="https://wa.me/5585984642900"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500 transition shadow-[0_14px_40px_rgba(239,68,68,0.18)]"
          >
            Chamar no WhatsApp
          </a>
        </div>
      </div>

      {/* Pagamentos */}
      {isRestaurante && (
        <>
          <div className="border-t border-white/10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex flex-col items-center space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              Pagamentos suportados
            </h3>
            <div className="flex flex-wrap justify-center gap-5 text-white/55 text-3xl">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcAmex />
              <FaCcDinersClub />
              <FaPix />
            </div>
          </div>
        </>
      )}

      {/* Créditos */}
      <div className="border-t border-white/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 gap-3">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} Digital Tricks — Todos os direitos reservados.
        </p>
        <a
          href="https://digitaltricks.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-white/80 transition"
        >
          <span>Desenvolvido por</span>
          <span className="font-bold text-white/70">Digital Tricks</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
