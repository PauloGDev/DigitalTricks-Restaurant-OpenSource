// src/hooks/useCarrinho.js
import { useState, useEffect } from "react";

const API = "http://localhost:8080/api/carrinho";

// monta headers sempre que precisar
const defaultOptions = (method = "GET") => ({
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export function useCarrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const [carrinhoId, setCarrinhoId] = useState(
    localStorage.getItem("carrinhoId") || null
  );
  const [loading, setLoading] = useState(true);

  // Criar carrinho no backend
  const criarCarrinho = async () => {
    try {
      const res = await fetch(API, defaultOptions("POST"));
      if (!res.ok) throw new Error("Erro ao criar carrinho");
      const data = await res.json();

      localStorage.setItem("carrinhoId", data.id);
      setCarrinhoId(data.id);
      setCarrinho(data);
    } catch (err) {
      console.error("Erro ao criar carrinho:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar carrinho do backend
  const fetchCarrinho = async (id = carrinhoId) => {
    if (!id) return criarCarrinho();
    try {
      const res = await fetch(`${API}/${id}`, defaultOptions("GET"));
      if (!res.ok) throw new Error("Erro ao buscar carrinho");
      const data = await res.json();
      setCarrinho(data);
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
      criarCarrinho();
    } finally {
      setLoading(false);
    }
  };

  // Adicionar item
  const adicionarItem = async (produtoId, quantidade = 1) => {
    if (!carrinhoId) return criarCarrinho();
    try {
      const res = await fetch(
        `${API}/${carrinhoId}/adicionar/${produtoId}?quantidade=${quantidade}`,
        defaultOptions("POST")
      );
      if (res.ok) fetchCarrinho(carrinhoId);
    } catch (err) {
      console.error("Erro ao adicionar item:", err);
    }
  };

  // Remover item
  const removerItem = async (produtoId) => {
    if (!carrinhoId) return;
    try {
      const res = await fetch(
        `${API}/${carrinhoId}/remover/${produtoId}`,
        defaultOptions("DELETE")
      );
      if (res.ok) fetchCarrinho(carrinhoId);
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

// Finalizar compra
const finalizarCompra = async (usuarioId) => {
  if (!carrinhoId) return;
  try {
    const res = await fetch(
      `http://localhost:8080/api/checkout/${usuarioId}`,
      defaultOptions("POST")
    );
    if (!res.ok) throw new Error("Erro ao finalizar compra");
    const data = await res.json();
    return data; // pedido retornado
  } catch (err) {
    console.error("Erro ao finalizar compra:", err);
    throw err;
  }
};

  // Executa ao montar
  useEffect(() => {
    fetchCarrinho();
  }, []);

  return { carrinho, carrinhoId, loading, adicionarItem, removerItem, finalizarCompra  };
}
