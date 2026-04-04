import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const MAX_VISIBLE = 5;

const Paginacao = ({ pagina, totalPaginas, mudarPagina }) => {
  if (totalPaginas <= 1) return null;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const gerarPaginas = () => {
    const paginas = [];
    let inicio = Math.max(1, pagina - Math.floor(MAX_VISIBLE / 2));
    let fim = Math.min(totalPaginas, inicio + MAX_VISIBLE - 1);

    if (fim - inicio < MAX_VISIBLE - 1) {
      inicio = Math.max(1, fim - MAX_VISIBLE + 1);
    }

    for (let i = inicio; i <= fim; i++) paginas.push(i);
    return paginas;
  };

  const paginasVisiveis = gerarPaginas();

  const go = (p) => mudarPagina(clamp(p, 1, totalPaginas));

  const Btn = ({ children, onClick, disabled, active, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={[
        "h-11 min-w-[44px] px-3 rounded-2xl",
        "inline-flex items-center justify-center",
        "text-sm font-semibold transition",
        "border",
        disabled
          ? "bg-zinc-50 text-zinc-300 border-zinc-200 cursor-not-allowed"
          : active
          ? "bg-red-600 text-white border-red-600 shadow-[0_12px_30px_rgba(239,68,68,0.18)]"
          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      ].join(" ")}
    >
      {children}
    </button>
  );

  Btn.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    active: PropTypes.bool,
    ariaLabel: PropTypes.string,
  };

  const Ellipsis = () => (
    <span
      className="h-11 min-w-[44px] px-2 rounded-2xl inline-flex items-center justify-center text-zinc-400 border border-transparent"
      aria-hidden="true"
    >
      <MoreHorizontal className="h-5 w-5" />
    </span>
  );

  return (
    <nav
      className="mt-8"
      role="navigation"
      aria-label="Paginação"
    >
      <div className="flex place-items-center items-center justify-between gap-3">
        {/* Mobile: info + setas grandes */}
        <div className="sm:hidden flex-1 text-sm text-zinc-500 font-semibold">
          Página <span className="text-zinc-900">{pagina}</span> de{" "}
          <span className="text-zinc-900">{totalPaginas}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Btn
            onClick={() => go(pagina - 1)}
            disabled={pagina === 1}
            ariaLabel="Página anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Btn>

          {/* Desktop: números */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Primeira página */}
            {paginasVisiveis[0] > 1 && (
              <>
                <Btn
                  onClick={() => go(1)}
                  active={pagina === 1}
                  ariaLabel="Ir para a página 1"
                >
                  1
                </Btn>

                {paginasVisiveis[0] > 2 && <Ellipsis />}
              </>
            )}

            {/* Páginas centrais */}
            {paginasVisiveis.map((p) => (
              <Btn
                key={p}
                onClick={() => go(p)}
                active={pagina === p}
                ariaLabel={`Ir para a página ${p}`}
              >
                {p}
              </Btn>
            ))}

            {/* Última página */}
            {paginasVisiveis[paginasVisiveis.length - 1] < totalPaginas && (
              <>
                {paginasVisiveis[paginasVisiveis.length - 1] < totalPaginas - 1 && (
                  <Ellipsis />
                )}

                <Btn
                  onClick={() => go(totalPaginas)}
                  active={pagina === totalPaginas}
                  ariaLabel={`Ir para a página ${totalPaginas}`}
                >
                  {totalPaginas}
                </Btn>
              </>
            )}
          </div>

          <Btn
            onClick={() => go(pagina + 1)}
            disabled={pagina === totalPaginas}
            ariaLabel="Próxima página"
          >
            <ChevronRight className="h-5 w-5" />
          </Btn>
        </div>
      </div>

      {/* Desktop: legenda opcional */}
      <div className="hidden sm:flex justify-center mt-3 text-xs text-zinc-500">
        Use as setas ou selecione uma página
      </div>
    </nav>
  );
};

Paginacao.propTypes = {
  pagina: PropTypes.number.isRequired,
  totalPaginas: PropTypes.number.isRequired,
  mudarPagina: PropTypes.func.isRequired,
};

export default Paginacao;