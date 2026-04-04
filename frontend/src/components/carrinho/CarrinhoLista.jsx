import CarrinhoItem from "./CarrinhoItem";

const CarrinhoLista = ({ itens, fadeUp, incrementar, decrementar, remover }) => {
  return (
    <div className="space-y-4 pt-8">
      {itens.map((item, i) => (
        <CarrinhoItem
          key={item.produtoId}
          item={item}
          i={i}
          fadeUp={fadeUp}
          incrementar={incrementar}
          decrementar={decrementar}
          remover={remover}
        />
      ))}
    </div>
  );
};

export default CarrinhoLista;
