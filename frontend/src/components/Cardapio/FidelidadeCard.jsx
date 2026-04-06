import { Gift, Star, ArrowUpRight } from "lucide-react";

function proximoRecompensa(pontos) {
  if (pontos >= 15) return { nivel: "Mestre", falta: 0, cor: "text-purple-600" };
  if (pontos >= 10) return { nivel: "Ouro", falta: 15 - pontos, cor: "text-amber-600" };
  if (pontos >= 5) return { nivel: "Prata", falta: 10 - pontos, cor: "text-zinc-600" };
  return { nivel: "Bronze", falta: 5 - pontos, cor: "text-orange-600" };
}

export default function FidelidadeCard({ pontos, totalPedidos, onAbrirFidelidade }) {
  if (pontos == null || pontos <= 0) return null;

  const prog = proximoRecompensa(pontos);

  return (
    <button
      onClick={onAbrirFidelidade}
      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 transition hover:shadow-md"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <Star className="h-4 w-4" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-amber-700">
          {pontos} ponto{pontos !== 1 ? "s" : ""}
        </p>
        {prog.falta > 0 && (
          <p className="text-[10px] text-amber-500">
            Faltam {prog.falta} para {prog.nivel}
          </p>
        )}
        {prog.falta === 0 && (
          <p className="text-[10px] text-purple-500 font-semibold">
            Nivel maximo atingido!
          </p>
        )}
      </div>
      <ArrowUpRight className="ml-auto h-4 w-4 text-amber-400" />
    </button>
  );
}
