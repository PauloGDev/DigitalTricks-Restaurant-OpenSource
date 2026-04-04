import "./polyfills";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { CarrinhoProvider } from "./context/CarrinhoContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { initMercadoPago } from "@mercadopago/sdk-react";

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: "pt-BR" });

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <NotificationProvider>
      <CarrinhoProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CarrinhoProvider>
    </NotificationProvider>
  </BrowserRouter>
);