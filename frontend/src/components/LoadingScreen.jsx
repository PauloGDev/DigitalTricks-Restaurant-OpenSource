import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Flame, UtensilsCrossed, ChefHat } from "lucide-react";

const loadingSteps = [
  "Preparando seu cardápio...",
  "Selecionando os melhores pratos...",
  "Aquece aí, já vai...",
  "Só um instante!",
];

// ── Animated orbiting rings ──
function OrbitRings() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: 120 + i * 40,
            height: 120 + i * 40,
            borderColor: `rgba(229,37,42,${0.08 - i * 0.02})`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 8 + i * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => {
        const size = 120 + i * 40;
        const duration = 8 + i * 4;
        return (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full bg-[#E5252A]"
            style={{
              width: 6 - i * 1.2,
              height: 6 - i * 1.2,
              boxShadow: "0 0 8px rgba(229,37,42,0.4)",
            }}
            animate={{
              x: (v, t) =>
                Math.cos(((t % duration) / duration) * Math.PI * 2) * (size / 2),
              y: (v, t) =>
                Math.sin(((t % duration) / duration) * Math.PI * 2) * (size / 2),
            }}
            transition={{
              duration,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        );
      })}
    </>
  );
}

// ── Pulse ring on click / mount ──
function PulseRing({ progress }) {
  const rings = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      delay: i * 0.8,
    }));
  }, []);

  return (
    <>
      {rings.map((r) => (
        <motion.div
          key={r.id}
          className="absolute inset-0 rounded-full border border-[#E5252A]/20"
          initial={{ scale: 0.6, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: r.delay,
          }}
        />
      ))}
    </>
  );
}

// ── Bouncing plate dots ──
function BouncingDots() {
  return (
    <div className="flex gap-1.5 mt-10">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#E5252A]"
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 0.9, 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

const LoadingScreen = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 overflow-hidden"
    >
      {/* Radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,37,42,0.08),transparent_90%)] pointer-events-none" />

      {/* Center */}
      <div className="relative flex flex-col items-center gap-0">
        {/* ── Logo + orbits ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-28 h-28 sm:w-32 sm:h-32"
        >
          {/* Pulse rings */}
          <PulseRing />

          {/* Orbiting rings & dots */}
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitRings />
          </div>

          {/* Logo */}
          <motion.img
            src="/logo1.svg"
            alt="Geste"
            draggable={false}
            className="relative w-full h-full object-contain"
            animate={{
              scale: [1, 1.03, 1],
              filter: ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 12px rgba(229,37,42,0.2))", "drop-shadow(0 0 0px transparent)"],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Step text */}
        <div className="mt-2 h-6 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold text-zinc-500 text-center"
            >
              {loadingSteps[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Bouncing dots */}
        <BouncingDots />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-[11px] text-zinc-400 text-center max-w-[220px] leading-relaxed"
        >
          O seu pedido está a um instante de começar.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
