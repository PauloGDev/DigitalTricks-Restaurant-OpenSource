import React from "react";
import { assets } from "../assets/assets";

const SobreCard = () => {
  return (
    <section className="relative w-full py-20 px-6 place-items-center items-center justify-center">
      {/* Container principal */}
      <div className="relative max-w-4xl w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 flex flex-col items-center text-center space-y-8">
        
        {/* Logo */}
        <div className="w-28 sm:w-36 md:w-48">
          <img
            src={assets.logo_branca}
            alt="Logo Sublime"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Texto */}
        <p className="text-gray-200 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl">
          A <span className="text-amber-400 font-semibold">Sublime Perfumes</span> nasceu para levar a sofisticação das fragrâncias
          importadas até você. Mais do que perfumes, entregamos experiências que
          traduzem estilo, memória e presença marcante em cada detalhe.
        </p>

        {/* Selo de confiança */}
        <div className="flex items-center gap-3 bg-amber-400/20 border border-amber-400/40 px-6 py-3 rounded-full shadow-lg">
          <span className="text-amber-400 font-semibold text-sm md:text-base">
            Garantia de Autenticidade
          </span>
        </div>
      </div>
    </section>
  );
};

export default SobreCard;
