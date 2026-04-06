import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoadingAuth(false);
      return;
    }

    const decoded = parseJwt(token);

    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      logout();
      setLoadingAuth(false);
      return;
    }

    // Token localmente válido — validar no backend se o usuário ainda existe
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const userData = {
      token,
      id: decoded.id,
      username: decoded.sub,
      roles: decoded.roles || [],
      empresaId: decoded.empresaId || null,
      exp: decoded.exp,
    };

    fetch(`${apiUrl}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeout);
        if (res.status === 401) {
          // Token realmente inválido no backend → limpa sessão
          logout();
        } else {
          // 500 ou outro erro do servidor → mantém sessão (backend pode estar instável)
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          if (decoded.empresaId) {
            localStorage.setItem("empresaId", String(decoded.empresaId));
          }
        }
        return null;
      })
      .catch((_err) => {
        // Erro de rede ou timeout → mantém sessão como fallback
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        if (decoded.empresaId) {
          localStorage.setItem("empresaId", String(decoded.empresaId));
        }
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);

    const decoded = parseJwt(token);

    const userData = {
      token,
      id: decoded?.id,
      username: decoded?.sub,
      roles: decoded?.roles || [],
      empresaId: decoded?.empresaId || null,
      exp: decoded?.exp,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    // Espelhar empresaId em chave própria para compatibilidade
    if (decoded?.empresaId) {
      localStorage.setItem("empresaId", String(decoded.empresaId));
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("empresaId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);