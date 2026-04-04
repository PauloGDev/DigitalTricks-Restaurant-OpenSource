const SectionHeader = ({ eyebrow, title, description, actions }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
      <div className="max-w-3xl">
        {eyebrow && (
          <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
            {eyebrow}
          </span>
        )}

        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          {title}
        </h2>

        {description && (
          <p className="text-sm sm:text-base text-zinc-600 mt-2 leading-7">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="hidden sm:flex gap-2">{actions}</div>}
    </div>
  );
};

export default SectionHeader;