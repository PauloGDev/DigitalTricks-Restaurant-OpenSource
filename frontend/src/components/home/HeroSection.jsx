import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, QrCode, Store } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#1A1A1A] text-white border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,37,42,0.18),transparent_35%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20 sm:pt-32 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-[0.12em]">
              <Store className="h-4 w-4 text-[#E5252A]" />
              Sistema para restaurantes
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Venda mais, organize melhor e fortaleça sua marca com a <span className="text-[#E5252A]">Geste</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/70 leading-8 max-w-2xl">
              Uma plataforma para restaurantes com cardápio digital, página própria,
              QR Code, atendimento e gestão em uma experiência moderna e profissional.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white font-semibold hover:shadow-[0_14px_35px_rgba(229,37,42,0.28)] transition-all"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Acessar painel
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/70">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5">
                <BadgeDollarSign className="h-4 w-4 text-[#E5252A]" />
                Canal próprio de vendas
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-white/5">
                <QrCode className="h-4 w-4 text-[#E5252A]" />
                QR Code para mesas
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="rounded-[28px] bg-[#111111] border border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">Pizzaria Geste</p>
                    <p className="text-sm text-white/50">Canal próprio de pedidos</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-[#E5252A]/15 text-[#ff7377] text-xs font-semibold border border-[#E5252A]/20">
                    Online
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    "Pizza grande + adicionais",
                    "Pedido por QR Code",
                    "Retirada e delivery",
                    "Atualização rápida no painel",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white text-sm font-semibold">Cardápio</p>
                    <p className="text-white/55 text-xs mt-1">mais organizado</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-white text-sm font-semibold">Operação</p>
                    <p className="text-white/55 text-xs mt-1">mais eficiente</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 hidden sm:block rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-white/50 font-bold">
                Resultado
              </p>
              <p className="mt-1 text-sm text-white font-semibold">
                mais presença, mais autonomia, mais organização
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;