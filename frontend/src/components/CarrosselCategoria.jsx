// src/components/CarrosselCategoriaSwiper.jsx
import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Mousewheel } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const CarrosselCategoria = ({ categoria, title }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [produtos, setProdutos] = useState([]);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  // Busca produtos do backend
 useEffect(() => {
  const fetchProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token && token !== "null" && token !== "undefined" && token.length > 10) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.get(`${API_URL}/produtos/mais-vendidos`, {
        params: { categoria: categoria, limit: 10 },
        headers,
      });

      setProdutos(res.data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };
  fetchProdutos();
}, [categoria]);


  // Configura botões de navegação
  useEffect(() => {
    if (!swiperRef.current) return;
    const swiper = swiperRef.current;
    swiper.params.navigation.prevEl = prevRef.current;
    swiper.params.navigation.nextEl = nextRef.current;
    if (swiper.navigation) {
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  if (!produtos.length) return null;

  return (
    <section className="px-4 sm:px-8 lg:px-16 py-8">
      <div className="max-w-7xl mx-auto relative">
        {/* título + botões */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {title || categoria}
          </h3>
          <div className="flex gap-2">
            <button
              ref={prevRef}
              aria-label="Anterior"
              className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md hover:opacity-90"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <button
              ref={nextRef}
              aria-label="Próximo"
              className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-md hover:opacity-90"
            >
              <ChevronRight className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* Swiper com produtos */}
        <Swiper
          modules={[Navigation, Mousewheel]}
          onSwiper={(s) => (swiperRef.current = s)}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          mousewheel={{ forceToAxis: true }}
          spaceBetween={16}
          slidesPerView={"auto"}
          centeredSlides={true}
          breakpoints={{
            640: { slidesPerView: "auto", centeredSlides: false, spaceBetween: 16 },
            1024: { slidesPerView: "auto", centeredSlides: false, spaceBetween: 20 },
          }}
          className="py-2 max-w-[80vw]"
        >
          {produtos.map((p) => (
            <SwiperSlide
              key={p.id}
              className="
                h-auto
                !w-[170px]
                sm:!w-[200px]
                md:!w-[220px]
                lg:!w-[260px]
                xl:!w-[300px]
              "
            >
              <ProductCard product={p} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-900 shadow-lg h-full flex flex-col">
      <Link to={`/produtos/${product.slug}`} className="flex flex-col h-full">
        <div className="aspect-[4/5] flex items-center justify-center bg-gray-800 p-4">
          <img
            src={product.imagemUrl}
            alt={product.nome}
            className="object-contain max-h-[320px]"
            draggable={false}
          />
        </div>

        <div className="p-4 text-center flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-white font-semibold leading-tight line-clamp-2">
              {product.nome}
            </h4>
            <p className="text-amber-400 mt-2 font-bold">
              {formatStartingPrice(product)}
            </p>
          </div>

          {product.variacoes?.length > 0 && (
            <div className="mt-2 text-xs text-gray-300">
              {product.variacoes.map((v) => v.nome).join(" • ")}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

// helpers
function formatStartingPrice(product) {
  if (!product.variacoes?.length) return `R$ ${product.precoBase?.toFixed(2)}`;
  const nums = product.variacoes
    .map((v) => parseFloat(v.preco))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return `R$ ${product.precoBase?.toFixed(2)}`;
  const min = Math.min(...nums);
  return `A partir de R$ ${min.toFixed(2).replace(".", ",")}`;
}

export default CarrosselCategoria;
