import React from "react";
import { motion } from "framer-motion";

const PoliticaPrivacidade = () => {
  return (
    <div className="bg-gray-950 min-h-screen text-gray-200">
      {/* Header */}
      <div className="bg-amber-600 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-bold text-white"
        >
          Política de Privacidade
        </motion.h1>
        <p className="mt-4 text-lg text-amber-100">
          Transparência e segurança em primeiro lugar.
        </p>
      </div>

      {/* Conteúdo */}
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12 leading-relaxed">
        {/* Introdução */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            1. Introdução
          </h2>
          <p>
            A <strong>Sublime Perfumes Fracionados</strong> respeita a sua
            privacidade e está comprometida em proteger os dados pessoais de
            nossos clientes, visitantes e usuários. Esta Política de Privacidade
            descreve como coletamos, utilizamos, armazenamos e protegemos as
            informações fornecidas, em conformidade com a{" "}
            <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>, 
            bem como diretrizes internacionais como o{" "}
            <strong>Regulamento Geral sobre a Proteção de Dados (GDPR)</strong>.
          </p>
        </section>

        {/* Coleta */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            2. Dados que Coletamos
          </h2>
          <p>Podemos coletar diferentes tipos de informações, incluindo:</p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-300">
            <li>Nome completo, e-mail, telefone e endereço.</li>
            <li>Dados de pagamento, como informações de cartão de crédito (via provedores seguros).</li>
            <li>Histórico de compras e preferências de fragrâncias.</li>
            <li>Informações de navegação, como endereço IP, cookies e localização aproximada.</li>
          </ul>
        </section>

        {/* Uso */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            3. Como Usamos os Dados
          </h2>
          <p>Utilizamos seus dados pessoais para:</p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-300">
            <li>Processar pedidos e entregas.</li>
            <li>Enviar ofertas, promoções e novidades (com seu consentimento).</li>
            <li>Melhorar sua experiência de navegação no site.</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
        </section>

        {/* Compartilhamento */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            4. Compartilhamento de Informações
          </h2>
          <p>
            Seus dados não são vendidos ou alugados. No entanto, podemos
            compartilhá-los com:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-300">
            <li>Prestadores de serviços de pagamento e entrega.</li>
            <li>Parceiros tecnológicos que auxiliam no funcionamento da loja.</li>
            <li>Autoridades legais, quando exigido por lei.</li>
          </ul>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            5. Uso de Cookies
          </h2>
          <p>
            Utilizamos cookies para melhorar sua experiência, personalizar
            conteúdo e analisar o tráfego. Você pode gerenciar ou desativar os
            cookies diretamente em seu navegador. Ao continuar usando nosso
            site, você concorda com essa prática.
          </p>
        </section>

        {/* Direitos do usuário */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            6. Seus Direitos
          </h2>
          <p>
            De acordo com a LGPD e GDPR, você possui os seguintes direitos:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 text-gray-300">
            <li>Acessar os dados que mantemos sobre você.</li>
            <li>Corrigir informações incorretas ou desatualizadas.</li>
            <li>Solicitar a exclusão de seus dados.</li>
            <li>Revogar seu consentimento para uso de informações.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
        </section>

        {/* Segurança */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            7. Segurança
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais rigorosas para proteger
            seus dados contra acessos não autorizados, perdas, alterações ou
            qualquer forma de tratamento inadequado.
          </p>
        </section>

        {/* Alterações */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            8. Alterações desta Política
          </h2>
          <p>
            Esta Política de Privacidade pode ser atualizada periodicamente para
            refletir melhorias em nossos serviços ou mudanças na legislação. A
            versão mais recente estará sempre disponível em nosso site.
          </p>
        </section>

        {/* Contato 
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">
            9. Contato
          </h2>
          <p>
            Em caso de dúvidas, solicitações ou para exercer seus direitos,
            entre em contato com nosso Encarregado de Proteção de Dados:
          </p>
          <p className="mt-2">
            📧 E-mail:{" "}
            <a
              href="mailto:contato@sublimeperfumes.com"
              className="text-amber-500 underline hover:text-amber-400"
            >
              contato@sublimeperfumes.com
            </a>
          </p>
          <p>📞 Telefone: (85) 99956-0003</p>
        </section>
        */}
      </div>
    </div>
  );
};

export default PoliticaPrivacidade;
