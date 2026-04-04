const EnderecoInfo = ({ endereco }) => {
  if (!endereco) return <span className="text-gray-400">Sem endereço</span>;

  return (
    <div className="text-sm leading-snug">
      <p>{endereco.logradouro}, {endereco.numero}, {endereco.complemento}</p>
      <p>{endereco.bairro} - {endereco.cidade}/{endereco.estado}</p>
      <p>CEP: {endereco.cep}</p>
    </div>
  );
};

export default EnderecoInfo;
