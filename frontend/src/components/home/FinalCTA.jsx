import { Link } from "react-router-dom";

const FinalCTA = () => {
  return (
    <section className="pt-14 pb-16">
      <div className="rounded-[32px] bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 lg:p-10 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pronto para dar ao seu restaurante uma estrutura mais profissional?
          </h2>

          <p className="mt-3 text-white/70 text-sm sm:text-base leading-7">
            Com a Geste, você reúne cardápio digital, canal próprio, atendimento
            e gestão em uma experiência pensada para restaurantes que querem crescer
            com mais organização e autonomia.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/cadastro"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white font-semibold hover:shadow-[0_14px_35px_rgba(229,37,42,0.28)] transition-all"
            >
              Criar conta
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Acessar painel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;