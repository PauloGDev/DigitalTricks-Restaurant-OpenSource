export function getTempoEmMinutos(data) {
  if (!data) return 0;
  const agora = new Date();
  const criadoEm = new Date(data);
  const diffMs = agora - criadoEm;
  if (Number.isNaN(diffMs) || diffMs < 0) return 0;
  return Math.floor(diffMs / 60000);
}

export function isPedidoAtivo(pedido) {
  return !["ENTREGUE", "CANCELADO"].includes(pedido?.status);
}

export function isPedidoAtencao(pedido) {
  return isPedidoAtivo(pedido) && getTempoEmMinutos(pedido?.data) >= 35;
}

export function isPedidoMuitoAtrasado(pedido) {
  return isPedidoAtivo(pedido) && getTempoEmMinutos(pedido?.data) >= 50;
}

export function isToday(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}