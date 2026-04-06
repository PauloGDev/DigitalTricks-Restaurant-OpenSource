import PageTitle from "../context/PageTitle";
import PricingCard from "../components/home/PricingCard";
import FAQItem from "../components/home/FAQItem";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  LayoutGrid,
  MapPin,
  QrCode,
  ReceiptText,
  ShoppingCart,
  Store,
  TrendingUp,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

const Home = () => {
  /* ------------------------------------------------------------------ */
  /*  HERO: mockup cards para o lado direito                             */
  /* ------------------------------------------------------------------ */

  const kanbanPreview = [
    { col: "Recebido", count: 3, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { col: "Em preparo", count: 2, color: "text-orange-400", bg: "bg-orange-400/10" },
    { col: "Pronto", count: 1, color: "text-blue-400", bg: "bg-blue-400/10" },
    { col: "Entregue", count: 8, color: "text-green-400", bg: "bg-green-400/10" },
  ];

  const dashboardMetrics = [
    { label: "Faturamento", value: "R$ 12.480", delta: "+18%" },
    { label: "Ticket médio", value: "R$ 67,90", delta: "+5%" },
    { label: "Pedidos hoje", value: "42", delta: "+12" },
    { label: "Avaliação", value: "4.8", delta: "+0.2" },
  ];

  /* ------------------------------------------------------------------ */
  /*  LOGOS / TIPOS DE RESTAURANTE                                      */
  /* ------------------------------------------------------------------ */

  const restaurantTypes = [
    { icon: UtensilsCrossed, label: "Pizzarias" },
    { icon: ShoppingCart, label: "Hamburguerias" },
    { icon: MapPin, label: "Confeitarias" },
    { icon: Clock, label: "Lanchonetes" },
    { icon: Store, label: "Dark Kitchens" },
    { icon: MapPin, label: "Food Trucks" },
    { icon: Clock, label: "Sushi Bars" },
    { icon: Store, label: "Cafés" },
  ];

  /* ------------------------------------------------------------------ */
  /*  FEATURES DETALHADAS                                               */
  /* ------------------------------------------------------------------ */

  const features = [
    {
      icon: LayoutGrid,
      label: "Cardápio digital",
      title: "Seu cardápio online em minutos",
      desc: "Monte categorias, variações, adicionais e observações. Fotos, descrições e preços atualizados em tempo real. Seu cliente navega e pede sem ligar, sem app, sem complicação.",
      points: [
        "Variações e opcionais configuráveis",
        "Ofertas com desconto temporário",
        "Busca e filtro por categoria",
        "Fotos e descrições profissionais",
      ],
    },
    {
      icon: CreditCard,
      label: "Checkout completo",
      title: "PIX, cartão e boleto sem sair",
      desc: "Seu cliente pede e paga na mesma experiência. Mercado Pago integrado com PIX instantâneo, cartão em até 12x e boleto. O restaurante recebe direto.",
      points: [
        "PIX com QR code em tempo real",
        "Cartão com token seguro",
        "Boleto para pedidos antecipados",
        "Pagamento na entrega (dinheiro/cartão)",
      ],
    },
    {
      icon: ReceiptText,
      label: "Painel Kanban",
      title: "Organize pedidos arrastando cards",
      desc: "Recebido, preparo, pronto, entrega, entregue. Controle visual sem papel, sem gritaria, sem confusão. Arraste entre colunas ou pule etapas com confirmação.",
      points: [
        "4 colunas visuais com drag-and-drop",
        "Notificação via WebSocket em tempo real",
        "Modo TV para cozinha",
        "Histórico completo de transições",
      ],
    },
    {
      icon: BarChart3,
      label: "Analytics",
      title: "Números que a gente mostra",
      desc: "Faturamento, ticket médio, produtos mais vendidos, taxa de cancelamento, retenção de clientes e comparação entre períodos. Tudo visual.",
      points: [
        "Receita por dia e por hora",
        "Top 5 produtos e ranking por receita",
        "Taxa de retenção e novos vs recorrentes",
        "Comparativo 7 dias atuais vs 7 anteriores",
      ],
    },
    {
      icon: Bot,
      label: "WhatsApp bot",
      title: "Atendimento automático 24/7",
      desc: "Seu cliente consulta pedido, tira dúvidas e fala com atendente via WhatsApp. Sem custo adicional, integrado com os pedidos do dia.",
      points: [
        "Consulta automática de pedido",
        "Menu interativo por texto",
        "Redireciona para atendente humano",
        "Vinculado por número da Meta API",
      ],
    },
    {
      icon: QrCode,
      label: "QR Code",
      title: "Atendimento presencial com código",
      desc: "Imprima QR codes por mesa. Seu cliente escaneia, vê o cardápio e pede na hora. Perfeito para salão, balcão e retirada.",
      points: [
        "Geração de QR code por mesa",
        "Link direto para o cardápio",
        "Ideal para salão e auto-atendimento",
        "Sem necessidade de tablet ou celular",
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  COMPARATIVO                                                        */
  /* ------------------------------------------------------------------ */

  const comparisonRows = [
    { feature: "Comissão sobre pedidos", gest: "0%", others: "12% – 27% por pedido" },
    { feature: "Dados dos clientes", gest: "Seus para sempre", others: "Da plataforma" },
    { feature: "Personalização", gest: "Sua marca, sua cara", others: "Template genérico" },
    { feature: "Taxa de adesão", gest: "Grátis", others: "Até R$ 500" },
    { feature: "Suporte", gest: "Direto com a equipe", others: "Call center impessoal" },
    { feature: "Seu preço, sua regra", gest: "Você decide", others: "A plataforma decide" },
  ];

  /* ------------------------------------------------------------------ */
  /*  PLANOS                                                             */
  /* ------------------------------------------------------------------ */

  const plans = [
    {
      name: "Inicial",
      price: "R$ 97",
      period: "/mês",
      highlight: false,
      description: "Ideal para começar a vender online com seu canal próprio.",
      features: [
        "Página própria do restaurante",
        "Cardápio digital completo",
        "Categorias, variações e adicionais",
        "Checkout com PIX",
        "Até 100 pedidos por mês",
        "Painel de gestão básico",
        "Suporte por email",
      ],
    },
    {
      name: "Profissional",
      price: "R$ 197",
      period: "/mês",
      highlight: true,
      description: "Para restaurantes que querem vender mais e operar com eficiência.",
      features: [
        "Tudo do plano Inicial",
        "PIX + Cartão de crédito",
        "Kanban de pedidos em tempo real",
        "Dashboard com métricas avançadas",
        "Cupons de desconto",
        "Até 500 pedidos por mês",
        "Até 5 usuários na equipe",
        "QR Code para mesas",
        "Suporte por email e chat",
      ],
    },
    {
      name: "Empresarial",
      price: "R$ 397",
      period: "/mês",
      highlight: false,
      description: "Para operações com múltiplas unidades e necessidades avançadas.",
      features: [
        "Tudo do plano Profissional",
        "PIX + Cartão + Boleto",
        "Pedidos ilimitados",
        "WhatsApp bot integrado",
        "Cupons com regras avançadas",
        "Até 5 unidades (R$ 50/unid. extra)",
        "Usuários ilimitados na equipe",
        "Domínio personalizado",
        "KDS multi-estação",
        "Suporte prioritário dedicado",
        "Onboarding assistido",
      ],
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  FAQ                                                                */
  /* ------------------------------------------------------------------ */

  const faqs = [
    {
      q: "Preciso baixar aplicativo para usar a Geste?",
      a: "Não. A Geste funciona por link, direto no navegador. Seu cliente acessa pelo celular, sem baixar nada. É mais leve, mais rápido e sem fricção — abre com um toque.",
    },
    {
      q: "Quanto outros marketplace cobram em média por pedido?",
      a: "Marketplaces cobram de 12% a 27% de comissão sobre cada pedido. A Geste não cobra comissão. Você paga um plano fixo mensal e fica com 100% do faturamento dos seus pedidos.",
    },
    {
      q: "Posso personalizar meu cardápio e minha marca?",
      a: "Sim. Você configura categorias, produtos, variações, adicionais, fotos, descrições e preços. Seu cardápio é exibido na sua página própria com a identidade do seu restaurante.",
    },
    {
      q: "Como funciona o pagamento do meu cliente?",
      a: "Seu cliente pode pagar por PIX (com QR code na hora), cartão de crédito (processado via Mercado Pago), boleto ou mesmo na entrega (dinheiro ou cartão). Tudo integrado na plataforma.",
    },
    {
      q: "A Geste serve só para delivery?",
      a: "Não. Ela funciona para delivery, retirada no balcão, atendimento presencial com QR Code nas mesas e até salão. Você escolhe o modelo que faz sentido pro seu restaurante.",
    },
    {
      q: "Posso começar pequeno e depois evoluir?",
      a: "Sim. A estrutura foi pensada para começar de forma simples e evoluir conforme o restaurante cresce. Você pode trocar de plano e acessar mais recursos a qualquer momento.",
    },
    {
      q: "Existe um período de teste gratuito?",
      a: "Sim. Oferecemos 14 dias de teste grátis no plano Profissional — sem compromisso, sem cartão. É tempo suficiente para montar o cardápio, configurar o painel e receber pedidos.",
    },
  ];

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <PageTitle title="Geste | Sistema de gestão para restaurantes" />

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-[#1A1A1A] text-white border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,37,42,0.18),transparent_35%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-[0.12em]">
                <Store className="h-4 w-4 text-[#E5252A]" />
                Sistema para restaurantes
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Seu{" "}
                <span className="text-[#E5252A]">canal próprio</span>
                {" "}de vendas, pedidos e gestão
              </h1>

              <p className="mt-5 text-base sm:text-lg text-white/70 leading-8 max-w-2xl">
                Cardápio digital, checkout com pagamento, painel Kanban em tempo
                real, dashboard de vendas, WhatsApp e muito mais — tudo em uma
                plataforma moderna, sem app e sem comissão por pedido.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white font-semibold hover:shadow-[0_14px_35px_rgba(229,37,42,0.28)] transition-all text-base"
                >
                  Comece grátis por 14 dias
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all text-base"
                >
                  Acessar painel
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-400" /> Sem cartão
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-400" /> Sem app
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-400" /> Sem comissão
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-400" /> Cancele quando quiser
                </span>
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="relative">
              <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="rounded-[28px] bg-[#111111] border border-white/10 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">Painel Geste</p>
                      <p className="text-xs text-white/50">Dashboard de vendas</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-400/15 text-green-400 text-xs font-semibold border border-green-400/20">
                      Hoje
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {dashboardMetrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <p className="text-white/50 text-[11px] uppercase tracking-wide font-medium">
                          {m.label}
                        </p>
                        <p className="mt-1 text-white text-lg font-extrabold">
                          {m.value}
                        </p>
                        <p className="text-green-400 text-xs font-semibold mt-0.5">
                          {m.delta}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide">
                        Pedidos por status
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {kanbanPreview.map((k) => (
                        <div
                          key={k.col}
                          className={`flex-1 rounded-xl ${k.bg} border border-white/5 p-2 text-center`}
                        >
                          <p className={`text-lg font-extrabold ${k.color}`}>
                            {k.count}
                          </p>
                          <p className="text-white/40 text-[10px]">{k.col}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF: tipos de restaurante ==================== */}
      <section className="bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-400 font-semibold text-center mb-6">
            Para qualquer tipo de restaurante
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {restaurantTypes.map((r) => (
              <span
                key={r.label}
                className="flex items-center gap-2 text-sm text-zinc-500"
              >
                <r.icon className="h-4 w-4 text-zinc-400" />
                {r.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">

        {/* ==================== COMPARATIVO ==================== */}
        <section id="comparativo" className="pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
              Por que ter canal próprio
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Pare de pagar comissão sobre{" "}
              <span className="text-[#E5252A]">suas próprias vendas</span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-7">
              Marketplaces cobram até 27% por pedido. Com a Geste, você tem sua
              página própria, seu checkout, seus dados — e fica com 100% do
              faturamento.
            </p>
          </div>

          <div className="mt-10 max-w-3xl mx-auto">
            <div className="grid grid-cols-[1fr_auto_auto] border rounded-[24px] border-zinc-200 overflow-hidden divide-x divide-zinc-100">
              {/* Header */}
              <div className="p-4 bg-[#1A1A1A]" />
              <div className="px-6 py-4 bg-[#E5252A] text-white text-sm font-bold text-center">
                Geste
              </div>
              <div className="px-6 py-4 bg-zinc-100 text-zinc-500 text-sm font-bold text-center">
                Marketplaces
              </div>

              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <>
                  <div key={i + "-f"} className={`p-4 text-sm font-semibold text-[#1A1A1A] bg-white flex items-center ${i < comparisonRows.length - 1 ? "border-b border-zinc-100" : ""}`}>
                    {row.feature}
                  </div>
                  <div className={`p-4 text-sm text-center font-semibold text-[#1A1A1A] bg-white ${i < comparisonRows.length - 1 ? "border-b border-zinc-100" : ""}`}>
                    {row.gest}
                  </div>
                  <div className={`p-4 text-sm text-center text-zinc-500 bg-zinc-50 ${i < comparisonRows.length - 1 ? "border-b border-zinc-100" : ""}`}>
                    {row.others}
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FEATURES GRID ==================== */}
        <section id="recursos" className="pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
              Recursos
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Uma plataforma inteira para seu restaurante
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-7">
              Da vitrine ao pós-venda. Cardápio, checkout, gestão, analytics e
              atendimento — no mesmo lugar.
            </p>
          </div>

          {/* Feature cards grandes (top 2) */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[32px] border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/60 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E5252A]">
                <LayoutGrid className="h-4 w-4" />
                {features[0].label}
              </div>
              <h3 className="mt-3 text-lg font-bold text-[#1A1A1A]">
                {features[0].title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-6">{features[0].desc}</p>
              <div className="mt-5 grid gap-2">
                {features[0].points.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-zinc-700">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-zinc-200 bg-gradient-to-br from-white to-zinc-50/60 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#E5252A]">
                <CreditCard className="h-4 w-4" />
                {features[1].label}
              </div>
              <h3 className="mt-3 text-lg font-bold text-[#1A1A1A]">
                {features[1].title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-6">{features[1].desc}</p>
              <div className="mt-5 grid gap-2">
                {features[1].points.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-sm text-zinc-700">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature cards menores (restante) */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.slice(2).map((f) => (
              <div
                key={f.label}
                className="rounded-[32px] border border-zinc-200 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.06)] transition-shadow"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#E5252A]">
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </div>
                <h3 className="mt-3 text-lg font-bold text-[#1A1A1A]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 leading-6">{f.desc}</p>
                <div className="mt-4 grid gap-2">
                  {f.points.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm text-zinc-700">
                      <ChevronRight className="h-3.5 w-3.5 text-[#E5252A] shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== KANBAN / DASHBOARD SHOWCASE ==================== */}
        <section id="painel" className="pt-16">
          <div className="grid lg:grid-cols-2 gap-0 rounded-[32px] bg-[#1A1A1A] border border-white/10 overflow-hidden">
            {/* Left: Kanban preview */}
            <div className="p-6 sm:p-8 lg:p-10">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-[0.12em]">
                <ReceiptText className="h-4 w-4 text-[#E5252A]" />
                Painel Kanban
              </span>
              <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-white">
                Veja todos os pedidos em tempo real
              </h2>
              <p className="mt-3 text-white/65 text-sm sm:text-base leading-7 max-w-md">
                Arraste entre colunas para mudar o status. Cada transição é registrada.
                Receba notificações instantâneas quando um novo pedido entrar.
              </p>

              <div className="mt-8 grid grid-cols-4 gap-3">
                {kanbanPreview.map((k) => (
                  <div key={k.col}>
                    <p className={`text-sm font-semibold ${k.color}`}>{k.col}</p>
                    <div className={`mt-2 rounded-2xl ${k.bg} border border-white/5 p-3`}>
                      <p className={`text-2xl font-extrabold ${k.color}`}>{k.count}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">pedidos</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/dashboard/login"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white text-sm font-semibold hover:shadow-[0_14px_35px_rgba(229,37,42,0.25)] transition-all"
                >
                  Ver em ação
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-white/15 text-white text-sm font-semibold">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  Notificações em tempo real
                </span>
              </div>
            </div>

            {/* Right: Dashboard preview */}
            <div className="border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-white/5 to-transparent">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-[0.12em]">
                <BarChart3 className="h-4 w-4 text-[#E5252A]" />
                Dashboard
              </span>
              <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-white">
                Números que ajudam a vender mais
              </h2>
              <p className="mt-3 text-white/65 text-sm sm:text-base leading-7 max-w-md">
                Faturamento por dia, ticket médio, retenção, produtos mais vendidos,
                motivos de cancelamento — tudo visual e comparado com a semana
                anterior.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {dashboardMetrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-white/45 text-xs uppercase tracking-wide font-medium">
                      {m.label}
                    </p>
                    <p className="mt-1 text-white text-xl font-extrabold">
                      {m.value}
                    </p>
                    <p className="text-green-400 text-xs font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {m.delta}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white/55 text-xs font-semibold uppercase tracking-wide mb-3">
                  Top produtos
                </p>
                {[
                  { name: "Pizza Calabresa", sold: 127, pct: "w-3/4" },
                  { name: "Coca-Cola 2L", sold: 98, pct: "w-1/2" },
                  { name: "X-Bacon", sold: 74, pct: "w-2/5" },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-3 mb-2.5 last:mb-0">
                    <span className="text-white/80 text-sm flex-1 truncate">
                      {p.name}
                    </span>
                    <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full bg-[#E5252A] ${p.pct}`} />
                    </div>
                    <span className="text-white/50 text-xs w-8 text-right font-mono">
                      {p.sold}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== NÚMEROS / STATS ==================== */}
        <section className="pt-16">
          <div className="rounded-[32px] bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] p-8 sm:p-10 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Por que restaurantes escolhem a Geste
            </h2>
            <p className="mt-2 text-white/80 text-sm max-w-xl mx-auto">
              Números do mercado de delivery e pedidos online no Brasil
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "0%", label: "Comissão por pedido" },
                { value: "100%", label: "Dos dados dos clientes" },
                { value: "70%+", label: "Dos pedidos são via PIX" },
                { value: "24/7", label: "Cardápio sempre aberto" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl sm:text-4xl font-extrabold">{s.value}</p>
                  <p className="mt-1 text-sm text-white/75">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== CHECKOUT SHOWCASE ==================== */}
        <section className="pt-16">
          <div className="rounded-[32px] border border-zinc-200 bg-zinc-50 p-6 sm:p-8 lg:p-10">
            <div className="grid lg:grid-cols-3 gap-8">
              <div>
                <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
                  Checkout
                </span>
                <h2 className="mt-4 text-2xl font-extrabold text-[#1A1A1A]">
                  Pede, paga e pronto
                </h2>
                <p className="mt-2 text-sm text-zinc-600 leading-7">
                  Seu cliente monta o pedido e paga no mesmo fluxo. Sem redirecionar,
                  sem fricção, sem desistir.
                </p>
              </div>

              <div className="lg:col-span-2 grid sm:grid-cols-3 gap-5">
                {[
                  {
                    Icon: BadgeDollarSign,
                    title: "PIX instantâneo",
                    desc: "QR code gerado na hora. Cliente paga, restaurante recebe e o pedido entra automático.",
                  },
                  {
                    Icon: CreditCard,
                    title: "Cartão de crédito",
                    desc: "Até 12x, processado via Mercado Pago. Token seguro, pagamento na mesma tela.",
                  },
                  {
                    Icon: ReceiptText,
                    title: "Na entrega",
                    desc: "Dinheiro (com troco), cartão de débito ou crédito na porta. Flexibilidade pro cliente.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-5"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#1A1A1A] grid place-items-center">
                      <item.Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-[#1A1A1A]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-600 leading-5">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PLANS ==================== */}
        <section id="planos" className="pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
              Planos
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Preço justo, sem surpresas
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 leading-7">
              Comece grátis por 14 dias. Cancele quando quiser. Sem fidelidade,
              sem taxa de adesão.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-500">
              <strong>Plano anual</strong> com até 20% de desconto. Comece grátis por 14 dias.
            </p>
          </div>
        </section>

        {/* ==================== FAQ ==================== */}
        <section id="faq" className="pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex px-3 py-1 rounded-full bg-red-50 text-[#E5252A] text-xs font-bold uppercase tracking-[0.12em]">
              FAQ
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Perguntas frequentes
            </h2>
            <p className="mt-2 text-sm text-zinc-600 leading-7">
              Tudo que um restaurante costuma perguntar antes de começar.
            </p>
          </div>

          <div className="mt-8 max-w-3xl mx-auto grid gap-3">
            {faqs.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section className="pt-16 pb-20">
          <div className="rounded-[32px] bg-[#1A1A1A] border border-white/10 p-8 sm:p-12 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(229,37,42,0.15),transparent_40%)]" />
            <div className="relative max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-semibold uppercase tracking-[0.12em]">
                <Zap className="h-3.5 w-3.5 text-yellow-400" />
                Comece hoje
              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Seu restaurante merece um canal{" "}
                <span className="text-[#E5252A]">próprio</span>
              </h2>

              <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-7 max-w-lg mx-auto">
                Cardápio digital, pagamento, gestão de pedidos, dashboard e WhatsApp
                bot — tudo em uma plataforma. Comece grátis por 14 dias, sem cartão.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white font-semibold text-base hover:shadow-[0_14px_35px_rgba(229,37,42,0.28)] transition-all"
                >
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-2xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all"
                >
                  Acessar painel
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> 14 dias grátis
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Sem cartão
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Sem comissão
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Cancele quando quiser
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
