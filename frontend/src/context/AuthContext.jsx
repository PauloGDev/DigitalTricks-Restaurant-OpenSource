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

    if (token) {
      const decoded = parseJwt(token);

      if (decoded && decoded.exp * 1000 > Date.now()) {
        const userData = {
          token,
          id: decoded.id,
          username: decoded.sub,
          roles: decoded.roles || [],
          empresaId: decoded.empresaId || null,
          exp: decoded.exp,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        logout();
      }
    }

    setLoadingAuth(false);
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
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);