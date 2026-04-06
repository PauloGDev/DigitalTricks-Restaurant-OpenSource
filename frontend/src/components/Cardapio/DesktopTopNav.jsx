import { Gift, House, ReceiptText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DesktopTopNav({ onOfertas, onPedidos, onFidelidade, slug }) {
  const navigate = useNavigate();

  const items = [
    {
      label: "Inicio",
      icon: House,
      action: () => navigate(slug ? `/restaurante/${slug}` : "/"),
    },
    {
      label: "Ofertas",
      icon: Gift,
      action: () => onOfertas && onOfertas(),
    },
    {
      label: "Meus Pedidos",
      icon: ReceiptText,
      action: () => onPedidos && onPedidos(),
    },
    {
      label: "Fidelidade",
      icon: Star,
      action: () => onFidelidade && onFidelidade(),
    },
  ];

  return (
    <div className="hidden md:block">
      <nav className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
