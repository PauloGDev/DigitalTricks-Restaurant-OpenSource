import api from "../context/api"; // sua instância axios com baseURL configurada

export const finalizarCompra = async (usuarioId) => {
  const { data } = await api.post(`/checkout/${usuarioId}`);
  return data;
};
