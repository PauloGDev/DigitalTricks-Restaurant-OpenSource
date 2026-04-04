const Paginacao = ({ page, totalPages, setPage }) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
        className="px-4 py-2 rounded bg-gray-700 text-gray-200 disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-gray-300 self-center">
        Página {page + 1} de {totalPages}
      </span>
      <button
        disabled={page + 1 >= totalPages}
        onClick={() => setPage((p) => p + 1)}
        className="px-4 py-2 rounded bg-gray-700 text-gray-200 disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
};

export default Paginacao;
