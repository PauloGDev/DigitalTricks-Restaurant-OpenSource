import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQItem = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 sm:px-6 py-5 flex items-center justify-between text-left"
      >
        <span className="font-bold text-[#1A1A1A]">{item.q}</span>
        <ChevronDown
          className={`h-5 w-5 text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="px-5 sm:px-6 pb-5 text-sm text-zinc-600 leading-7">
          {item.a}
        </div>
      )}
    </div>
  );
};

export default FAQItem;