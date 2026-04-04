import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const SecoesProdutos = ({ onConteudoPronto }) => {
  const [categorias, setCategorias] = useState([]);
  const [produtosDestaque, setProdutosDestaque] = useState({});
  const [carregado, setCarregado] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API_URL}/categorias`);
        const data = await res.json();

        const categoriasComVisuais = data.map((cat) => {
          let fundo = assets.fundo4;
          let img = assets.masculino;
          switch (cat.nome) {
            case "Masculinos":
              fundo = assets.fundo3;
              break;
            case "Femininos":
              fundo = assets.fundo2;
              break;
            case "Árabes":
              fundo = assets.fundo;
              break;
            case "Importado":
              fundo = assets.fundo3;
              break;
          }
          switch (cat.nome) {
            case "Masculinos":
              img = `${assets.masculino}`;
              break;
            case "Femininos":
              img = `${assets.feminino}`;
              break;
            case "Árabes":
              img = `${assets.arabe}`;
              break;
          }

          return {
            ...cat,
            titulo:
              cat.nome === "Masculino"
                ? "Perfumes Masculinos"
                : cat.nome === "Feminino"
                ? "Perfumes Femininos"
                : cat.nome === "Árabe"
                ? "Perfumes Árabes"
                : `Linha ${cat.nome}`,
            descricao:
              cat.nome === "Masculino"
                ? "Fragrâncias marcantes que traduzem força e sofisticação."
                : cat.nome === "Feminino"
                ? "Elegância e delicadeza em essências inesquecíveis."
                : cat.nome === "Árabe"
                ? "Intensidade em fragrâncias exclusivas."
                : "Descubra fragrâncias únicas dessa categoria.",
            fundo,
            img,
          };
        });

        setCategorias(categoriasComVisuais);

        // 🔹 Buscar produtos destaque de todas as categorias em paralelo
        const promessas = categoriasComVisuais.map(async (cat) => {
          try {
            const resp = await fetch(
              `${API_URL}/produtos/destaque-por-categoria?categoria=${encodeURIComponent(
                cat.nome
              )}`
            );
            if (resp.ok) {
              const produto = await resp.json();
              return { nome: cat.nome, produto };
            }
          } catch (err) {
            console.error(`Erro ao buscar destaque de ${cat.nome}:`, err);
          }
        });

        const resultados = await Promise.all(promessas);
        const mapa = resultados.reduce((acc, item) => {
          if (item) acc[item.nome] = item.produto;
          return acc;
        }, {});

        setProdutosDestaque(mapa);
        setCarregado(true);
      } catch (err) {
        console.error("Erro ao carregar categorias:", err);
      }
    };

    fetchCategorias();
  }, []);

  // 🔔 Quando terminar tudo, avisa o App
  useEffect(() => {
    if (carregado && Object.keys(produtosDestaque).length > 0) {
      onConteudoPronto?.(); // chama a função se foi passada
    }
  }, [carregado, produtosDestaque]);

  return (
    <section className="w-full space-y-14 sm:space-y-20 lg:space-y-28 px-4 sm:px-6 md:px-10 lg:px-20">
      {categorias.map((cat, index) => {
        const produtoDestaque = produtosDestaque[cat.nome];
        if (!produtoDestaque) return null;

        const invertido = index % 2 !== 0;

        return (
          <motion.div
            key={cat.id || cat.nome}
            className={`relative flex flex-col ${
              invertido ? "lg:flex-row-reverse" : "lg:flex-row"
            } items-center gap-8 sm:gap-10 lg:gap-16 py-10 sm:py-14 lg:py-20 rounded-2xl overflow-hidden`}
            style={{
              backgroundImage: `url(${cat.fundo})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-black/55" />

            {/* Texto */}
            <motion.div
              className={`relative flex-1 flex flex-col justify-center text-center lg:text-left px-3 sm:px-6 lg:px-10 ${
                invertido ? "lg:items-end" : ""
              }`}
              initial={{ x: invertido ? 80 : -80, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 sm:mb-4 max-w-[20ch]">
                {cat.titulo}
              </h2>
              <p className="text-gray-200 text-base sm:text-lg md:text-xl lg:text-2xl mb-6 max-w-[56ch] mx-auto lg:mx-0">
                {cat.descricao}
              </p>

              <Link
                to={`/produtos?categoria=${encodeURIComponent(cat.nome)}`}
                className={`text-center inline-block px-6 sm:px-8 py-3 rounded-full font-medium shadow-lg bg-amber-400 text-black hover:text-gray-400 hover:bg-gray-900 transition w-full md:w-1/2 sm:w-auto ${
                  invertido ? "lg:mr-0" : "lg:ml-0"
                }`}
              >
                Ver Produtos
              </Link>
            </motion.div>

            {/* Imagem */}
            <motion.div
              className="relative flex-1 flex items-center justify-center px-4"
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <img
                src={cat.img}
                alt={produtoDestaque.nome}
                draggable={false}
                loading="lazy"
                className="w-[90%] sm:w-[70%] lg:w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-2xl object-cover drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </motion.div>
        );
      })}
    </section>
  );
};

export default SecoesProdutos;
