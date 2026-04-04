import RestaurantHero from "./RestaurantHero";

export default function CardapioHeroSection({
  restaurante,
  enderecoSelecionado,
  onVerPerfil,
  onVerPedido,
  onTrocarEndereco,
}) {
  return (
    <section className="relative bg-white pb-2">
      <RestaurantHero
        restaurante={restaurante}
        endereco={enderecoSelecionado}
        onTrocarEndereco={onTrocarEndereco}
        onVerPerfil={onVerPerfil}
        onVerPedido={onVerPedido}
      />
    </section>
  );
}