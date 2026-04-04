import { assets } from "./assets";
import { slugify } from "../utils/slugify";

export const produtos = [
  {
    id: 1,
    nome: "Bleu de Chanel EDP",
    categorias: ["Masculino"],
    imagens: [assets.bleu_de_chanel, assets.bleu_de_chanel2],
    destaque: true,
    descricao:
      "Fragrância sofisticada e versátil, fresca e amadeirada. Perfeita para uso diário e para todas as ocasiões.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 37,00" },
      { volume: "5mL", preco: "R$ 87,00" },
      { volume: "10mL", preco: "R$ 167,00" },
    ],
  },
  {
    id: 2,
    nome: "Versace Eros EDP",
    categorias: ["Masculino"],
    imagens: [assets.versace_eros],
    destaque: true,
    descricao:
      "Um perfume vibrante e intenso, com notas frescas e amadeiradas, ideal para homens confiantes e ousados.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 24,00" },
      { volume: "5mL", preco: "R$ 47,00" },
      { volume: "10mL", preco: "R$ 91,00" },
    ],
  },
  {
    id: 3,
    nome: "Dior Sauvage EDP",
    categorias: ["Masculino", "Árabe", "Feminino"],
    imagens: [assets.dior_sauvage],
    destaque: true,
    descricao:
      "Uma fragrância fresca e intensa, com notas cítricas e amadeiradas. Ideal para ocasiões marcantes.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 30,09" },
      { volume: "5mL", preco: "R$ 72,00" },
      { volume: "10mL", preco: "R$ 140,00" },
    ],
  },
  {
    id: 4,
    nome: "Armani Acqua di Gio",
    categorias: ["Masculino", "Feminino"],
    imagens: [assets.acqua_di_gio],
    destaque: false,
    descricao:
      "Um clássico fresco e aquático, perfeito para o dia a dia e climas mais quentes.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 22,00" },
      { volume: "5mL", preco: "R$ 50,00" },
      { volume: "10mL", preco: "R$ 88,00" },
    ],
  },
  {
    id: 5,
    nome: "Jean Paul Gaultier - Le Male",
    categorias: ["Masculino", "Árabe", "Feminino"],
    imagens: [assets.le_male],
    destaque: false,
    descricao:
      "Ícone da perfumaria masculina, com notas doces, aromáticas e amadeiradas.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 22,00" },
      { volume: "5mL", preco: "R$ 48,00" },
      { volume: "10mL", preco: "R$ 95,00" },
    ],
  },
  {
    id: 6,
    nome: "Paco Rabanne - 1 Million",
    categorias: ["Masculino", "Feminino"],
    imagens: [assets.one_million],
    destaque: false,
    descricao:
      "Fragrância intensa e envolvente, símbolo de luxo e ousadia masculina.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 22,00" },
      { volume: "5mL", preco: "R$ 50,00" },
      { volume: "10mL", preco: "R$ 97,00" },
    ],
  },
  {
    id: 7,
    nome: "Jean Paul Gaultier - Le Beau",
    categorias: ["Masculino", "Árabe", "Feminino"],
    imagens: [assets.le_beau],
    destaque: false,
    descricao:
      "Fragrância refrescante e sensual, com notas tropicais e amadeiradas.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 21,00" },
      { volume: "5mL", preco: "R$ 47,00" },
      { volume: "10mL", preco: "R$ 82,00" },
    ],
  },
  {
    id: 8,
    nome: "Montblanc Explorer",
    categorias: ["Masculino", "Árabe", "Feminino"],
    imagens: [assets.montblanc_explorer],
    destaque: false,
    descricao:
      "Perfume aventureiro, amadeirado e sofisticado, perfeito para exploradores modernos.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 20,00" },
      { volume: "5mL", preco: "R$ 42,00" },
      { volume: "10mL", preco: "R$ 79,00" },
    ],
  },
  {
    id: 9,
    nome: "Hugo Boss Bottled Parfum",
    categorias: ["Masculino", "Árabe", "Feminino"],
    imagens: [assets.hugo_boss_bottled],
    destaque: false,
    descricao:
      "Uma fragrância elegante, amadeirada e intensa, que transmite poder e sofisticação.",
    tamanhos: [
      { volume: "2mL", preco: "R$ 20,00" },
      { volume: "5mL", preco: "R$ 41,00" },
      { volume: "10mL", preco: "R$ 78,00" },
    ],
  },
].map((p) => ({
  ...p,
  slug: slugify(p.nome), // ✅ slug automático
}));
