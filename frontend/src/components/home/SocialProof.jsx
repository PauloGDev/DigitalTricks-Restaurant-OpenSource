const SocialProof = () => {
  const items = [
    "Ideal para pizzarias, hamburguerias, sushi, lanchonetes e delivery local",
    "Pensado para operação real, não só aparência",
    "Estrutura pronta para vender, divulgar e organizar",
  ];

  return (
    <section className="pt-14">
      <div className="rounded-[32px] border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex px-3 py-1 rounded-full bg-white border border-zinc-200 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
            Valor percebido
          </span>

          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Uma solução feita para restaurantes que querem profissionalizar o digital
          </h2>

          <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-7">
            A Geste posiciona o restaurante com mais força online, melhora a experiência
            do cliente e organiza melhor a operação em um único lugar.
          </p>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 leading-6"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;