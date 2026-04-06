import { motion } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";

const cx = (...c) => c.filter(Boolean).join(" ");

const getStatusStyle = (ativo, isDark) => {
  return ativo
    ? isDark
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
      : "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isDark
      ? "bg-white/5 text-white/60 border-white/10"
      : "bg-zinc-50 text-zinc-600 border-zinc-200";
};

const getPapelStyle = (papel, isDark) => {
  const normalized = String(papel || "").toUpperCase();

  const map = {
    DONO: isDark
      ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
      : "bg-amber-50 text-amber-700 border-amber-200",
    GERENTE: isDark
      ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
      : "bg-sky-50 text-sky-700 border-sky-200",
    ATENDENTE: isDark
      ? "bg-white/5 text-white/70 border-white/10"
      : "bg-zinc-50 text-zinc-700 border-zinc-200",
  };

  return map[normalized] || map.ATENDENTE;
};

const UsuarioTabela = ({
  usuarios,
  loading,
  page,
  totalPages,
  setPage,
  abrirModal,
  excluirUsuario,
  abrirPerfil,
  isDark = true,
}) => {
  return (
    <>
      <div
        className={cx(
          "overflow-x-auto rounded-3xl border backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white"
        )}
      >
        <table className="w-full text-left text-sm">
          <thead
            className={cx(
              isDark ? "bg-white/5 text-white/70" : "bg-zinc-50 text-zinc-700"
            )}
          >
            <tr>
              {["Usuário", "Email", "Status", "Papel", "Ações"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonRows isDark={isDark} />
            ) : usuarios.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className={cx(
                    "px-4 py-10 text-center",
                    isDark ? "text-white/50" : "text-zinc-500"
                  )}
                >
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              usuarios.map((u, index) => (
                <motion.tr
                  key={u.usuarioEmpresaId || `${u.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={cx(
                    "border-t cursor-pointer transition-all",
                    isDark
                      ? "border-white/10 hover:bg-white/[0.04]"
                      : "border-zinc-200 hover:bg-zinc-50"
                  )}
                  onClick={() => abrirPerfil(u.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-extrabold">
                        {u.nome || u.username}
                      </span>
                      <span
                        className={cx(
                          "text-xs",
                          isDark ? "text-white/40" : "text-zinc-500"
                        )}
                      >
                        @{u.username} · usuário #{u.id}
                      </span>
                    </div>
                  </td>

                  <td
                    className={cx(
                      "px-4 py-3 text-sm",
                      isDark ? "text-white/70" : "text-zinc-700"
                    )}
                  >
                    {u.email || "Sem email"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cx(
                        "rounded-full border px-3 py-1 text-xs font-extrabold",
                        getStatusStyle(u.ativo, isDark)
                      )}
                    >
                      {u.ativo ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={cx(
                        "rounded-full border px-3 py-1 text-xs font-extrabold",
                        getPapelStyle(u.papel, isDark)
                      )}
                    >
                      {u.papel || "ATENDENTE"}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirModal(u)}
                        className="flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-3 text-sm font-extrabold text-white shadow-[0_10px_25px_rgba(229,37,42,0.25)] transition hover:opacity-90"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => excluirUsuario(u.usuarioEmpresaId || u.id)}
                        className={cx(
                          "grid h-9 w-10 place-items-center rounded-xl transition",
                          isDark
                            ? "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                            : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
          className={cx(
            "h-10 rounded-xl px-4 font-bold transition disabled:opacity-50",
            isDark
              ? "border border-white/10 bg-white/5 hover:bg-white/10"
              : "border border-zinc-200 bg-white hover:bg-zinc-50"
          )}
        >
          Anterior
        </button>

        <span
          className={cx(
            "text-sm",
            isDark ? "text-white/60" : "text-zinc-600"
          )}
        >
          Página <b>{page + 1}</b> de <b>{totalPages}</b>
        </span>

        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="h-10 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 font-extrabold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </>
  );
};

const SkeletonRows = ({ isDark }) =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr
      key={i}
      className={cx("border-t", isDark ? "border-white/10" : "border-zinc-200")}
    >
      {Array.from({ length: 5 }).map((_, j) => (
        <td key={j} className="px-4 py-3">
          <div
            className={cx(
              "h-4 animate-pulse rounded",
              isDark ? "bg-white/10" : "bg-zinc-200"
            )}
          />
        </td>
      ))}
    </tr>
  ));

export default UsuarioTabela;