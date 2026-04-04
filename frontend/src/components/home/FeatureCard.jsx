const FeatureCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#E5252A]">
        <Icon className="h-4 w-4" />
        {item.label}
      </div>

      <h3 className="mt-3 text-lg font-bold text-[#1A1A1A] leading-snug">
        {item.title}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 leading-6">{item.desc}</p>
    </div>
  );
};

export default FeatureCard;