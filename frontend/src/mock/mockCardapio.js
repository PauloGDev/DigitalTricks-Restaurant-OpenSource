// src/mock/mockCardapio.js

// Categorias fictícias
export const MOCK_CATEGORIAS = [
  "Pizzas Tradicionais",
  "Pizzas Especiais",
  "Burgers",
  "Porções",
  "Bebidas",
  "Sobremesas",
];

// Produtos fictícios (id, slug, nome, categoria, preco, descricao, imagem...)
export const MOCK_PRODUTOS = [
  // Pizzas Tradicionais
  {
    id: 1,
    slug: "pizza-mussarela",
    nome: "Pizza Mussarela",
    categoria: "Pizzas Tradicionais",
    preco: 39.9,
    descricao: "Mussarela, molho da casa e orégano.",
    imagem: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 2,
    slug: "pizza-calabresa",
    nome: "Pizza Calabresa",
    categoria: "Pizzas Tradicionais",
    preco: 42.9,
    descricao: "Calabresa fatiada, cebola e azeitonas.",
    imagem: "https://images.unsplash.com/photo-1601924638867-3ec6f0b5c14c?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 3,
    slug: "pizza-margherita",
    nome: "Pizza Margherita",
    categoria: "Pizzas Tradicionais",
    preco: 44.9,
    descricao: "Mussarela, tomate e manjericão.",
    imagem: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },

  // Pizzas Especiais
  {
    id: 4,
    slug: "pizza-frango-catupiry",
    nome: "Pizza Frango com Catupiry",
    categoria: "Pizzas Especiais",
    preco: 49.9,
    descricao: "Frango desfiado e catupiry cremoso.",
    imagem: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 5,
    slug: "pizza-quatro-queijos",
    nome: "Pizza Quatro Queijos",
    categoria: "Pizzas Especiais",
    preco: 52.9,
    descricao: "Blend de queijos, finalizada com parmesão.",
    imagem: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },
  {
    id: 6,
    slug: "pizza-pepperoni",
    nome: "Pizza Pepperoni",
    categoria: "Pizzas Especiais",
    preco: 54.9,
    descricao: "Pepperoni, mussarela e molho encorpado.",
    imagem: "https://images.unsplash.com/photo-1593560708920-61dd98c46a9b?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },

  // Burgers
  {
    id: 7,
    slug: "burger-classico",
    nome: "Burger Clássico",
    categoria: "Burgers",
    preco: 26.9,
    descricao: "Carne 120g, queijo, alface, tomate e molho.",
    imagem: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 8,
    slug: "burger-bacon",
    nome: "Burger Bacon",
    categoria: "Burgers",
    preco: 29.9,
    descricao: "Carne 120g, queijo, bacon crocante e molho.",
    imagem: "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },

  // Porções
  {
    id: 9,
    slug: "batata-frita",
    nome: "Batata Frita",
    categoria: "Porções",
    preco: 18.9,
    descricao: "Porção de batata crocante com sal.",
    imagem: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 10,
    slug: "aneis-cebola",
    nome: "Anéis de Cebola",
    categoria: "Porções",
    preco: 21.9,
    descricao: "Anéis empanados e crocantes.",
    imagem: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },

  // Bebidas
  {
    id: 11,
    slug: "refrigerante-lata",
    nome: "Refrigerante (Lata)",
    categoria: "Bebidas",
    preco: 6.5,
    descricao: "350ml (sabores variados).",
    imagem: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
  {
    id: 12,
    slug: "agua-sem-gas",
    nome: "Água sem gás",
    categoria: "Bebidas",
    preco: 4.5,
    descricao: "500ml.",
    imagem: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },

  // Sobremesas
  {
    id: 13,
    slug: "brownie",
    nome: "Brownie",
    categoria: "Sobremesas",
    preco: 12.9,
    descricao: "Brownie de chocolate com calda.",
    imagem: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=60",
    maisVendido: false,
  },
  {
    id: 14,
    slug: "pudim",
    nome: "Pudim",
    categoria: "Sobremesas",
    preco: 11.9,
    descricao: "Pudim tradicional com caramelo.",
    imagem: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=900&q=60",
    maisVendido: true,
  },
].map((p) => ({
  ...p,

  // ✅ o ProdutoCard usa esses campos:
  ativo: p.ativo ?? true,
  estoque: typeof p.estoque === "number" ? p.estoque : 50,     // qualquer > 0
  precoBase: typeof p.precoBase === "number" ? p.precoBase : p.preco, // usa "preco" do mock
  imagemUrl: p.imagemUrl ?? p.imagem,                           // usa "imagem" do mock

  // garante variacoes como array (evita undefined)
  variacoes: Array.isArray(p.variacoes) ? p.variacoes : [],
}));

// Utilitário: simula seu endpoint /produtos/listarFiltroShop
export function mockListarFiltroShop({
  page = 0,
  size = 12,
  categoria, // "A,B,C"
  search = "",
  ordenarPor = "maisVendidos",
}) {
  let items = [...MOCK_PRODUTOS];

  // filtro por categoria
  if (categoria) {
    const cats = categoria.split(",").map((s) => s.trim());
    items = items.filter((p) => cats.includes(p.categoria));
  }

  // busca (nome + descricao)
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (p) =>
        (p.nome || "").toLowerCase().includes(q) ||
        (p.descricao || "").toLowerCase().includes(q)
    );
  }

  // ordenação
  if (ordenarPor === "maisVendidos") {
    items.sort((a, b) => Number(b.maisVendido) - Number(a.maisVendido));
  } else if (ordenarPor === "menorPreco") {
    items.sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
  } else if (ordenarPor === "maiorPreco") {
    items.sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
  } else if (ordenarPor === "maisRecentes") {
    // como é mock, usa id desc como "mais recente"
    items.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
  }

  const totalProdutos = items.length;
  const totalPaginas = Math.max(1, Math.ceil(totalProdutos / size));
  const start = page * size;
  const end = start + size;
  const produtos = items.slice(start, end);

  // formato igual seu backend
  return {
    produtos,
    totalPaginas,
    totalProdutos,
  };
}