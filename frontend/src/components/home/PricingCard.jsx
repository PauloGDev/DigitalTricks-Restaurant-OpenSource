import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const PricingCard = ({ plan }) => {
  return (
    <div
      className={[
        "rounded-[32px] p-6 sm:p-7 border transition-all duration-300",
        plan.highlight
          ? "bg-[#1A1A1A] border-white/10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.20)]"
          : "bg-white border-zinc-200 text-[#1A1A1A]",
      ].join(" ")}
    >
      {plan.highlight && (
        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.12em] bg-[#E5252A]/15 text-[#ff6b6f] border border-[#E5252A]/20">
          Mais escolhido
        </span>
      )}

      <h3 className="mt-4 text-2xl font-extrabold">{plan.name}</h3>
      <p
        className={`mt-2 text-sm leading-6 ${
          plan.highlight ? "text-white/65" : "text-zinc-600"
        }`}
      >
        {plan.description}
      </p>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-3xl sm:text-4xl font-extrabold">{plan.price}</span>
        <span className={plan.highlight ? "text-white/60" : "text-zinc-500"}>
          {plan.period}
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <div
              className={[
                "h-5 w-5 rounded-full grid place-items-center mt-0.5",
                plan.highlight ? "bg-white/10" : "bg-zinc-100",
              ].join(" ")}
            >
              <Check className="h-3.5 w-3.5 text-[#E5252A]" />
            </div>
            <span
              className={`text-sm ${
                plan.highlight ? "text-white/85" : "text-zinc-700"
              }`}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/cadastro"
        className={[
          "mt-8 inline-flex w-full items-center justify-center px-5 py-3 rounded-2xl font-semibold transition-all",
          plan.highlight
            ? "bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white hover:shadow-[0_14px_35px_rgba(229,37,42,0.25)]"
            : "bg-[#1A1A1A] text-white hover:bg-black",
        ].join(" ")}
      >
        Escolher plano
      </Link>
    </div>
  );
};

export default PricingCard;