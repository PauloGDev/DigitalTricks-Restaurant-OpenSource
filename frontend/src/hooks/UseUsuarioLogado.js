import { useEffect, useState } from "react";

export default function useUsuarioLogado(navigate) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));

      setUsuario({
        id: decoded.id,
        telefone: decoded.sub,
        roles: decoded.roles || [],
      });
    } catch {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return { usuario };
}