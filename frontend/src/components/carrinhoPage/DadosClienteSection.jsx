import DadosClienteForm from "../../components/carrinho/DadosClienteForm";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

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
      fadeUp={fadeUp}
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
