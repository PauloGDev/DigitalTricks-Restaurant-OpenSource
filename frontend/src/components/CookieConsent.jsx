import React, { useState, useEffect } from "react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem("cookiesChoice");
    if (!choice) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesChoice", "accepted");
    setVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem("cookiesChoice", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 flex flex-col md:flex-row justify-between items-center gap-3 z-50 border-t border-gray-200">
      <p className="text-xs md:text-sm text-gray-700 max-w-[520px] text-center md:text-left">
        🍪 A <strong>Sublime Perfumes Fracionados</strong> usa cookies para
        oferecer a melhor experiência em aromas e navegação.  
        Ao continuar, você concorda com nossa{" "}
        <a
          href="/politica-de-privacidade"
          className="underline text-amber-600 hover:text-amber-700"
        >
          Política de Privacidade
        </a>.
      </p>

      <div className="flex gap-2">
        <button
          onClick={rejectCookies}
          className="px-4 py-2 bg-gray-300 text-gray-800 text-xs md:text-sm rounded-lg hover:bg-gray-400 transition"
        >
          Recusar
        </button>
        <button
          onClick={acceptCookies}
          className="px-5 py-2 bg-amber-600 text-white text-xs md:text-sm rounded-lg hover:bg-amber-700 transition"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
