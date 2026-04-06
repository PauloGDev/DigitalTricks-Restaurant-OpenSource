// components/cardapio/MobileBottomNav.jsx
import { Gift, House, ReceiptText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileBottomNav({
  onOfertas,
  onPedidos,
  onFidelidade,
  slug,
}) {
  const navigate = useNavigate();

  const items = [
    {
      label: "Início",
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
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-xl">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-zinc-500 transition hover:text-red-600"
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
