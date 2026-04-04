import { motion } from "framer-motion";
import { assets } from "../assets/assets";

export default function Hero() {
  return (
    <section className="w-full bg-zinc-950">
      <div
        className="relative flex flex-col-reverse md:grid lg:grid-cols-2 grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:px-12 overflow-hidden pt-24 md:pt-28 md:h-[72vh] border-b border-white/10"
        style={{
          backgroundImage: `url(${assets.fundo_secaosobre})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay escuro + vermelho (pizzaria) */}
        <div className="absolute inset-0 bg-zinc-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/70 via-zinc-950/70 to-zinc-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(220,38,38,0.22),transparent_60%)]" />

        {/* “Glow” decorativo */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-red-700/15 blur-3xl" />

        {/* IMAGEM (ideal: pizza / mock de app com pizza) */}
        <motion.img
          src={assets.secaosobre}
          alt="Pedidos e cardápio digital para pizzarias"
          className="rounded-3xl object-contain w-full max-h-[560px] relative self-end drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, ease: "easeOut" }}
        />

        {/* TEXTO */}
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 z-10 w-full"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-600 text-white shadow-[0_10px_30px_rgba(239,68,68,0.25)]">
              🍕 Plataforma para Pizzarias
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/10 border border-white/10 text-white/90">
              Cardápio online + página própria
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-5xl leading-tight text-white font-extrabold">
            Coloque sua pizzaria no{" "}
            <span className="text-red-400">digital</span> e receba{" "}
            <span className="underline decoration-4 decoration-red-500/80 underline-offset-4">
              mais pedidos
            </span>{" "}
            hoje.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-white/80 max-w-xl">
            Seja parceiro: crie sabores, tamanhos, adicionais e bordas. Publique
            uma <strong className="text-white">página exclusiva</strong> e
            receba pedidos com fluxo simples (WhatsApp ou checkout).
          </p>

          {/* “Info bar” (benefícios) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/90">
              ✅ URL própria da pizzaria
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/90">
              ✅ Sabores, tamanhos, borda e adicionais
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/90">
              ✅ Destaques, combos e promoções
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/90">
              ✅ Painel do parceiro (fácil de gerenciar)
            </div>
          </div>

          {/* “Mini URL” (remete marketplace) */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/30 border border-white/10 text-sm text-white/85">
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
              sua-plataforma.com/
              <span className="text-red-300 font-semibold">pizzaria-da-maria</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 pt-1">
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl transition bg-red-600 text-white hover:bg-red-500 font-semibold shadow-[0_14px_40px_rgba(239,68,68,0.22)]"
            >
              Acessar painel
              <span aria-hidden>→</span>
            </a>

            <a
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white hover:bg-white/10 transition font-semibold"
            >
              Quero ser parceiro
            </a>
          </div>

          {/* Micro-copy */}
          <div className="pt-2 text-sm text-white/65">
            Feito para pizzarias parceiras: cardápio completo, página própria e
            mais conversão no digital.
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#como-funciona" className="text-white/80 hover:text-white hover:underline">
              Como funciona
            </a>
            <a href="#planos" className="text-white/80 hover:text-white hover:underline">
              Planos
            </a>
            <a href="#duvidas" className="text-white/80 hover:text-white hover:underline">
              Dúvidas
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}