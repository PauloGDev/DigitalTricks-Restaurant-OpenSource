import { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Target, Settings, RefreshCw, Save, Plus, Trash2, Award, Users, Gift, ToggleLeft, ToggleRight, Package, Percent, DollarSign, Calendar, Edit, Check, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const initialLevels = [
  { id: 1, nome: "Bronze", minPontos: 0, cor: "#f97316", descricao: "Cliente inicial", recompensaId: null },
  { id: 2, nome: "Prata", minPontos: 5, cor: "#71717a", descricao: "Cliente frequente", recompensaId: null },
  { id: 3, nome: "Ouro", minPontos: 10, cor: "#f59e0b", descricao: "Cliente VIP", recompensaId: null },
  { id: 4, nome: "Mestre", minPontos: 15, cor: "#8b5cf6", descricao: "Cliente Mestre", recompensaId: null },
];

const levelColorOptions = [
  { nome: "Laranja", valor: "#f97316" },
  { nome: "Cinza", valor: "#71717a" },
  { nome: "Dourado", valor: "#f59e0b" },
  { nome: "Roxo", valor: "#8b5cf6" },
  { nome: "Azul", valor: "#3b82f6" },
  { nome: "Verde", valor: "#22c55e" },
  { nome: "Vermelho", valor: "#ef4444" },
  { nome: "Rosa", valor: "#ec4899" },
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
  const [novoLevel, setNovoLevel] = useState({ nome: "", minPontos: 0, cor: "#3b82f6", descricao: "", recompensaId: null });
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
  const [produtos, setProdutos] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [carregandoRecompensas, setCarregandoRecompensas] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    pontosDistribuidos: 0,
    recompensasResgatadas: 0
  });
  const [levelEditandoRecompensas, setLevelEditandoRecompensas] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const carregarConfig = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Nao autenticado. Faca login novamente.");
      }

      const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/niveis-fidelidade`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const niveis = await response.json();

      setConfig({
        ativo: true,
        pontosPorPedido: 1,
        pontosPorValor: 0,
        mensagemBoasVindas: "Bem-vindo ao nosso programa de fidelidade!",
      });
      setLevels(Array.isArray(niveis) && niveis.length > 0 ? niveis : initialLevels);
      setLoading(false);
    } catch (err) {
      setErro("Erro ao carregar configuracao: " + err.message);
      setLoading(false);
    }
  }, [empresaId]);

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
      const token = localStorage.getItem("token");

      // TODO: Salvar configuracao na API quando endpoint existir
      // Por enquanto, simular salvamento
      setTimeout(() => {
        setMensagem("Configuracao salva com sucesso!");
        setSalvando(false);
      }, 800);
    } catch (err) {
      setErro("Erro ao salvar: " + err.message);
      setSalvando(false);
    }
  };

  const adicionarLevel = () => {
    if (!novoLevel.nome.trim() || novoLevel.minPontos < 0) {
      setErro("Preencha nome e pontos minimos validos");
      return;
    }

    const maxId = levels.length > 0 ? Math.max(...levels.map(l => l.id)) : 0;
    const novoId = maxId + 1;
    setLevels([...levels, { ...novoLevel, id: novoId }].sort((a, b) => a.minPontos - b.minPontos));
    setNovoLevel({ nome: "", minPontos: 0, cor: "#3b82f6", descricao: "", recompensaId: null });
    setErro("");
  };

  const removerLevel = (id) => {
    if (levels.length <= 1) {
      setErro("E necessario ter pelo menos um nivel");
      return;
    }
    setLevels(levels.filter(l => l.id !== id));
  };

  const atualizarLevel = (id, campo, valor) => {
    setLevels(levels.map(l => l.id === id ? { ...l, [campo]: valor } : l));
  };

  const selecionarCorNovoNivel = (cor) => {
    setNovoLevel({ ...novoLevel, cor });
    setColorPickerOpen(false);
  };

  // Funcoes para recompensas
  const carregarRecompensas = useCallback(async () => {
    if (!empresaId || !API_URL) return;
    setCarregandoRecompensas(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Nao autenticado. Faca login novamente.");
        setCarregandoRecompensas(false);
        return;
      }

      const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/recompensas-fidelidade`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Endpoint nao encontrado ou nenhuma recompensa ainda
          setRecompensas([]);
          setCarregandoRecompensas(false);
          return;
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRecompensas(data);
    } catch (err) {
      console.error("Erro ao carregar recompensas:", err);
      setErro("Falha ao carregar recompensas. Verifique sua conexao.");
      // Fallback para mock data em desenvolvimento
      if (API_URL.includes('localhost') || API_URL === '') {
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
            nome: "Coca-Cola Gratis",
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
      }
    } finally {
      setCarregandoRecompensas(false);
    }
  }, [empresaId]);

  const salvarRecompensa = async () => {
    if (!empresaId) return;
    setSalvandoRecompensa(true);
    setMensagem("");
    setErro("");
    try {
      // Validacao basica
      if (!novaRecompensa.nome.trim()) {
        throw new Error("Nome da recompensa e obrigatorio");
      }
      if (!novaRecompensa.valorPontos || novaRecompensa.valorPontos <= 0) {
        throw new Error("Pontos necessarios devem ser maior que zero");
      }

      // Validacao por tipo
      if (novaRecompensa.tipo === "DESCONTO_PERCENTUAL") {
        if (!novaRecompensa.descontoPercentual || novaRecompensa.descontoPercentual <= 0 || novaRecompensa.descontoPercentual > 100) {
          throw new Error("Desconto percentual deve estar entre 1 e 100");
        }
      } else if (novaRecompensa.tipo === "DESCONTO_VALOR_FIXO") {
        if (!novaRecompensa.descontoValorFixo || novaRecompensa.descontoValorFixo <= 0) {
          throw new Error("Desconto valor fixo deve ser maior que zero");
        }
      } else if (novaRecompensa.tipo === "PRODUTO_GRATIS") {
        if (!novaRecompensa.produtoId) {
          throw new Error("ID do produto e obrigatorio para produto gratis");
        }
      }

      // Validacao de datas
      if (novaRecompensa.dataInicio || novaRecompensa.dataFim) {
        // Se uma data existe, a outra deve existir tambem
        if ((novaRecompensa.dataInicio && !novaRecompensa.dataFim) ||
            (!novaRecompensa.dataInicio && novaRecompensa.dataFim)) {
          throw new Error("Ambas as datas (inicio e fim) devem ser preenchidas ou deixadas vazias");
        }

        if (novaRecompensa.dataInicio && novaRecompensa.dataFim) {
          const inicio = new Date(novaRecompensa.dataInicio);
          const fim = new Date(novaRecompensa.dataFim);
          if (fim < inicio) {
            throw new Error("Data de fim nao pode ser anterior a  data de inicio");
          }
        }
      }

      const payload = { ...novaRecompensa };
      // Converter campos vazios para null (mas 0 e valor valido para descontos)
      if (!payload.dataInicio) payload.dataInicio = null;
      if (!payload.dataFim) payload.dataFim = null;
      if (payload.descontoPercentual === undefined || payload.descontoPercentual === "") payload.descontoPercentual = null;
      if (payload.descontoValorFixo === undefined || payload.descontoValorFixo === "") payload.descontoValorFixo = null;
      if (!payload.produtoId) payload.produtoId = null;

      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Nao autenticado. Faca login novamente.");
        return;
      }

      const url = editingRecompensa
        ? `${API_URL}/admin/empresas/${empresaId}/recompensas-fidelidade/${editingRecompensa.id}`
        : `${API_URL}/admin/empresas/${empresaId}/recompensas-fidelidade`;
      const method = editingRecompensa ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();

      // Atualizar lista localmente
      if (editingRecompensa) {
        setRecompensas(recompensas.map(r => r.id === editingRecompensa.id ? data : r));
      } else {
        setRecompensas([...recompensas, data]);
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
    if (!confirm("Tem certeza que deseja excluir esta recompensa? Esta acao nao pode ser desfeita.")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Nao autenticado. Faca login novamente.");
        return;
      }

      const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/recompensas-fidelidade/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      setRecompensas(recompensas.filter(r => r.id !== id));
      setMensagem("Recompensa excluida com sucesso!");
    } catch (err) {
      setErro("Erro ao excluir recompensa: " + err.message);
    }
  };

  const toggleStatusRecompensa = async (id, ativoAtual) => {
    if (!empresaId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErro("Nao autenticado. Faca login novamente.");
        return;
      }

      const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/recompensas-fidelidade/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ativo: !ativoAtual })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setRecompensas(recompensas.map(r => r.id === id ? data : r));
      setMensagem("Status atualizado com sucesso!");
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

  const handleDataChange = (campo, valor) => {
    const novaData = { ...novaRecompensa, [campo]: valor };

    // Validar se dataFim nao e anterior a dataInicio
    if (campo === "dataFim" && valor && novaData.dataInicio) {
      const inicio = new Date(novaData.dataInicio);
      const fim = new Date(valor);
      if (fim < inicio) {
        setErro("Data de fim nao pode ser anterior a  data de inicio");
        // Nao atualizar o estado se a data for invalida
        return;
      }
    } else if (campo === "dataInicio" && valor && novaRecompensa.dataFim) {
      const inicio = new Date(valor);
      const fim = new Date(novaRecompensa.dataFim);
      if (fim < inicio) {
        setErro("Data de fim nao pode ser anterior a  data de inicio");
        return;
      }
    }

    setErro(""); // Limpar erro se validacao passar
    setNovaRecompensa(novaData);
  };

  const buscarProdutos = useCallback(async () => {
    if (!empresaId || !API_URL) return;
    setCarregandoProdutos(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_URL}/empresas/${empresaId}/produtos?size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const listaProdutos = Array.isArray(data?.produtos)
          ? data.produtos
          : Array.isArray(data)
            ? data
            : [];

        setProdutos(listaProdutos);
      } else {
        throw new Error(`Falha ao buscar produtos (${response.status})`);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setCarregandoProdutos(false);
    }
  }, [empresaId]);

  const buscarEstatisticas = useCallback(async () => {
    if (!empresaId || !API_URL) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // TODO: Implementar endpoint de estatisticas
      // Por enquanto, usar valores calculados das recompensas
      // Quando endpoint existir:
      // const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/fidelidade/estatisticas`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setEstatisticas(data);

      // Calcular com base nas recompensas (temporario)
      const recompensasResgatadas = recompensas.reduce((sum, r) => sum + (r.estoqueUtilizado || 0), 0);

      setEstatisticas({
        totalClientes: 124, // Mock - buscar do backend
        clientesAtivos: 89, // Mock - buscar do backend
        pontosDistribuidos: 456, // Mock - buscar do backend
        recompensasResgatadas
      });
    } catch (err) {
      console.error("Erro ao buscar estatisticas:", err);
    }
  }, [empresaId, recompensas]);

  const salvarRecompensasLevel = async (levelId, recompensaId) => {
    setSalvandoRecompensa(true);
    setMensagem("");
    setErro("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Nao autenticado. Faca login novamente.");
      }

      const updatedLevels = levels.map(l => l.id === levelId ? { ...l, recompensaId } : l);

      const response = await fetch(`${API_URL}/admin/empresas/${empresaId}/niveis-fidelidade`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedLevels.map((level) => ({
          id: level.id ?? null,
          nome: level.nome,
          minPontos: level.minPontos,
          cor: level.cor,
          descricao: level.descricao,
          recompensaId: level.recompensaId ?? null,
        })))
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `Erro ${response.status}: ${response.statusText}`);
      }

      const savedLevels = await response.json();
      setLevels(Array.isArray(savedLevels) && savedLevels.length > 0 ? savedLevels : updatedLevels);
      setLevelEditandoRecompensas(null);
      setMensagem("Recompensa associada ao nivel com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar associacao de nivel:", err);
      setErro("Erro ao salvar associacao: " + err.message);
    } finally {
      setSalvandoRecompensa(false);
    }
  };

  useEffect(() => {
    if (empresaId && abaAtiva === "recompensas") {
      carregarRecompensas();
      // Buscar produtos quando estiver na aba de recompensas
      buscarProdutos();
    }
  }, [empresaId, abaAtiva, carregarRecompensas, buscarProdutos]);

  useEffect(() => {
    // Quando o tipo muda para PRODUTO_GRATIS e nao ha produtos carregados, buscar
    if (novaRecompensa.tipo === "PRODUTO_GRATIS" && produtos.length === 0 && empresaId) {
      buscarProdutos();
    }
  }, [novaRecompensa.tipo, produtos.length, empresaId, buscarProdutos]);

  useEffect(() => {
    // Buscar estatisticas quando carregar recompensas
    if (recompensas.length > 0) {
      buscarEstatisticas();
    }
  }, [recompensas, buscarEstatisticas]);

  const stats = useMemo(() => {
    return {
      totalClientes: estatisticas.totalClientes,
      clientesAtivos: estatisticas.clientesAtivos,
      pontosDistribuidos: estatisticas.pontosDistribuidos,
      recompensasResgatadas: estatisticas.recompensasResgatadas,
    };
  }, [estatisticas]);

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
              Configure pontos, niveis e recompensas
            </p>
          </div>
        </div>

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
            Configuracao
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
          {/* Conteudo da aba Configuracao */}

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
          <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>Distribuidos</p>
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

      {/* Configuracao Geral */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          <Settings className="h-5 w-5" />
          Configuracao Geral
        </h3>

        <div className={`mb-5 rounded-2xl border p-4 ${isDark ? "border-amber-500/20 bg-amber-500/10" : "border-amber-200 bg-amber-50"}`}>
          <p className={`text-sm font-semibold ${isDark ? "text-amber-200" : "text-amber-800"}`}>
            Tutorial rapido
          </p>
          <p className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
            Ative o programa, defina quantos pontos o cliente ganha e personalize a mensagem inicial.
            Depois ajuste os niveis logo abaixo e salve tudo nesta mesma tela.
          </p>
        </div>

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

      {/* Niveis de Fidelidade */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className={`flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
            <Award className="h-5 w-5" />
            Niveis de Fidelidade
          </h3>
          <button
            onClick={salvarConfig}
            disabled={salvando}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-bold text-white transition hover:shadow-[0_8px_25px_rgba(245,158,11,0.3)] disabled:opacity-50 md:self-start"
          >
            {salvando ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : "Salvar Configuracao"}
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className={`rounded-2xl border p-4 ${isDark ? "border-blue-500/20 bg-blue-500/10" : "border-blue-200 bg-blue-50"}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-blue-200" : "text-blue-800"}`}>1. Crie o nivel</p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
              Escolha nome, pontuacao minima, cor e uma descricao curta para identificar a faixa.
            </p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-purple-500/20 bg-purple-500/10" : "border-purple-200 bg-purple-50"}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-purple-200" : "text-purple-800"}`}>2. Ligue a recompensa</p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
              Use o icone de presente para associar uma recompensa especifica a cada nivel.
            </p>
          </div>
          <div className={`rounded-2xl border p-4 ${isDark ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
            <p className={`text-sm font-semibold ${isDark ? "text-emerald-200" : "text-emerald-800"}`}>3. Salve no final</p>
            <p className={`mt-1 text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
              Quando concluir as alteracoes, clique em salvar para persistir a configuracao dos niveis.
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <input
              type="text"
              placeholder="Nome do nivel"
              value={novoLevel.nome}
              onChange={(e) => setNovoLevel({...novoLevel, nome: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <input
              type="number"
              min="0"
              placeholder="Pontos minimos"
              value={novoLevel.minPontos}
              onChange={(e) => setNovoLevel({...novoLevel, minPontos: parseInt(e.target.value) || 0})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
            <button
              type="button"
              onClick={() => setColorPickerOpen(true)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-5 w-5 rounded-full border border-black/10"
                  style={{ backgroundColor: novoLevel.cor }}
                />
                <span>Selecionar cor</span>
              </span>
              <span className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                {levelColorOptions.find((option) => option.valor === novoLevel.cor)?.nome || "Padrao"}
              </span>
            </button>
            <input
              type="text"
              placeholder="Descricao"
              value={novoLevel.descricao}
              onChange={(e) => setNovoLevel({...novoLevel, descricao: e.target.value})}
              className={`rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
            />
          </div>
          <button
            onClick={adicionarLevel}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-bold text-white"
          >
            <Plus className="h-4 w-4" />
            Adicionar Nivel
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
                    {level.minPontos} pontos minimos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                    {level.descricao}
                  </p>
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Recompensa: {(() => {
                      if (!level.recompensaId) return "Nenhuma";
                      const recompensaAssociada = recompensas.find((r) => r.id === level.recompensaId);
                      return recompensaAssociada?.nome || "Associacao invalida";
                    })()}
                  </p>
                </div>

                <button
                  onClick={() => setLevelEditandoRecompensas(level)}
                  className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
                >
                  <Gift className="h-4 w-4 text-blue-500" />
                </button>
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

      {colorPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl border p-5 ${isDark ? "border-white/10 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold">Escolha uma cor</h4>
                <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                  Selecione uma opcao padrao para o nivel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setColorPickerOpen(false)}
                className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {levelColorOptions.map((option) => {
                const selected = novoLevel.cor === option.valor;
                return (
                  <button
                    key={option.valor}
                    type="button"
                    onClick={() => selecionarCorNovoNivel(option.valor)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition ${selected ? (isDark ? "border-white/40 bg-white/10" : "border-zinc-400 bg-zinc-50") : (isDark ? "border-white/10 hover:border-white/20" : "border-zinc-200 hover:border-zinc-300")}`}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10"
                      style={{ backgroundColor: option.valor }}
                    >
                      {selected && <Check className="h-4 w-4 text-white" />}
                    </span>
                    <span className={`text-[11px] font-semibold ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                      {option.nome}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Associar Recompensas ao Nivel */}
      {levelEditandoRecompensas && (
        <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center ${isDark ? "" : ""}`}>
          <div className={`relative rounded-2xl border p-6 max-w-lg w-full mx-4 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                <Gift className="inline h-5 w-5 mr-2" />
                Recompensas para nivel {levelEditandoRecompensas.nome}
              </h3>
              <button
                onClick={() => setLevelEditandoRecompensas(null)}
                className={`rounded-xl p-2 ${isDark ? "hover:bg-white/10" : "hover:bg-zinc-100"}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className={`mb-4 text-sm ${isDark ? "text-white/70" : "text-zinc-600"}`}>
              Selecione UMA recompensa que sera automaticamente oferecida aos clientes quando atingem este nivel.
            </p>

            {carregandoRecompensas ? (
              <div className={`rounded-xl border p-8 text-center ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
                  <p className={`text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
                    Carregando recompensas...
                  </p>
                </div>
              </div>
            ) : recompensas.length === 0 ? (
              <div className={`rounded-xl border p-4 text-center ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                <Package className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
                <p className={`text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
                  Nenhuma recompensa configurada
                </p>
                <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                  Crie recompensas primeiro na aba "Recompensas"
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recompensas.map(recompensa => (
                  <div
                    key={recompensa.id}
                    onClick={() => {
                      // Se clicar na mesma recompensa, desmarca (null)
                      const newRecompensaId = levelEditandoRecompensas.recompensaId === recompensa.id ? null : recompensa.id;
                      setLevelEditandoRecompensas({...levelEditandoRecompensas, recompensaId: newRecompensaId});
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${isDark ? "border-white/10 hover:border-white/30" : "border-zinc-200 hover:border-zinc-300"} ${levelEditandoRecompensas.recompensaId === recompensa.id ? (isDark ? "bg-blue-500/20 border-blue-500/30" : "bg-blue-50 border-blue-200") : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${levelEditandoRecompensas.recompensaId === recompensa.id ? (isDark ? "border-blue-300 bg-blue-500" : "border-blue-400 bg-blue-500") : (isDark ? "border-white/30" : "border-zinc-300")}`}>
                        {levelEditandoRecompensas.recompensaId === recompensa.id && (
                          <div className={`h-2 w-2 rounded-full ${isDark ? "bg-white" : "bg-white"}`} />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${levelEditandoRecompensas.recompensaId === recompensa.id ? (isDark ? "text-blue-300" : "text-blue-700") : (isDark ? "text-white" : "text-zinc-900")}`}>
                          {recompensa.nome}
                        </p>
                        <p className={`text-xs ${levelEditandoRecompensas.recompensaId === recompensa.id ? (isDark ? "text-blue-300/80" : "text-blue-600") : (isDark ? "text-white/50" : "text-zinc-500")}`}>
                          {recompensa.tipo === "DESCONTO_PERCENTUAL" && `${recompensa.descontoPercentual}% de desconto`}
                          {recompensa.tipo === "DESCONTO_VALOR_FIXO" && `R$ ${recompensa.descontoValorFixo} de desconto`}
                          {recompensa.tipo === "PRODUTO_GRATIS" && `Produto gratis`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${levelEditandoRecompensas.recompensaId === recompensa.id ? (isDark ? "text-blue-300" : "text-blue-600") : (isDark ? "text-white/60" : "text-zinc-500")}`}>
                        {recompensa.valorPontos} pontos
                      </span>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => setLevelEditandoRecompensas({...levelEditandoRecompensas, recompensaId: null})}
                  className={`flex items-center justify-center rounded-xl border p-3 cursor-pointer transition ${isDark ? "border-white/10 hover:border-white/30" : "border-zinc-200 hover:border-zinc-300"} ${levelEditandoRecompensas.recompensaId === null ? (isDark ? "bg-red-500/20 border-red-500/30" : "bg-red-50 border-red-200") : ""}`}
                >
                  <X className={`h-4 w-4 mr-2 ${levelEditandoRecompensas.recompensaId === null ? (isDark ? "text-red-300" : "text-red-600") : (isDark ? "text-white/50" : "text-zinc-500")}`} />
                  <span className={`text-sm ${levelEditandoRecompensas.recompensaId === null ? (isDark ? "text-red-300" : "text-red-700") : (isDark ? "text-white/70" : "text-zinc-600")}`}>
                    Nenhuma recompensa
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setLevelEditandoRecompensas(null)}
                className={`rounded-xl px-4 py-2 font-bold ${isDark ? "text-white/70 hover:text-white/90" : "text-zinc-600 hover:text-zinc-800"}`}
              >
                Cancelar
              </button>
              <button
                onClick={() => salvarRecompensasLevel(levelEditandoRecompensas.id, levelEditandoRecompensas.recompensaId)}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-bold text-white"
              >
                Salvar Associacao
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visualizacao para Cliente */}
      <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
        <h3 className={`mb-4 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
          Visualizacao do Cliente
        </h3>
        <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-zinc-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>Exemplo: Cliente Joao</p>
              <p className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>
                8 pontos acumulados • Nivel: Prata
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
            Os clientes verao seus pontos e progresso no modal de fidelidade.
            Use as configuracoes acima para personalizar a experiencia.
          </p>

          {/* Recompensas do nivel Prata */}
          <div className={`mt-4 ${isDark ? "" : ""}`}>
            <p className={`text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
              Recompensas disponiveis no nivel Prata:
            </p>
            {(() => {
              const nivelPrata = levels.find(l => l.nome === "Prata");
              if (!nivelPrata || !nivelPrata.recompensaId) {
                return (
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Nenhuma recompensa associada a este nivel ainda.
                  </p>
                );
              }

              const recompensaPrata = recompensas.find(r => r.id === nivelPrata.recompensaId);
              if (!recompensaPrata) {
                return (
                  <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Recompensa associada nao encontrada.
                  </p>
                );
              }

              return (
                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                  <Gift className={`h-4 w-4 ${isDark ? "text-blue-400" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>{recompensaPrata.nome}</p>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                      {recompensaPrata.valorPontos} pontos • {recompensaPrata.tipo === "DESCONTO_PERCENTUAL" && `${recompensaPrata.descontoPercentual}%`}
                      {recompensaPrata.tipo === "DESCONTO_VALOR_FIXO" && `R$ ${recompensaPrata.descontoValorFixo}`}
                      {recompensaPrata.tipo === "PRODUTO_GRATIS" && "Produto gratis"}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
        </>
      ) : (
        <>
          {/* Conteudo da aba Recompensas */}
          <div className={`rounded-2xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
            <h3 className={`mb-4 flex items-center gap-2 text-lg font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
              {editingRecompensa ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingRecompensa ? "Editar Recompensa" : "Nova Recompensa"}
            </h3>

            <div className={`mb-5 rounded-2xl border p-4 ${isDark ? "border-purple-500/20 bg-purple-500/10" : "border-purple-200 bg-purple-50"}`}>
              <p className={`text-sm font-semibold ${isDark ? "text-purple-200" : "text-purple-800"}`}>
                Dica de configuracao
              </p>
              <p className={`mt-2 text-sm ${isDark ? "text-white/70" : "text-zinc-700"}`}>
                Desconto percentual funciona bem para beneficios leves, desconto fixo ajuda em campanhas promocionais
                e produto gratis e ideal para brindes. Depois de criar a recompensa, volte para a aba de configuracao
                e associe ela a um nivel.
              </p>
            </div>

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
                  <option value="PRODUTO_GRATIS">Produto Gratis</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Pontos Necessarios *
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
                    Produto Gratis *
                  </label>
                  {carregandoProdutos ? (
                    <div className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 animate-spin rounded-full border-2 ${isDark ? "border-white/20 border-t-white/60" : "border-zinc-200 border-t-zinc-600"}`}></div>
                        <span className={`text-sm ${isDark ? "text-white/60" : "text-zinc-500"}`}>Carregando produtos...</span>
                      </div>
                    </div>
                  ) : produtos.length === 0 ? (
                    <div className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white"}`}>
                      <div className="flex flex-col gap-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="ID do produto"
                          value={novaRecompensa.produtoId || ""}
                          onChange={(e) => setNovaRecompensa({...novaRecompensa, produtoId: e.target.value ? parseInt(e.target.value) : null})}
                          className={`w-full bg-transparent ${isDark ? "text-white placeholder-white/30" : "text-zinc-900 placeholder-zinc-400"}`}
                        />
                        <p className={`text-xs ${isDark ? "text-amber-300/70" : "text-amber-600"}`}>
                          Nenhum produto encontrado. Insira o ID manualmente.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={novaRecompensa.produtoId || ""}
                      onChange={(e) => setNovaRecompensa({...novaRecompensa, produtoId: e.target.value ? parseInt(e.target.value) : null})}
                      className={`w-full rounded-xl border px-4 py-3 ${isDark ? "border-white/10 bg-white/5 text-white" : "border-zinc-200 bg-white text-zinc-900"}`}
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map(produto => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} - R$ {produto.preco?.toFixed(2) || '0.00'}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className={`mt-1 text-xs ${isDark ? "text-white/50" : "text-zinc-500"}`}>
                    Produto que sera dado como brinde ao cliente
                  </p>
                </div>
              )}

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-white/80" : "text-zinc-700"}`}>
                  Descricao
                </label>
                <textarea
                  placeholder="Descricao da recompensa"
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
                  Data Inicio (opcional)
                </label>
                <input
                  type="datetime-local"
                  value={novaRecompensa.dataInicio}
                  onChange={(e) => handleDataChange("dataInicio", e.target.value)}
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
                  onChange={(e) => handleDataChange("dataFim", e.target.value)}
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
                              {recompensa.tipo === "PRODUTO_GRATIS" && `Produto gratis (ID: ${recompensa.produtoId})`}
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




