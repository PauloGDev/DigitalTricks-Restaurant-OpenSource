import PageTitle from "../context/PageTitle";
import HeroSection from "../components/home/HeroSection";
import SectionHeader from "../components/home/SectionHeader";
import PillarCard from "../components/home/PillarCard";
import FeatureCard from "../components/home/FeatureCard";
import StepCard from "../components/home/StepCard";
import PricingCard from "../components/home/PricingCard";
import FAQItem from "../components/home/FAQItem";
import SocialProof from "../components/home/SocialProof";
import FinalCTA from "../components/home/FinalCTA";

import { Link } from "react-router-dom";
import {
  Bot,
  BadgeDollarSign,
  BarChart3,
  LayoutGrid,
  SlidersHorizontal,
  ShoppingBag,
  MessageCircleMore,
  QrCode,
  Settings,
  Link as LinkIcon,
  Smartphone,
  Rocket,
  Store,
  CheckCircle2,
  UtensilsCrossed,
  Clock3,
  ShieldCheck,
  Zap,
} from "lucide-react";

const Home = () => {
  const pillars = [
    {
      title: "Automação",
      desc: "Automatize fluxos do atendimento ao pedido e reduza gargalos no dia a dia da operação.",
      Icon: Bot,
    },
    {
      title: "Vendas",
      desc: "Venda pelo seu próprio canal com cardápio digital, link exclusivo e uma experiência mais direta.",
      Icon: BadgeDollarSign,
    },
    {
      title: "Gestão",
      desc: "Tenha visão melhor da operação, organize o cardápio e mantenha o negócio mais consistente.",
      Icon: BarChart3,
    },
  ];

  const features = [
    {
      icon: LayoutGrid,
      label: "Cardápio",
      title: "Categorias, destaques e organização inteligente",
      desc: "Monte um cardápio profissional com navegação simples, foco em conversão e apresentação clara dos produtos.",
    },
    {
      icon: SlidersHorizontal,
      label: "Personalização",
      title: "Variações, adicionais e observações",
      desc: "Configure tamanhos, bordas, extras, observações e regras para deixar o pedido mais completo.",
    },
    {
      icon: ShoppingBag,
      label: "Pedidos",
      title: "Fluxo para delivery, balcão e salão",
      desc: "Uma experiência pensada para o cliente pedir com menos atrito e para o restaurante operar melhor.",
    },
    {
      icon: MessageCircleMore,
      label: "Atendimento",
      title: "Integração com WhatsApp",
      desc: "Aproxime atendimento e operação com um fluxo mais rápido, mais organizado e mais profissional.",
    },
    {
      icon: QrCode,
      label: "Mesas",
      title: "QR Code para atendimento presencial",
      desc: "Leve o digital para o salão com praticidade, autonomia para o cliente e mais agilidade no local.",
    },
    {
      icon: Settings,
      label: "Painel",
      title: "Atualizações rápidas e sem complicação",
      desc: "Edite produtos, preços, disponibilidade e estrutura do cardápio de forma simples.",
    },
    {
      icon: LinkIcon,
      label: "Página própria",
      title: "Um link exclusivo para sua marca",
      desc: "Divulgue sua página no Instagram, Google, bio, campanhas e materiais do restaurante.",
    },
    {
      icon: Smartphone,
      label: "Experiência",
      title: "Leve, rápida e sem app",
      desc: "Seu cliente acessa direto pelo link, sem necessidade de baixar aplicativo.",
    },
    {
      icon: Rocket,
      label: "Escala",
      title: "Base pronta para crescer",
      desc: "Uma estrutura mais sólida para o restaurante evoluir sua presença digital e sua operação.",
    },
  ];

  const steps = [
    {
      n: "1",
      title: "Cadastre seu negócio",
      desc: "Configure dados principais, funcionamento, contato e a base inicial da sua operação.",
    },
    {
      n: "2",
      title: "Monte seu cardápio",
      desc: "Adicione categorias, produtos, variações, adicionais e deixe tudo pronto para vender.",
    },
    {
      n: "3",
      title: "Publique e comece a divulgar",
      desc: "Compartilhe sua página própria e receba pedidos pelo seu canal.",
    },
  ];

  const useCases = [
    {
      title: "Delivery",
      desc: "Receba pedidos com mais autonomia e reduza dependência de marketplaces.",
      Icon: ShoppingBag,
    },
    {
      title: "Salão",
      desc: "Use QR Code nas mesas e melhore a experiência no atendimento presencial.",
      Icon: UtensilsCrossed,
    },
    {
      title: "Retirada",
      desc: "Organize o fluxo para balcão e agilize pedidos de retirada.",
      Icon: Clock3,
    },
    {
      title: "Operação",
      desc: "Mantenha cardápio, disponibilidade e estrutura sempre sob controle.",
      Icon: ShieldCheck,
    },
  ];

  const benefits = [
    "Canal próprio para vender mais direto",
    "Mais controle sobre marca e operação",
    "Menos dependência de plataformas externas",
    "Cardápio digital mais profissional",
    "Atendimento mais organizado",
    "Estrutura melhor para crescer",
  ];

  const plans = [
    {
      name: "Start",
      price: "R$ 89,90",
      period: "/mês",
      highlight: false,
      description: "Ideal para começar sua operação digital com presença própria.",
      features: [
        "Página própria do restaurante",
        "Cardápio digital completo",
        "Categorias e produtos",
        "Variações e adicionais",
        "Link exclusivo para divulgação",
        "Painel de gestão básico",
      ],
    },
    {
      name: "Pro",
      price: "R$ 149,90",
      period: "/mês",
      highlight: true,
      description: "Para restaurantes que querem vender melhor e operar com mais eficiência.",
      features: [
        "Tudo do plano Start",
        "QR Code para mesas",
        "Fluxo delivery, balcão e salão",
        "Integração com WhatsApp",
        "Gestão mais completa do cardápio",
        "Maior personalização da operação",
      ],
    },
    {
      name: "Scale",
      price: "Sob consulta",
      period: "",
      highlight: false,
      description: "Para operações maiores, múltiplas unidades ou necessidades mais avançadas.",
      features: [
        "Tudo do plano Pro",
        "Estrutura sob medida",
        "Expansão operacional",
        "Suporte de implantação",
        "Recursos avançados",
        "Acompanhamento comercial",
      ],
    },
  ];

  const faqs = [
    {
      q: "Preciso baixar aplicativo para usar a Geste?",
      a: "Não. A Geste funciona por link, de forma leve e simples, sem depender de app para o cliente fazer o pedido.",
    },
    {
      q: "A Geste serve só para delivery?",
      a: "Não. Ela pode ser usada para delivery, retirada, balcão e atendimento no salão com QR Code.",
    },
    {
      q: "Posso personalizar meu cardápio?",
      a: "Sim. Você pode configurar categorias, produtos, variações, adicionais e observações.",
    },
    {
      q: "Consigo divulgar minha página no Instagram e WhatsApp?",
      a: "Sim. Você terá um link próprio para compartilhar em redes sociais, bio, campanhas e atendimento.",
    },
    {
      q: "Posso começar pequeno e depois evoluir?",
      a: "Sim. A estrutura foi pensada para começar de forma simples e evoluir conforme o restaurante cresce.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <PageTitle title="Geste | Sistema de gestão para restaurantes" />

      <HeroSection />

      <section className="relative bg-[#1A1A1A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((item) => (
              <PillarCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <section className="pt-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { label: "Recursos", href: "#recursos" },
              { label: "Como funciona", href: "#como-funciona" },
              { label: "Casos de uso", href: "#casos-de-uso" },
              { label: "Planos", href: "#planos" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="shrink-0 px-4 py-2 rounded-full text-sm border border-zinc-200 bg-white hover:bg-zinc-50 transition font-semibold text-zinc-800"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section id="recursos" className="pt-10">
          <SectionHeader
            eyebrow="Recursos"
            title="Tudo que o seu restaurante precisa para vender e operar melhor"
            description="A Geste reúne cardápio digital, atendimento, presença online e gestão em uma única estrutura. Uma plataforma pensada para restaurantes que querem mais autonomia, mais eficiência e mais consistência."
            actions={
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-2xl bg-[#1A1A1A] text-white font-semibold hover:bg-black transition"
                >
                  Acessar painel
                </Link>
                <Link
                  to="/cadastro"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#E5252A] to-[#ff4b4f] text-white font-semibold hover:shadow-[0_14px_35px_rgba(229,37,42,0.25)] transition-all"
                >
                  Criar conta
                </Link>
              </>
            }
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((item) => (
              <FeatureCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section id="como-funciona" className="pt-14">
          <SectionHeader
            eyebrow="Como funciona"
            title="Uma estrutura simples para sair do zero e começar a vender"
            description="Em poucos passos, seu restaurante ganha uma página própria, um cardápio digital completo e uma operação mais organizada."
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <StepCard key={step.n} step={step} />
            ))}
          </div>
        </section>

        <section id="casos-de-uso" className="pt-14">
          <SectionHeader
            eyebrow="Casos de uso"
            title="A Geste acompanha a rotina real do food service"
            description="A plataforma foi pensada para funcionar em diferentes cenários da operação, sem complicar o fluxo."
          />

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {useCases.map(({ title, desc, Icon }) => (
              <div
                key={title}
                className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              >
                <div className="h-11 w-11 rounded-2xl bg-[#1A1A1A] grid place-items-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#1A1A1A]">{title}</h3>
                <p className="mt-2 text-sm text-zinc-600 leading-6">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="beneficios" className="pt-14">
          <div className="rounded-[32px] bg-[#1A1A1A] border border-white/10 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-[0.12em]">
                  <Store className="h-4 w-4" />
                  Canal próprio de vendas
                </div>

                <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-white">
                  Mais controle sobre a presença digital do seu restaurante
                </h2>

                <p className="mt-3 text-white/70 text-sm sm:text-base leading-7">
                  Em vez de depender apenas de canais externos, sua marca pode ter
                  uma estrutura própria para vender, atender e operar com mais
                  consistência.
                </p>

                <div className="mt-6 grid gap-3">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-[#E5252A] mt-0.5 shrink-0" />
                      <span className="text-sm text-white/85">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Canal próprio",
                      desc: "Mais autonomia para vender e divulgar sua marca.",
                      Icon: Zap,
                    },
                    {
                      title: "Gestão centralizada",
                      desc: "Mais organização para produtos, fluxo e operação.",
                      Icon: BarChart3,
                    },
                    {
                      title: "Experiência melhor",
                      desc: "Mais facilidade para o cliente pedir sem atrito.",
                      Icon: Smartphone,
                    },
                    {
                      title: "Estrutura escalável",
                      desc: "Uma base mais sólida para crescer com consistência.",
                      Icon: Rocket,
                    },
                  ].map(({ title, desc, Icon }) => (
                    <div
                      key={title}
                      className="rounded-3xl border border-white/10 bg-white/5 p-5"
                    >
                      <Icon className="h-5 w-5 text-[#E5252A]" />
                      <h3 className="mt-3 text-white font-bold">{title}</h3>
                      <p className="mt-2 text-sm text-white/65 leading-6">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="planos" className="pt-14">
          <SectionHeader
            eyebrow="Planos"
            title="Escolha o plano ideal para o momento do seu restaurante"
            description="Comece com uma base sólida e evolua conforme sua operação cresce. Você pode posicionar esses valores como exemplo inicial e ajustar depois."
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </section>

        <SocialProof />

        <section id="faq" className="pt-14">
          <SectionHeader
            eyebrow="FAQ"
            title="Dúvidas frequentes"
            description="As principais perguntas que um restaurante costuma ter antes de começar."
          />

          <div className="mt-6 grid gap-4">
            {faqs.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        <FinalCTA />
      </main>
    </div>
  );
};

export default Home;