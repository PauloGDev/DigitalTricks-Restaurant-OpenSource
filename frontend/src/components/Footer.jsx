import React from "react";
import { assets } from "../assets/assets";
import { Link, useLocation } from "react-router-dom";
import { RiInstagramLine, RiWhatsappLine } from "react-icons/ri";
import { FaPix, FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDinersClub } from "react-icons/fa6";

const Footer = () => {
  const location = useLocation();

  // Em páginas internas (ex: página do restaurante) você pode querer um footer menor.
  const isRestaurantPage =
    location.pathname.startsWith("/r/") || location.pathname.startsWith("/restaurante/");

  return (
    <footer className="w-full z-10 bg-zinc-950 text-white/80 relative border-t border-white/10">
      {/* Área principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Coluna 1 - Navegação (B2B) */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <h3 className="text-base font-extrabold text-white">Plataforma</h3>

          <a href="/#recursos" className="hover:text-red-300 transition">
            Recursos
          </a>
          <a href="/#como-funciona" className="hover:text-red-300 transition">
            Como funciona
          </a>
          <a href="/#planos" className="hover:text-red-300 transition">
            Planos
          </a>
          <a href="/#duvidas" className="hover:text-red-300 transition">
            Dúvidas
          </a>

          <Link to="/login" className="hover:text-red-300 transition">
            Acessar painel
          </Link>
          <Link to="/cadastro" className="hover:text-red-300 transition">
            Quero ser parceiro
          </Link>

          <Link to="/direitos" className="hover:text-red-300 transition">
            Privacidade e Termos
          </Link>
        </div>

        {/* Coluna 2 - Marca */}
        <div className="flex flex-col items-center text-center space-y-4">
          {assets?.logo_branca ? (
            <img
              src={assets.logo_branca}
              alt="Plataforma para Restaurantes"
              className="w-36 sm:w-44"
            />
          ) : (
            <div className="h-12 w-12 rounded-2xl bg-red-600 grid place-items-center text-white text-xl font-extrabold">
              🍕
            </div>
          )}

          <p className="max-w-sm text-white/60 text-sm leading-relaxed">
            Uma plataforma para restaurantes parceiros criarem{" "}
            <strong className="text-white/85">página própria</strong> e{" "}
            <strong className="text-white/85">cardápio online</strong>, com
            recebimento de pedidos de forma simples.
          </p>

          {/* Mini “exemplo de URL” (some em páginas do restaurante se quiser) */}
          {!isRestaurantPage && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/75">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
              sua-plataforma.com/
              <span className="text-red-300 font-semibold">pizzaria-da-maria</span>
            </div>
          )}
        </div>

        {/* Coluna 3 - Contato / Social */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <h3 className="text-base font-extrabold text-white">Fale com a gente</h3>

          <div className="flex items-center gap-3 text-sm text-white/70">
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
              ⚡ Suporte para parceiros
            </span>
          </div>

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

      {/* Linha divisória */}
      <div className="border-t border-white/10" />

      {/* Pagamentos (opcional na landing B2B — mantenho se você quiser mostrar que suporta Pix/cartão) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex flex-col items-center space-y-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-white">
          Pagamentos suportados (para pedidos)
        </h3>
        <div className="flex flex-wrap justify-center gap-5 text-white/55 text-3xl">
          <FaCcVisa className="hover:text-red-300 transition" />
          <FaCcMastercard className="hover:text-red-300 transition" />
          <FaCcAmex className="hover:text-red-300 transition" />
          <FaCcDinersClub className="hover:text-red-300 transition" />
          <FaPix className="hover:text-red-300 transition" />
        </div>
      </div>

      {/* Créditos + Direitos */}
      <div className="border-t border-white/10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/50 gap-3">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()} Plataforma para Restaurantes — Todos os direitos reservados.
          <br />
          <span className="text-white/40">
            (Substitua aqui: nome da empresa • CNPJ • cidade/UF)
          </span>
        </p>

        <a
          href="https://digitaltricks.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-white/80 transition"
        >
          <span>Desenvolvido por</span>
          <img
            src={assets.digitalTricksLogo}
            alt="Digital Tricks"
            className="w-8 opacity-90"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;