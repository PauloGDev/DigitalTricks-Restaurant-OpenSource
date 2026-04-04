import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import AddressSelector from "./AdressSelector";

const EnderecoEntregaBox = ({ fadeUp, onSelect }) => {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="border-b border-zinc-100 bg-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50">
            <MapPin className="h-5 w-5 text-zinc-700" />
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-zinc-900 sm:text-xl">
              Endereço de entrega
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Selecione onde você quer receber o pedido.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <AddressSelector onSelect={onSelect} />
      </div>
    </motion.section>
  );
};

export default EnderecoEntregaBox;