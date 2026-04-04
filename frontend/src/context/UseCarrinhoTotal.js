import { useMemo } from "react";

export default function useCarrinhoTotal(carrinho, freteSelecionado) {
  const subtotal = useMemo(
    () =>
      carrinho.itens?.reduce(
        (sum, i) => sum + (i?.precoUnitario || 0) * i.quantidade,
        0
      ) || 0,
    [carrinho]
  );

  const totalComFrete = useMemo(() => {
    const valorFrete = freteSelecionado ? parseFloat(freteSelecionado.price) : 0;
    return subtotal + valorFrete;
  }, [subtotal, freteSelecionado]);

  return { subtotal, totalComFrete };
}
