import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import UsuarioTabela from "./usuarios/UsuarioTabela";
import UsuarioModalNovo from "./usuarios/UsuarioModalNovo";
import UsuarioModalEdicao from "./usuarios/UsuarioModalEdicao";
import ConfirmDialog from "./ConfirmDialog";
import UsuarioPerfilModal from "./usuarios/UsuarioPerfilDrawer";

const API_URL = import.meta.env.VITE_API_URL;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const papeisPermitidos = ["DONO", "GERENTE", "ATENDENTE"];

const cx = (...classes) => classes.filter(Boolean).join(" ");

const getAuthToken = (user) => user?.token || localStorage.getItem("token") || "";

const parseApiError = async (res, fallback) => {
  try {
    const text = await res.text();
    return text || fallback;
  } catch {
    return fallback;
  }
};

const GerenciarUsuarios = ({ empresaId, isDark = true }) => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [filtro, setFiltro] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  const [novoUsuario, setNovoUsuario] = useState({
    usuarioId: "",
    papel: "ATENDENTE",
  });

  const [perfil, setPerfil] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);

  const fetchUsuarios = useCallback(async () => {
    if (!empresaId) {
      setUsuarios([]);
      setErro("Nenhuma empresa selecionada.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const token = getAuthToken(user);

      const res = await fetch(`${API_URL}/empresas/${empresaId}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await parseApiError(
          res,
          "Não foi possível carregar a equipe."
        );
        throw new Error(msg);
      }

      const data = await res.json();
      const lista = Array.isArray(data) ? data : [];

      const listaFiltrada = lista.filter((item) => {
        const papel = String(item?.papel || "").toUpperCase();
        const ativo = item?.ativo === true;

        const statusFiltro = filtro === "ATIVO" ? true : filtro === "INATIVO" ? false : null;

        return (
          papeisPermitidos.includes(papel) &&
          (statusFiltro === null || ativo === statusFiltro)
        );
      });

      setUsuarios(listaFiltrada);
      setPage(0);
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setUsuarios([]);
      setErro(err?.message || "Erro ao carregar equipe.");
    } finally {
      setLoading(false);
    }
  }, [empresaId, filtro, user]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const usuariosPaginados = useMemo(() => {
    const start = page * pageSize;
    return usuarios.slice(start, start + pageSize);
  }, [usuarios, page]);

  const totalPages = Math.max(1, Math.ceil(usuarios.length / pageSize));

  const abrirPerfil = async (usuarioId) => {
    try {
      const token = getAuthToken(user);
      const res = await fetch(`${API_URL}/perfis/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await parseApiError(
          res,
          "Não foi possível carregar o perfil."
        );
        throw new Error(msg);
      }

      const data = await res.json();
      setPerfil(data);
    } catch (err) {
      console.error("Erro ao abrir perfil:", err);
    }
  };

  const criarUsuario = async () => {
    try {
      const token = getAuthToken(user);

      const res = await fetch(`${API_URL}/empresas/${empresaId}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          usuarioId: Number(novoUsuario.usuarioId),
          papel: novoUsuario.papel,
        }),
      });

      if (!res.ok) {
        const msg = await parseApiError(
          res,
          "Não foi possível vincular o usuário."
        );
        throw new Error(msg);
      }

      await fetchUsuarios();
      setModalNovo(false);
      setNovoUsuario({
        usuarioId: "",
        papel: "ATENDENTE",
      });
    } catch (err) {
      console.error("Erro ao criar vínculo:", err);
      alert(err?.message || "Erro ao vincular usuário.");
    }
  };

  const atualizarUsuario = async () => {
    try {
      const token = getAuthToken(user);

      const res = await fetch(
      `${API_URL}/empresas/${empresaId}/usuarios/${usuarioSelecionado.usuarioEmpresaId || usuarioSelecionado.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            papel: usuarioSelecionado.papel,
            ativo: usuarioSelecionado.ativo,
          })
        }
      );

      if (!res.ok) {
        const msg = await parseApiError(
          res,
          "Não foi possível atualizar o usuário."
        );
        throw new Error(msg);
      }

      await fetchUsuarios();
      setModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      alert(err?.message || "Erro ao atualizar usuário.");
    }
  };

  const excluirUsuario = async () => {
    try {
      const token = getAuthToken(user);

      const res = await fetch(
        `${API_URL}/empresas/${empresaId}/usuarios/${usuarioParaExcluir}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const msg = await parseApiError(
          res,
          "Não foi possível remover o usuário."
        );
        throw new Error(msg);
      }

      await fetchUsuarios();
      setConfirmOpen(false);
      setUsuarioParaExcluir(null);
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      alert(err?.message || "Erro ao remover usuário.");
    }
  };

  return (
    <section className="space-y-4">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className={cx(
          "rounded-3xl border p-5 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white"
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-3xl bg-gradient-to-br from-[#E5252A] to-[#ff4b4f] text-white shadow-lg">
              <User className="h-5 w-5" />
            </span>

            <div>
              <h2
                className={cx(
                  "text-xl font-extrabold",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Gerenciar equipe
              </h2>
              <p
                className={cx(
                  "text-sm",
                  isDark ? "text-white/50" : "text-zinc-600"
                )}
              >
                Controle completo de usuários da empresa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsuarios}
              className={cx(
                "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-extrabold transition",
                isDark
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>

            <button
              onClick={() => setModalNovo(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] px-4 text-white font-extrabold hover:opacity-90 transition"
            >
              <Plus className="h-4 w-4" />
              Vincular
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div
            className={cx(
              "flex items-center gap-2 rounded-xl border px-3 py-2",
              isDark
                ? "border-white/10 bg-white/5"
                : "border-zinc-200 bg-white"
            )}
          >
            <Filter className="h-4 w-4 text-zinc-400" />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className={cx(
                "bg-transparent text-sm outline-none",
                isDark ? "text-white" : "text-zinc-900"
              )}
            >
              <option value="">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

          <div
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold",
              isDark
                ? "border-white/10 bg-white/5 text-white/70"
                : "border-zinc-200 bg-zinc-50 text-zinc-700"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            {usuarios.length} usuário(s)
          </div>

          <span
            className={cx(
              "ml-auto text-sm",
              isDark ? "text-white/60" : "text-zinc-600"
            )}
          >
            Página <b>{page + 1}</b> de <b>{totalPages}</b>
          </span>
        </div>
      </motion.div>

      <div
        className={cx(
          "rounded-3xl border p-4 backdrop-blur-xl",
          isDark
            ? "border-white/10 bg-[#121212]/95"
            : "border-zinc-200 bg-white"
        )}
      >
        {erro && !loading ? (
          <div
            className={cx(
              "rounded-2xl border p-8 text-center",
              isDark
                ? "border-red-500/20 bg-red-500/10 text-red-200"
                : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="font-bold">Erro ao carregar equipe</p>
            <p className="mt-1 text-sm opacity-80">{erro}</p>

            <button
              type="button"
              onClick={fetchUsuarios}
              className={cx(
                "mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition",
                isDark
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "bg-white text-red-700 hover:bg-red-100"
              )}
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        ) : (
          <UsuarioTabela
            usuarios={usuariosPaginados}
            loading={loading}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            abrirModal={(u) => {
              setUsuarioSelecionado(u);
              setModalOpen(true);
            }}
            excluirUsuario={(id) => {
              setUsuarioParaExcluir(id);
              setConfirmOpen(true);
            }}
            abrirPerfil={abrirPerfil}
            isDark={isDark}
          />
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <UsuarioModalEdicao
            usuarioSelecionado={usuarioSelecionado}
            setUsuarioSelecionado={setUsuarioSelecionado}
            onClose={() => setModalOpen(false)}
            onSave={atualizarUsuario}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalNovo && (
          <UsuarioModalNovo
            novoUsuario={novoUsuario}
            setNovoUsuario={setNovoUsuario}
            onClose={() => setModalNovo(false)}
            onCreate={criarUsuario}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="Remover usuário"
        message="Deseja realmente remover este usuário?"
        onConfirm={excluirUsuario}
        onCancel={() => setConfirmOpen(false)}
      />

      <AnimatePresence>
        {perfil && (
          <UsuarioPerfilModal
            perfil={perfil}
            onClose={() => setPerfil(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default GerenciarUsuarios;