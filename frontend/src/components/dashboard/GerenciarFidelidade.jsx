import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Target, Settings, RefreshCw, Save, Plus, Trash2, Award, Users, Gift, ToggleLeft, ToggleRight, Package, Percent, DollarSign, Calendar, Edit, Check, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const initialLevels = [
  { id: 1, nome: "Bronze", minPontos: 0, cor: "#f97316", descricao: "Cliente inicial", recompensa: "Bem-vindo!" },
  { id: 2, nome: "Prata", minPontos: 5, cor: "#71717a", descricao: "Cliente frequente", recompensa: "10% de desconto" },
  { id: 3, nome: "Ouro", minPontos: 10, cor: "#f59e0b", descricao: "Cliente VIP", recompensa: "15% de desconto + brinde" },
  { id: 4, nome: "Mestre", minPontos: 15, cor: "#8b5cf6", descricao: "Cliente Mestre", recompensa: "20% de desconto + surpresa" },
];

const GerenciarFidelidade = ({ empresaId, isDark = true }) => {
  const [config, setConfig] = useState({
    ativo: true,
    pontosPorPedido: 1,
    pontosPorValor: 0,
    mensagemBoasVindas: "Bem-vindo ao nosso programa de fidelidade!",
  });

  const [levels, setLevels] = useState(initialLevels);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoRecompensa, setSalvandoRecompensa] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [novoLevel, setNovoLevel] = useState({ nome: "", minPontos: 0, cor: "#3b82f6", descricao: "", recompensa: "" });
  const [recompensas, setRecompensas] = useState([]);
  const [editingRecompensa, setEditingRecompensa] = useState(null);
  const [novaRecompensa, setNovaRecompensa] = useState({
    nome: "",
    descricao: "",
    tipo: "DESCONTO_PERCENTUAL",
    valorPontos: 10,
    descontoPercentual: null,
    descontoValorFixo: null,
    produtoId: null,
    imagemUrl: "",
    ativo: true,
    estoque: 0,
    dataInicio: "",
    dataFim: ""
  });
  const [abaAtiva, setAbaAtiva] = useState("config"); // "config" ou "recompensas"

  const carregarConfig = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      // Simulação de carregamento
      setTimeout(() => {
        setConfig({
          ativo: true,
          pontosPorPedido: 1,
          pontosPorValor: 0,
          mensagemBoasVindas: "Bem-vindo ao nosso programa de fidelidade!",
        });
        setLevels(initialLevels);
        setLoading(false);
      }, 500);
    } catch (err) {
      setErro("Erro ao carregar configuração: " + err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (empresaId) {
      carregarConfig();
    } else {
      setLoading(false);
      setErro("Nenhuma empresa selecionada.");
    }
  }, [empresaId, carregarConfig]);

  const salvarConfig = async () => {
    setSalvando(true);
    setMensagem("");
    setErro("");
    try {
      // Simulação de salvamento
      setTimeout(() => {
        setMensagem("Configuração salva com sucesso!");
        setSalvando(false);
      }, 800);
    } catch (err) {
      setErro("Erro ao salvar: " + err.message);
      setSalvando(false);
    }
  };

  const adicionarLevel = () => {
    if (!novoLevel.nome.trim() || novoLevel.minPontos < 0) {
      setErro("Preencha nome e pontos mínimos válidos");
      return;
    }

    const maxId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) : 0;
    const novoId = maxId + 1;
    setLevels([...levels, { ...novoLevel, id: novoId }].sort((a, b) => a.minPontos - b.minPontos));
    setNovoLevel({ nome: "", minPontos: 0, cor: "#3b82f6", descricao: "", recompensa: "" });
    setErro("");
  };

  const removerLevel = (id) => {
    if (levels.length <= 1) {
      setErro("É necessário ter pelo menos um nível");
      return;
    }
    setLevels(levels.filter(l => l.id !== id));
  };

  const atualizarLevel = (id, campo, valor) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [campo]: valor } : l));
  };

  // Funções para recompensas
  const carregarRecompensas = useCallback(async () => {
    if (!empresaId) return;
    try {
      // TODO: integrar com API
      // const response = await fetch(`${API_URL}/api/admin/empresas/${empresaId}/recompensas-fidelidade`);
      // const data = await response.json();
      // setRecompensas(data);

      // Mock data
      setRecompensas([
        {
          id: 1,
          nome: "10% de desconto",
          descricao: "Desconto em qualquer pedido",
          tipo: "DESCONTO_PERCENTUAL",
          valorPontos: 10,
          descontoPercentual: 10,
          descontoValorFixo: null,
          produtoId: null,
          imagemUrl: "",
          ativo: true,
          estoque: 0,
          estoqueUtilizado: 5,
          dataInicio: null,
          dataFim: null
        },
        {
          id: 2,
          nome: "Coca-Cola Grátis",
          descricao: "Refrigerante 350ml",
          tipo: "PRODUTO_GRATIS",
          valorPontos: 5,
          descontoPercentual: null,
          descontoValorFixo: null,
          produtoId: 123,
          produtoNome: "Coca-Cola 350ml",
          imagemUrl: "",
          ativo: true,
          estoque: 50,
          estoqueUtilizado: 12,
          dataInicio: null,
          dataFim: null
        }
      ]);
    } catch (err) {
      console.error("Erro ao carregar recompensas:", err);
    }
  }, [empresaId]);

  const salvarRecompensa = async () => {
    if (!empresaId) return;
    setSalvandoRecompensa(true);
    setMensagem("");
    setErro("");
    try {
      const payload = { ...novaRecompensa };
      // Converter campos vazios para null
      if (!payload.dataInicio) payload.dataInicio = null;
      if (!payload.dataFim) payload.dataFim = null;
      if (!payload.descontoPercentual) payload.descontoPercentual = null;
      if (!payload.descontoValorFixo) payload.descontoValorFixo = null;
      if (!payload.produtoId) payload.produtoId = null;

      // TODO: integrar com API
      // const url = editingRecompensa
      //   ? `${API_URL}/api/admin/empresas/${empresaId}/recompensas-fidelidade/${editingRecompensa.id}`
      //   : `${API_URL}/api/admin/empresas/${empresaId}/recompensas-fidelidade`;
      // const method = editingRecompensa ? 'PUT' : 'POST';
      // const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      // const data = await response.json();

      // Mock success
      if (editingRecompensa) {
        setRecompensas(recompensas.map(r => r.id === editingRecompensa.id ? { ...payload, id: editingRecompensa.id } : r));
      } else {
        const novoId = Math.max(...recompensas.map(r => r.id), 0) + 1;
        setRecompensas([...recompensas, { ...payload, id: novoId }]);
      }

      setNovaRecompensa({
        nome: "",
        descricao: "",
        tipo: "DESCONTO_PERCENTUAL",
        valorPontos: 10,
        descontoPercentual: null,
        descontoValorFixo: null,
        produtoId: null,
        imagemUrl: "",
        ativo: true,
        estoque: 0,
        dataInicio: "",
        dataFim: ""
      });
      setEditingRecompensa(null);
      setMensagem(editingRecompensa ? "Recompensa atualizada!" : "Recompensa criada!");
    } catch (err) {
      setErro("Erro ao salvar recompensa: " + err.message);
    } finally {
      setSalvandoRecompensa(false);
    }
  };

  const excluirRecompensa = async (id) => {
    if (!empresaId) return;
    if (!confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    try {
      // TODO: integrar com API
      // await fetch(`${API_URL}/api/admin/empresas/${empresaId}/recompensas-fidelidade/${id}`, { method: 'DELETE' });
      setRecompensas(recompensas.filter(r => r.id !== id));
      setMensagem("Recompensa excluída!");
    } catch (err) {
      setErro("Erro ao excluir recompensa: " + err.message);
    }
  };

  const toggleStatusRecompensa = async (id, ativoAtual) => {
    if (!empresaId) return;
    try {
      // TODO: integrar com API
      // await fetch(`${API_URL}/api/admin/empresas/${empresaId}/recompensas-fidelidade/${id}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ativo: !ativoAtual })
      // });
      setRecompensas(recompensas.map(r => r.id === id ? { ...r, ativo: !ativoAtual } : r));
      setMensagem("Status atualizado!");
    } catch (err) {
      setErro("Erro ao atualizar status: " + err.message);
    }
  };

  const editarRecompensa = (recompensa) => {
    setEditingRecompensa(recompensa);
    setNovaRecompensa({
      nome: recompensa.nome,
      descricao: recompensa.descricao || "",
      tipo: recompensa.tipo,
      valorPontos: recompensa.valorPontos,
      descontoPercentual: recompensa.descontoPercentual,
      descontoValorFixo: recompensa.descontoValorFixo,
      produtoId: recompensa.produtoId,
      imagemUrl: recompensa.imagemUrl || "",
      ativo: recompensa.ativo,
      estoque: recompensa.estoque,
      dataInicio: recompensa.dataInicio || "",
      dataFim: recompensa.dataFim || ""
    });
  };

  const cancelarEdicao = () => {
    setEditingRecompensa(null);
    setNovaRecompensa({
      nome: "",
      descricao: "",
      tipo: "DESCONTO_PERCENTUAL",
      valorPontos: 10,
      descontoPercentual: null,
      descontoValorFixo: null,
      produtoId: null,
      imagemUrl: "",
      ativo: true,
      estoque: 0,
      dataInicio: "",
      dataFim: ""
    });
  };

  useEffect(() => {
    if (empresaId && abaAtiva === "recompensas") {
      carregarRecompensas();
    }
  }, [empresaId, abaAtiva, carregarRecompensas]);

  const stats = useMemo(() => {
    return {
      totalClientes: 124,
      clientesAtivos: 89,
      pontosDistribuidos: 456,
      recompensasResgatadas: recompensas.reduce((sum, r) => sum + (r.estoqueUtilizado || 0), 0),
    };
  }, [recompensas]);

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center ${isDark ? "text-white/60" : "text-zinc-500"}`}>
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}>
            <Trophy className={`h-6 w-6 ${isDark ? "text-amber-300" : "text-amber-600"}`} />
          </div>
          <div>
            <h2 className={`text-xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
              Programa de Fidelidade
            </h2>
            <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
              Configure pontos, níveis e recompensas
            </p>
          </div>
        </div>

        {abaAtiva === "config" && (
          <button
            onClick={salvarConfig}
            disabled={salvando}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-bold text-white transition hover:shadow-[0_8px_25px_rgba(245,158,11,0.3)] disabled:opacity-50"
          >
            {salvando ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : "Salvar Configuração"}
          </button>
        )}
        {abaAtiva === "recompensas" && (
          <button
            onClick={salvarRecompensa}
            disabled={salvandoRecompensa}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 font-bold text-white transition hover:shadow-[0_8px_25px_rgba(147,51,234,0.3)] disabled:opacity-50"
          >
            {salvandoRecompensa ? <RefreshCw className="h-4 w-4 animate-spin" /> : (editingRecompensa ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />)}
            {salvandoRecompensa ? "Salvando..." : (editingRecompensa ? "Atualizar Recompensa" : "Nova Recompensa")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 border-b ${isDark ? "border-white/10" : "border-zinc-200"}`}>
        <button
          onClick={() => setAbaAtiva("config")}
          className={`px-4 py-2 text-sm font-bold transition ${abaAtiva === "config" ? (isDark ? "text-amber-300 border-b-2 border-amber-300" : "text-amber-600 border-b-2 border-amber-600") : (isDark ? "text-white/50 hover:text-white/80" : "text-zinc-500 hover:text-zinc-700")}`}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </div>
        </button>
        <button
          onClick={() => setAbaAtiva("recompensas")}
          className={`px-4 py-2 text-sm font-bold transition ${abaAtiva === "recompensas" ? (isDark ? "text-purple-300 border-b-2 border-purple-300" : "text-purple-600 border-b-2 border-purple-600") : (isDark ? "text-white/50 hover:text-white/80" : "text-zinc-500 hover:text-zinc-700")}`}
        >
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Recompensas
          </div>
        </button>
      </div>

      {/* Mensagens */}
      {mensagem && (
        <div className={`rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 ${isDark ? "text-emerald-300" : "text-emerald-700"}`}>
          {mensagem}
        </div>
      )}
      {erro && (
        <div className={`rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 ${isDark ? "text-red-300" : "text-red-700"}`}>
          {erro}
        </div>
      )}

      {abaAtiva === "config" ? (
        <>
          {/* Conteúdo da aba Configuração */}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <Users className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
            <span className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Clientes</span>
          </div>
          <p className={`mt-2 text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
            {stats.totalClientes}
          </p>
          <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>Total no programa</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
            <span className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Pontos</span>
          </div>
          <p className={`mt-2 text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
            {stats.pontosDistribuidos}
          </p>
          <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>Distribuídos</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <Gift className={`h-4 w-4 ${isDark ? "text-purple-400" : "text-purple-500"}`} />
            <span className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Recompensas</span>
          </div>
          <p className={`mt-2 text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
            {stats.recompensasResgatadas}
          </p>
          <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>Resgatadas</p>
        </div>

        <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <Target className={`h-4 w-4 ${isDark ? "text-green-400" : "text-green-500"}`} />
            <span className={`text-sm font-bold ${isDark ? "text-white/80" : "text-zinc-700"}`}>Ativos</span>
          </div>
          <p className={`mt-2 text-2xl font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
            {stats.clientesAtivos}
          </p>
          <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>Clientes ativos</p>
        </div>
      </div>

      {/* Configuração Geral */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          <Settings className="h-5 w-5" />
          Configuração Geral
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Programa ativo
              </label>
              <button
                onClick={() => setConfig({...config, ativo: !config.ativo})}
                className="flex items-center gap-3"
              >
                {config.ativo ? (
                  <ToggleRight className="h-6 w-6 text-emerald-500" />
                ) : (
                  <ToggleLeft className="h-6 w-6 text-zinc-400" />
                )}
                <span className={`text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
                  {config.ativo ? "Programa ativo" : "Programa desativado"}
                </span>
              </button>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Pontos por pedido
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.pontosPorPedido}
                onChange={(e) => setConfig({...config, pontosPorPedido: parseInt(e.target.value) || 0})}
                className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
              />
              <p className={`mt-1 text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                Pontos concedidos a cada pedido finalizado
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Pontos por valor gasto (R$)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={config.pontosPorValor}
                onChange={(e) => setConfig({...config, pontosPorValor: parseInt(e.target.value) || 0})}
                className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
              />
              <p className={`mt-1 text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                Pontos a cada R$1 gasto (0 = desativado)
              </p>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                Mensagem de boas-vindas
              </label>
              <textarea
                value={config.mensagemBoasVindas}
                onChange={(e) => setConfig({...config, mensagemBoasVindas: e.target.value})}
                rows="2"
                className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Níveis de Fidelidade */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          <Award className="h-5 w-5" />
          Níveis de Fidelidade
        </h3>

        <div className="mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Nome do nível"
              value={novoLevel.nome}
              onChange={(e) => setNovoLevel({...novoLevel, nome: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <input
              type="number"
              min="0"
              placeholder="Pontos mínimos"
              value={novoLevel.minPontos}
              onChange={(e) => setNovoLevel({...novoLevel, minPontos: parseInt(e.target.value) || 0})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <input
              type="text"
              placeholder="Cor (hex)"
              value={novoLevel.cor}
              onChange={(e) => setNovoLevel({...novoLevel, cor: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <input
              type="text"
              placeholder="Descrição"
              value={novoLevel.descricao}
              onChange={(e) => setNovoLevel({...novoLevel, descricao: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <input
              type="text"
              placeholder="Recompensa"
              value={novoLevel.recompensa}
              onChange={(e) => setNovoLevel({...novoLevel, recompensa: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
          </div>
          <button
            onClick={adicionarLevel}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nível
          </button>
        </div>

        <div className="space-y-3">
          {levels.map((level) => (
            <div
              key={level.id}
              className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ backgroundColor: level.cor }}
                />
                <div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{level.nome}</p>
                  <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                    {level.minPontos} pontos mínimos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    {level.descricao}
                  </p>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Recompensa: {level.recompensa}
                  </p>
                </div>

                <button
                  onClick={() => removerLevel(level.id)}
                  className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualização para Cliente */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <h3 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          Visualização do Cliente
        </h3>
        <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Exemplo: Cliente João</p>
              <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                8 pontos acumulados • Nível: Prata
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 rounded-full bg-zinc-700">
                <div className="h-full w-3/4 rounded-full bg-amber-500"></div>
              </div>
              <span className={`text-xs ${isDark ? "text-white/60" : "text-zinc-500"}`}>75%</span>
            </div>
          </div>
          <p className={`mt-4 text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
            Os clientes verão seus pontos e progresso no modal de fidelidade.
            Use as configurações acima para personalizar a experiência.
          </p>
        </div>
      </div>
        </>
      ) : (
        <>
          {/* Conteúdo da aba Recompensas */}
          <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
            <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
              {editingRecompensa ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingRecompensa ? "Editar Recompensa" : "Nova Recompensa"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Nome da Recompensa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 10% de desconto"
                  value={novaRecompensa.nome}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, nome: e.target.value})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Tipo *
                </label>
                <select
                  value={novaRecompensa.tipo}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, tipo: e.target.value})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                >
                  <option value="DESCONTO_PERCENTUAL">Desconto Percentual</option>
                  <option value="DESCONTO_VALOR_FIXO">Desconto Valor Fixo</option>
                  <option value="PRODUTO_GRATIS">Produto Grátis</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Pontos Necessários *
                </label>
                <input
                  type="number"
                  min="1"
                  value={novaRecompensa.valorPontos}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, valorPontos: parseInt(e.target.value) || 1})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              {novaRecompensa.tipo === "DESCONTO_PERCENTUAL" && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    Desconto (%) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.01"
                      placeholder="10"
                      value={novaRecompensa.descontoPercentual || ""}
                      onChange={(e) => setNovaRecompensa({...novaRecompensa, descontoPercentual: e.target.value ? parseFloat(e.target.value) : null})}
                      className={`w-full rounded-xl border px-4 py-3 pl-10 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                    />
                    <Percent className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                  </div>
                </div>
              )}

              {novaRecompensa.tipo === "DESCONTO_VALOR_FIXO" && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    Valor do Desconto (R$) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="5.00"
                      value={novaRecompensa.descontoValorFixo || ""}
                      onChange={(e) => setNovaRecompensa({...novaRecompensa, descontoValorFixo: e.target.value ? parseFloat(e.target.value) : null})}
                      className={`w-full rounded-xl border px-4 py-3 pl-10 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                    />
                    <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400" />
                  </div>
                </div>
              )}

              {novaRecompensa.tipo === "PRODUTO_GRATIS" && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    ID do Produto *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="123"
                    value={novaRecompensa.produtoId || ""}
                    onChange={(e) => setNovaRecompensa({...novaRecompensa, produtoId: e.target.value ? parseInt(e.target.value) : null})}
                    className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                  />
                  <p className={`mt-1 text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    ID do produto que será dado como brinde
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Descrição
                </label>
                <textarea
                  placeholder="Descrição da recompensa"
                  value={novaRecompensa.descricao}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, descricao: e.target.value})}
                  rows="2"
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Estoque (0 = ilimitado)
                </label>
                <input
                  type="number"
                  min="0"
                  value={novaRecompensa.estoque}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, estoque: parseInt(e.target.value) || 0})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Data Início (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={novaRecompensa.dataInicio}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, dataInicio: e.target.value})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Data Fim (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={novaRecompensa.dataFim}
                  onChange={(e) => setNovaRecompensa({...novaRecompensa, dataFim: e.target.value})}
                  className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={novaRecompensa.ativo}
                    onChange={(e) => setNovaRecompensa({...novaRecompensa, ativo: e.target.checked})}
                    className="h-4 w-4 rounded border-zinc-300"
                  />
                  <label htmlFor="ativo" className={`text-sm ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    Recompensa ativa
                  </label>
                </div>
                {editingRecompensa && (
                  <button
                    onClick={cancelarEdicao}
                    className="rounded-xl px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Recompensas */}
          <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
            <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
              <Gift className="h-5 w-5" />
              Recompensas Configuradas
            </h3>

            {recompensas.length === 0 ? (
              <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <Package className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
                <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Nenhuma recompensa criada</p>
                <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                  Crie sua primeira recompensa para clientes resgatarem com pontos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recompensas.map((recompensa) => (
                  <div
                    key={recompensa.id}
                    className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${recompensa.ativo ? (isDark ? "bg-emerald-500/20" : "bg-emerald-100") : (isDark ? "bg-red-500/20" : "bg-red-100")}`}>
                            {recompensa.tipo === "DESCONTO_PERCENTUAL" && <Percent className={`h-5 w-5 ${recompensa.ativo ? (isDark ? "text-emerald-300" : "text-emerald-600") : (isDark ? "text-red-300" : "text-red-600")}`} />}
                            {recompensa.tipo === "DESCONTO_VALOR_FIXO" && <DollarSign className={`h-5 w-5 ${recompensa.ativo ? (isDark ? "text-emerald-300" : "text-emerald-600") : (isDark ? "text-red-300" : "text-red-600")}`} />}
                            {recompensa.tipo === "PRODUTO_GRATIS" && <Package className={`h-5 w-5 ${recompensa.ativo ? (isDark ? "text-emerald-300" : "text-emerald-600") : (isDark ? "text-red-300" : "text-red-600")}`} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>{recompensa.nome}</p>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${recompensa.ativo ? (isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700") : (isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700")}`}>
                                {recompensa.ativo ? "Ativa" : "Inativa"}
                              </span>
                            </div>
                            <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                              {recompensa.tipo === "DESCONTO_PERCENTUAL" && `${recompensa.descontoPercentual}% de desconto`}
                              {recompensa.tipo === "DESCONTO_VALOR_FIXO" && `R$ ${recompensa.descontoValorFixo} de desconto`}
                              {recompensa.tipo === "PRODUTO_GRATIS" && `Produto grátis (ID: ${recompensa.produtoId})`}
                            </p>
                            <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-400"}`}>
                              {recompensa.descricao}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className={`text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
                              {recompensa.valorPontos} pontos
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            <span className={`text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
                              Estoque: {recompensa.estoque === 0 ? "Ilimitado" : `${recompensa.estoqueUtilizado || 0}/${recompensa.estoque}`}
                            </span>
                          </div>
                          {recompensa.dataInicio && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span className={`text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
                                {new Date(recompensa.dataInicio).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editarRecompensa(recompensa)}
                          className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => toggleStatusRecompensa(recompensa.id, recompensa.ativo)}
                          className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                        >
                          {recompensa.ativo ? <X className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4 text-emerald-500" />}
                        </button>
                        <button
                          onClick={() => excluirRecompensa(recompensa.id)}
                          className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default GerenciarFidelidade;