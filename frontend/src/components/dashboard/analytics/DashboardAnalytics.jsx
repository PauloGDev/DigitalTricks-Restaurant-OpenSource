import { useEffect, useMemo, useState, useCallback } from "react";
import AnalyticsHeader from "./AnalyticsHeader";
import AnalyticsSummaryGrid from "./AnalyticsSummaryGrid";
import AnalyticsSectionGrid from "./AnalyticsSectionGrid";
import AnalyticsEmptyState from "./AnalyticsEmptyState";
import AnalyticsErrorState from "./AnalyticsErrorState";
import AnalyticsInsightsCard from "./AnalyticsInsightsCard";
import TopProdutosRanking from "./TopProdutosRanking";
import { buildAnalyticsInsights } from "./AnalyticsInsights";
import { hasAnalyticsData, normalizeAnalyticsData, mapTopProdutos } from "./AnalyticsUtils";

const API_URL = import.meta.env.VITE_API_URL;

export default function DashboardAnalytics({ empresaId, isDark = true }) {
  const [dados, setDados] = useState(normalizeAnalyticsData({}));
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const insights = useMemo(() => buildAnalyticsInsights(dados), [dados]);
  const topProdutosRanking = useMemo(
    () => mapTopProdutos(dados?.topProdutos || []),
    [dados]
  );

  const fetchAnalytics = useCallback(async () => {
    if (!empresaId) {
      setDados(normalizeAnalyticsData({}));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/empresas/${empresaId}/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Não foi possível carregar as métricas.");
      }

      const data = await res.json();
      setDados(normalizeAnalyticsData(data));
      setUltimaAtualizacao(new Date());
    } catch (err) {
      console.error("Erro analytics:", err);
      setErro("Não foi possível carregar o dashboard no momento.");
      setDados(normalizeAnalyticsData({}));
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const possuiDados = useMemo(() => hasAnalyticsData(dados), [dados]);

  return (
    <section className="space-y-6">
      <AnalyticsHeader
        loading={loading}
        erro={erro}
        ultimaAtualizacao={ultimaAtualizacao}
        onRefresh={fetchAnalytics}
        empresaId={empresaId}
        isDark={isDark}
      />

      <AnalyticsErrorState message={erro} isDark={isDark} />

      <AnalyticsSummaryGrid dados={dados} loading={loading} isDark={isDark} />

      {!loading && !erro && possuiDados ? (
        <>
          <AnalyticsInsightsCard insights={insights} isDark={isDark} />
          <TopProdutosRanking produtos={topProdutosRanking} isDark={isDark} />
        </>
      ) : null}

      {!loading && !erro && !possuiDados ? (
        <AnalyticsEmptyState isDark={isDark} />
      ) : null}

      {!erro && possuiDados ? (
        <AnalyticsSectionGrid dados={dados} loading={loading} isDark={isDark} />
      ) : null}
    </section>
  );
}