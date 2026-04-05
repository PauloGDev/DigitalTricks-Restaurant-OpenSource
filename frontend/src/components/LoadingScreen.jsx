import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { assets } from "../assets/assets";
import {
  UtensilsCrossed,
  ChefHat,
  Flame,
  Clock4,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

const loadingSteps = [
  { icon: ChefHat, label: "Chefe conferindo..." },
  { icon: UtensilsCrossed, label: "Montando os pratos..." },
  { icon: Flame, label: "Aquece aí, tá quase!" },
  { icon: MapPin, label: "Verificando endereço..." },
  { icon: CreditCard, label: "Conferindo pagamento..." },
  { icon: Package, label: "Embalando seu pedido..." },
];

// ── Plate ring progress ──
function PlateProgress({ progress }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 blur-3xl rounded-full bg-red-600/20" />
      <svg className="w-36 h-36 sm:w-40 sm:h-40 -rotate-90" viewBox="0 0 120 120">
        {/* track */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        {/* animated ring */}
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 52}`}
          strokeDashoffset={2 * Math.PI * 52 * (1 - progress)}
          style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.4))" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={Math.round(progress * 100)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/80 text-xl font-bold tracking-tight"
        >
          {Math.round(progress * 100)}%
        </motion.span>
      </div>
    </div>
  );
}

// ── Floating plate icons on background ──
function FloatingParticles() {
  const items = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        id: i,
        size: 3 + (i % 4),
        left: (i * 10.3) % 100,
        top: (i * 13.7) % 100,
        color:
          ["text-red-500/10", "text-amber-500/10", "text-yellow-500/10"][
            i % 3
          ],
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {items.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute ${p.color}`}
          style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: p.size * 4 }}
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0.15, 0.3, 0.15],
            y: [0, -16, 0],
            rotate: [0, 15, -10, 0],
          }}
          transition={{
            duration: 3 + (p.id % 5) * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Flame className="w-3 h-3 text-white/10" />
        </motion.div>
      ))}
    </div>
  );
}

const LoadingScreen = () => {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setProgress(0);
    const t = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.015;
        return next >= 0.95 ? 0.95 : next;
      });
    }, 80);
    return () => clearInterval(t);
  }, []);

  const StepIcon = useMemo(() => loadingSteps[step].icon, [step]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden min-h-screen"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-[#170c0c] to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(229,37,42,0.18),transparent_60%),radial-gradient(circle_at_60%_80%,rgba(245,158,11,0.1),transparent_50%)]" />
      <FloatingParticles />

      {/* ── Content ── */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 gap-6">
        {/* Logo */}
        <motion.img
          src={assets.logo}
          alt="Loading"
          className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
          initial={{ y: 0, scale: 1 }}
          animate={{ y: [0, -8, 0], scale: [1, 1.01, 1] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        />

        {/* Plate progress ring */}
        <PlateProgress progress={progress} />

        {/* Animated step label */}
        <div className="h-6 flex items-center justify-center gap-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.35 }}
              className="flex items-center gap-2 text-sm text-zinc-300"
            >
              <StepIcon className="w-4 h-4 text-amber-400" />
              <span className="font-medium">{loadingSteps[step].label}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skeleton loader preview (fake dashboard/cards) */}
        <div className="mt-2 w-full max-w-xs space-y-2.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3, scaleX: 0.7 }}
              animate={{
                opacity: [0.2, 0.45, 0.2],
                scaleX: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.35,
              }}
              style={{ originX: 0 }}
              className="h-2.5 bg-white/10 rounded-full"
            />
          ))}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 max-w-xs text-center leading-relaxed"
        >
          <Clock4 className="w-3 h-3 shrink-0" />
          Carregando tudo para você... Se demorar, tente recarregar a página.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
