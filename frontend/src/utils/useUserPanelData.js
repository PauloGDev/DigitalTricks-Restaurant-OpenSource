import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPermissions, getPrimaryRole } from "./userPanelAcl";

export function useUserPanelData() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [perfil, setPerfil] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [usuariosEmpresa, setUsuariosEmpresa] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const roles = user?.roles || [];
  const role = getPrimaryRole(roles);
  const permissions = useMemo(() => getPermissions(roles), [roles]);

  const token = localStorage.getItem("token");

  const API_URL_RAW = import.meta.env.VITE_API_URL || "";
  const base = API_URL_RAW.replace(/\/$/, "");
  const API_URL = base.endsWith("/api") ? base : `${base}/api`;

  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);

    if (res.status === 401) {
      logout();
      navigate("/login");
      return null;
    }

    if (res.status === 403) {
      throw new Error("Acesso negado");
    }

    if (!res.ok) {
      let msg = "Erro";
      try {
        const text = await res.text();
        if (text) msg = text;
      } catch {}
      throw new Error(msg);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    return res.json();
  };

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const loadCliente = async () => {
    const perfilData = await fetchJson(`${API_URL}/perfis/me`, {
      headers: authHeaders,
    });

    const pedidosData = await fetchJson(`${API_URL}/pedidos/me`, {
      headers: authHeaders,
    });

    setPerfil(perfilData);
    setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
  };

  const loadRestaurante = async () => {
  const empresas = await fetchJson(`${API_URL}/empresas/minhas`, {
    headers: authHeaders,
  });

  const listaEmpresas = Array.isArray(empresas) ? empresas : [];
  const empresaAtiva =
    listaEmpresas.find(
      (e) => Number(e?.id) === Number(localStorage.getItem("empresaId") || 0)
    ) || listaEmpresas[0];

  setEmpresa(empresaAtiva || null);

  if (!empresaAtiva) return;

  localStorage.setItem("empresaId", String(empresaAtiva.id));
};

  const load = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      if (permissions.isRestaurant || permissions.isSuperAdmin) {
        await loadRestaurante();
      } else {
        await loadCliente();
      }
    } catch (err) {
      console.error("Erro ao carregar painel:", err);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, permissions.isRestaurant, permissions.isSuperAdmin]);

  useEffect(() => {
    if (role) {
      load();
    } else {
      setLoading(false);
    }
  }, [role, load]);

  return {
    loading,
    user,
    perfil,
    empresa,
    pedidos,
    usuariosEmpresa,
    analytics,
    permissions,

    actions: {
      logout,
      reload: load,
      goDashboard: () => navigate("/dashboard"),
      goPedidos: () => navigate("/meus-pedidos"),
    },
  };
}