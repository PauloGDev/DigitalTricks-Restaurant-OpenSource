import React from "react";
import { motion } from "framer-motion";
import PageTitle from "../context/PageTitle";
import { ShieldCheck, Scale, ScrollText, Lock } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const DireitosPage = () => {
  return (
    <div className="pt-20">
      <PageTitle title={"Direitos Reservados | Sublime Perfumes Fracionados"} />

      <div className="px-3 sm:px-[5vw] md:px-[2vw] lg:px-[9vw] py-16">
        {/* Cabeçalho */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={fadeUp}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-14"
        >
          <span className="text-amber-400 font-semibold tracking-wide uppercase">
            Direitos e Diretrizes
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
            Termos de Uso e Política da Loja
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            A <span className="text-amber-400 font-semibold">Sublime Perfumes Fracionados</span> preza pela transparência e segurança.
            Ao navegar em nosso site ou realizar uma compra, você concorda com os
            termos e políticas descritas abaixo.
          </p>
        </motion.div>

        {/* Seções de diretrizes */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Bloco 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-amber-400 w-7 h-7" />
              <h3 className="text-xl font-semibold text-white">
                Direitos Autorais e Marcas
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              Todo o conteúdo presente no site — incluindo logotipo, identidade
              visual, textos, imagens e design — é de propriedade da
              <span className="text-amber-400 font-semibold"> Sublime Perfumes Fracionados</span> e protegido por leis de direitos autorais e de propriedade intelectual.
            </p>
            <p className="text-gray-400 text-sm">
              É proibida a reprodução ou uso não autorizado de qualquer conteúdo
              sem permissão prévia por escrito.
            </p>
          </motion.div>

          {/* Bloco 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
          >
            <div className="flex items-center gap-3">
              <Scale className="text-amber-400 w-7 h-7" />
              <h3 className="text-xl font-semibold text-white">
                Termos de Uso
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              Ao realizar uma compra, o cliente concorda com nossas políticas de
              venda, entrega, trocas e devoluções, em conformidade com o Código
              de Defesa do Consumidor.
            </p>
            <p className="text-gray-400 text-sm">
              A Sublime Perfumes reserva-se o direito de alterar preços, ofertas
              e condições sem aviso prévio, mantendo sempre o respeito ao
              consumidor.
            </p>
          </motion.div>

          {/* Bloco 3 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
          >
            <div className="flex items-center gap-3">
              <ScrollText className="text-amber-400 w-7 h-7" />
              <h3 className="text-xl font-semibold text-white">
                Política de Privacidade e Cookies
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              Os dados fornecidos pelos clientes são utilizados exclusivamente
              para processamento de pedidos e comunicação. Não compartilhamos
              informações pessoais com terceiros sem autorização.
            </p>
            <p className="text-gray-300 leading-relaxed text-base">
              Utilizamos cookies e tecnologias semelhantes para melhorar sua
              experiência de navegação e personalizar conteúdos e ofertas.
            </p>
            <p className="text-gray-400 text-sm">
              O cliente pode, a qualquer momento, gerenciar ou desativar os
              cookies em seu navegador.
            </p>
          </motion.div>

          {/* Bloco 4 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-lg shadow-lg space-y-4"
          >
            <div className="flex items-center gap-3">
              <Lock className="text-amber-400 w-7 h-7" />
              <h3 className="text-xl font-semibold text-white">
                Segurança, LGPD e Responsabilidade
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-base">
              Nosso site utiliza certificado SSL e boas práticas de segurança
              digital para proteger as transações e dados dos clientes.
            </p>
            <p className="text-gray-300 leading-relaxed text-base">
              Em conformidade com a LGPD, o titular dos dados tem o direito de
              solicitar acesso, correção ou exclusão de suas informações
              pessoais a qualquer momento.
            </p>
            <p className="text-gray-400 text-sm">
              O cliente é responsável por manter seus dados de acesso seguros e
              confidenciais.
            </p>
          </motion.div>
        </div>

        {/* Rodapé legal */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={fadeUp}
          viewport={{ once: true }}
          className="mt-16 text-center text-gray-400 text-sm max-w-4xl mx-auto space-y-2"
        >
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-amber-400 font-semibold">
              Sublime Perfumes Fracionados
            </span>. Todos os direitos reservados.
          </p>
          <p>
            Esta política poderá ser atualizada periodicamente para refletir
            alterações na legislação ou melhorias em nossos serviços.
          </p>
          <p>
            O uso deste site implica na aceitação integral de nossos Termos de
            Uso e Política de Privacidade.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DireitosPage;
