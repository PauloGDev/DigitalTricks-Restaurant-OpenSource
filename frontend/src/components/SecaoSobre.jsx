import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const SecaoSobre = () => {
  return (
    <section className="w-full overflow-hidden">
      {/* Seção 2 - Escura com diferenciais */}
<div className="relative bg-gray-950 text-white py-24 px-6">

  <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
    {[
      { 
        title: "Importados de Luxo", 
        desc: "Selecionamos apenas fragrâncias consagradas, reconhecidas pela autenticidade e elegância.", 
      },
      { 
        title: "Exclusividade Sublime", 
        desc: "A possibilidade de fracionar perfumes permite explorar vários aromas sem abrir mão da qualidade.", 
      },
      { 
        title: "Excelência no Atendimento", 
        desc: "Do primeiro contato à entrega, nossa missão é superar expectativas com agilidade e discrição.", 
      },
    ].map((item, i) => (
      <motion.div
        key={i}
        className="space-y-4 p-6 rounded-2xl bg-gray-900/60 backdrop-blur-sm border border-gray-800 hover:border-amber-500/40 transition-colors duration-500"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: i * 0.2 }}
      >
        <div className="text-3xl">{item.icon}</div>
        <h4 className="text-xl font-medium tracking-wide">{item.title}</h4>
        <p className="text-gray-400 text-sm md:text-base leading-relaxed">
          {item.desc}
        </p>
      </motion.div>
    ))}
  </div>
</div>

      {/* Seção 3 - Banner claro final */}
      <motion.div
        className="relative"
        initial={{ scale: 1.1, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <img
          src={assets.secaosobre2}
          alt="Coleção Sublime"
          className="w-full h-[300px] object-cover brightness-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
        </div>
      </motion.div>
    </section>
  );
};

export default SecaoSobre;
