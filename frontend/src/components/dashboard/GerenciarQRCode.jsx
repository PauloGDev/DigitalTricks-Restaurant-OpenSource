import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, ExternalLink, Plus, Trash2, Armchair } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function MesaQRCard({ slug, mesa, isDark, onRemove }) {
  const canvasRef = useRef(null);
  const url = `${window.location.origin}/menu/${slug}${mesa ? `?mesa=${mesa}` : ""}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: isDark ? "#FFFFFF" : "#000000", light: isDark ? "#1a1a1a" : "#FFFFFF" },
      }).catch(console.error);
    }
  }, [url, isDark]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${mesa ? `mesa-${mesa}` : "universal"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(console.error);
  };

  return (
    <div
      className={`rounded-3xl border p-5 transition ${
        isDark
          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
          : "border-zinc-200 bg-white hover:shadow-md"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <canvas
          ref={canvasRef}
          className={`rounded-2xl border ${isDark ? "border-white/10" : "border-zinc-200"}`}
        />
        <p className={`mt-3 text-sm font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
          {mesa ? `Mesa ${mesa}` : "QR Universal"}
        </p>
        <p className={`mt-0.5 max-w-full truncate text-xs ${isDark ? "text-white/40" : "text-zinc-500"}`}>
          {url}
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDownload}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Download className="h-3.5 w-3.5" /> Baixar
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isDark
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <Copy className="h-3.5 w-3.5" /> Copiar link
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isDark
                ? "border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/15"
                : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir
          </a>
          {mesa && onRemove && (
            <button
              onClick={() => onRemove(mesa)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/15"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GerenciarQRCode({ isDark, empresaId }) {
  const { user } = useAuth();
  const [restaurante, setRestaurante] = useState(null);
  const [novaMesa, setNovaMesa] = useState("");
  const [mesas, setMesas] = useState([]);

  const slug = restaurante?.slug || null;

  useEffect(() => {
    if (!user?.empresaId || !API_URL) return;
    const fetchSlug = async () => {
      try {
        // Novo endpoint: /api/public/restaurantes/me
        const res = await fetch(`${API_URL}/public/restaurantes/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Restaurante data:", data);
          setRestaurante(data);
          return;
        }
      } catch (error) {
        console.error("Erro ao buscar restaurante:", error);
      }
    };
    fetchSlug();
  }, [user]);

  const mesasString = useMemo(() => JSON.stringify(mesas), [mesas]);
  useEffect(() => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(`qr_mesas_${slug}`);
      if (stored) setMesas(JSON.parse(stored));
    } catch {}
  }, [slug]);

  const saveMesas = useCallback(
    (newMesas) => {
      setMesas(newMesas);
      if (slug) {
        try { localStorage.setItem(`qr_mesas_${slug}`, JSON.stringify(newMesas)); } catch {}
      }
    },
    [slug]
  );

  const addMesa = () => {
    const m = Number(novaMesa);
    if (!novaMesa || Number.isNaN(m) || m < 1) return;
    if (mesas.includes(m)) { setNovaMesa(""); return; }
    saveMesas([...mesas, m]);
    setNovaMesa("");
  };

  const removeMesa = (mesa) => {
    saveMesas(mesas.filter((m) => m !== mesa));
  };

  const addAllMesas = () => {
    const count = Number(prompt("Quantidade de mesas no restaurante?", "10"));
    if (!Number.isFinite(count) || count < 1) return;
    const allMesas = [];
    for (let i = 1; i <= count; i++) allMesas.push(i);
    saveMesas(allMesas);
  };

  if (!slug) {
    return (
      <div className={`rounded-2xl border p-6 text-center ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <QrCode className={`mx-auto h-10 w-10 ${isDark ? "text-white/30" : "text-zinc-400"}`} />
        <p className={`mt-3 text-sm font-bold ${isDark ? "text-white/60" : "text-zinc-700"}`}>
          Slug do restaurante não encontrado
        </p>
        <p className={`mt-1 text-xs ${isDark ? "text-white/35" : "text-zinc-500"}`}>
          Configure os dados do restaurante na seção Perfil primeiro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-3xl border p-5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-zinc-200 bg-white"}`}>
        <div className="flex items-start gap-4">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${isDark ? "border-[#E5252A]/20 bg-[#E5252A]/10" : "border-red-200 bg-red-50"}`}>
            <QrCode className={`h-5 w-5 ${isDark ? "text-[#ff6b6f]" : "text-[#E5252A]"}`} />
          </div>
          <div>
            <p className={`font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
              Gerador de QR Code — Cardápio Digital
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-zinc-600"}`}>
              Gere QR Codes para as mesas. O cliente escaneia e acessa o cardápio direto pelo celular.
            </p>
            <p className={`mt-2 text-xs ${isDark ? "text-white/30" : "text-zinc-400"}`}>
              URL base: <span className={`font-mono ${isDark ? "text-sky-400" : "text-blue-600"}`}>{`${window.location.origin}/menu/${slug}`}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
            <Armchair className={`h-4 w-4 ${isDark ? "text-white/50" : "text-zinc-500"}`} />
          </div>
          <input
            type="number"
            min="1"
            placeholder="N da mesa"
            value={novaMesa}
            onChange={(e) => setNovaMesa(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addMesa()}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
              isDark
                ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:ring-red-500/40"
                : "border-zinc-200 bg-white text-zinc-800 placeholder:text-zinc-400 focus:ring-red-500/20"
            } focus:outline-none focus:ring-2`}
          />
          <button
            onClick={addMesa}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 py-2 text-sm font-extrabold text-white transition hover:shadow-[0_14px_35px_rgba(229,37,42,0.25)]"
          >
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
        <button
          onClick={addAllMesas}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-bold transition ${
            isDark
              ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Gerar todas as mesas
        </button>
      </div>

      {/* QR Code sem mesa */}
      <div>
        <h3 className={`mb-3 text-sm font-extrabold uppercase tracking-[0.12em] ${isDark ? "text-white/40" : "text-zinc-400"}`}>
          QR Universal (sem mesa definida)
        </h3>
        <div className={`mb-3 rounded-2xl border p-4 ${isDark ? "border-sky-500/20 bg-sky-500/5" : "border-blue-200 bg-blue-50"}`}>
          <p className={`text-sm font-bold ${isDark ? "text-sky-300" : "text-blue-700"}`}>💡 Como funciona:</p>
          <ul className={`mt-2 space-y-1 text-xs ${isDark ? "text-white/60" : "text-zinc-600"}`}>
            <li>• Cliente escaneia este QR e acessa o cardápio</li>
            <li>• O número da mesa pode ser informado durante o pedido</li>
            <li>• Ideal para entrada, balcão ou áreas comuns</li>
            <li>• Útil quando não sabe qual mesa o cliente vai ocupar</li>
          </ul>
        </div>
        <div className="grid max-w-xs">
          <MesaQRCard slug={slug} mesa={null} isDark={isDark} />
        </div>
      </div>

      {/* Mesa QR Codes */}
      {mesas.length > 0 && (
        <div>
          <h3 className={`mb-3 text-sm font-extrabold uppercase tracking-[0.12em] ${isDark ? "text-white/40" : "text-zinc-400"}`}>
            QR por Mesa ({mesas.length})
          </h3>
          <div className={`mb-3 rounded-2xl border p-4 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
            <p className={`text-sm font-bold ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>📋 QR por mesa específica:</p>
            <ul className={`mt-2 space-y-1 text-xs ${isDark ? "text-white/60" : "text-zinc-600"}`}>
              <li>• Cada mesa tem seu próprio QR code exclusivo</li>
              <li>• A mesa é preenchida automaticamente no pedido</li>
              <li>• Ideal para restaurantes com mesas fixas numeradas</li>
              <li>• O cliente não precisa informar a mesa manualmente</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mesas.sort((a, b) => a - b).map((m) => (
              <MesaQRCard key={m} slug={slug} mesa={m} isDark={isDark} onRemove={removeMesa} />
            ))}
          </div>
        </div>
      )}

      {mesas.length === 0 && (
        <div className={`rounded-2xl border py-10 text-center ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
          <Armchair className={`mx-auto h-8 w-8 ${isDark ? "text-white/20" : "text-zinc-300"}`} />
          <p className={`mt-2 text-sm font-bold ${isDark ? "text-white/40" : "text-zinc-500"}`}>
            Nenhuma mesa cadastrada
          </p>
          <p className={`mt-1 text-xs ${isDark ? "text-white/25" : "text-zinc-400"}`}>
            Adicione uma mesa individual ou gere todas de uma vez
          </p>
        </div>
      )}
    </div>
  );
}