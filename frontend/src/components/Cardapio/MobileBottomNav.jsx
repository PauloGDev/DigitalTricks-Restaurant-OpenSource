// components/cardapio/MobileBottomNav.jsx
import { Gift, House, ReceiptText, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const items = [
  { label: "Início", icon: House, path: "/" },
  { label: "Promoções", icon: Gift, path: "/promocoes" },
  { label: "Pedidos", icon: ReceiptText, path: "/pedidos" },
  { label: "Perfil", icon: User, path: "/perfil" },
];

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-xl">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                active ? "text-red-600" : "text-zinc-500"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "scale-105" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}