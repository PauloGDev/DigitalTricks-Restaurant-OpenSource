import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assets } from "../assets/assets";
import { UtensilsCrossed, Receipt, Soup } from "lucide-react";

const tips = [
  { icon: UtensilsCrossed, text: "Preparando seu pedido com carinho..." },
  { icon: Soup, text: "Aquece aí… já já tá saindo!" },
  { icon: Receipt, text: "Conferindo os itens e o pagamento..." },
];

const LoadingScreen = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % tips.length), 1700);
    return () => clearInterval(t);
  }, []);

  const TipIcon = useMemo(() => tips[idx].icon, [idx]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-[#1a0b0b] to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.22),transparent_55%),radial-gradient(circle_at_70%_75%,rgba(245,158,11,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-black/35" />

      {/* subtle floating particles */}
      <div className="absolute inset-0 opacity-40">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-300/30"
            style={{
              left: `${(i * 7 + 12) % 100}%`,
              top: `${(i * 11 + 18) % 100}%`,
            }}
            initial={{ y: 0, opacity: 0.2 }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{
              duration: 3.4 + (i % 5) * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo + glow */}
        <div className="relative">
          <div className="absolute inset-0 blur-3xl rounded-full bg-red-600/25" />
          <motion.img
            src={assets.logo}
            alt="Logo"
            className="relative w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-[0_18px_60px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
            transition={{
              opacity: { duration: 0.7, ease: "easeOut" },
              scale: { duration: 0.7, ease: "easeOut" },
              y: { repeat: Infinity, duration: 2.2, ease: "easeInOut" },
            }}
          />
        </div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
          className="mt-6 text-white text-xl sm:text-2xl font-extrabold tracking-tight text-center"
        >
          Só um instante
        </motion.h2>

        {/* Rotating tip */}
        <div className="mt-2 h-7 sm:h-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2 text-sm sm:text-base text-zinc-200"
            >
              <TipIcon className="w-4 h-4 text-amber-300" />
              <span>{tips[idx].text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-full max-w-xs">
          <div className="h-2 rounded-full bg-white/10 border border-white/10 overflow-hidden shadow-inner">
            <motion.div
              className="h-full w-1/3 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(220,38,38,1) 0%, rgba(245,158,11,1) 50%, rgba(250,204,21,1) 100%)",
                boxShadow: "0 0 18px rgba(245,158,11,0.35)",
              }}
              initial={{ x: "-120%" }}
              animate={{ x: "320%" }}
              transition={{ repeat: Infinity, duration: 1.25, ease: "easeInOut" }}
            />
          </div>

          {/* tiny dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-white/25"
                animate={{ opacity: [0.25, 0.9, 0.25], y: [0, -2, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-8 text-xs text-zinc-300/80 text-center max-w-md leading-relaxed"
        >
          Se estiver demorando, verifique sua conexão. Estamos carregando as informações do seu pedido.
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;