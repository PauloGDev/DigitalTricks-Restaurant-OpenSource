import DadosClienteForm from "../../components/carrinho/DadosClienteForm";

export default function DadosClienteSection({
  nomeCompleto,
  setNomeCompleto,
  cpf,
  setCpf,
  telefone,
  setTelefone,
  email,
  setEmail,
  usuarioData,
  editarTelefone,
  setEditarTelefone,
  editarEmail,
  setEditarEmail,
}) {
  return (
    <DadosClienteForm
      nomeCompleto={nomeCompleto}
      setNomeCompleto={setNomeCompleto}
      cpf={cpf}
      setCpf={setCpf}
      telefone={telefone}
      setTelefone={setTelefone}
      email={email}
      setEmail={setEmail}
      usuarioData={usuarioData}
      editarTelefone={editarTelefone}
      setEditarTelefone={setEditarTelefone}
      editarEmail={editarEmail}
      setEditarEmail={setEditarEmail}
    />
  );
}
