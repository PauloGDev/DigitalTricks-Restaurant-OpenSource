const PillarCard = ({ title, desc, Icon }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
      <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
        <Icon className="h-5 w-5 text-[#E5252A]" />
      </div>

      <div className="mt-4">
        <h3 className="text-base sm:text-lg font-bold text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-white/70 leading-6">{desc}</p>
      </div>
    </div>
  );
};

export default PillarCard;