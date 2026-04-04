// npm install react-icons
import { RiWhatsappLine, RiMapPin2Line, RiMailLine } from "react-icons/ri";

const Contato = () => {
  return (
    <section className="w-full md:py-16 pt-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 lg:mx-auto ml-12">
        
        {/* WhatsApp */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3">
            <RiWhatsappLine className="w-7 h-7 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-800">WhatsApp</h3>
          </div>
          <p className="text-gray-600 mt-2">(85) 9 9729-5809</p>
        </div>

        {/* Endereço */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3">
            <RiMapPin2Line className="w-7 h-7 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-800">Endereço</h3>
          </div>
          <p className="text-gray-600 mt-2 max-w-xs">
            R. Vicente Linhares, 521 - Aldeota, <br /> Fortaleza - CE, 60135-270
          </p>
        </div>

        {/* Email */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-3">
            <RiMailLine className="w-7 h-7 text-gray-800" />
            <h3 className="text-lg font-semibold text-gray-800">Email</h3>
          </div>
          <p className="text-gray-600 mt-2">contato@ardesign.com.br</p>
        </div>
      </div>
    </section>
  );
};

export default Contato;
