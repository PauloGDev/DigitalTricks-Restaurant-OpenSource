const StepCard = ({ step }) => {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white grid place-items-center font-extrabold shadow-[0_12px_30px_rgba(229,37,42,0.18)]">
          {step.n}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
          {step.title}
        </h3>
      </div>

      <p className="mt-3 text-sm text-zinc-600 leading-6">{step.desc}</p>
    </div>
  );
};

export default StepCard;