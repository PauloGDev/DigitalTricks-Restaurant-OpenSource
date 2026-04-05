import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "./utils/ScrollToTop";
import Error404 from "./pages/Error404";
import CookieConsent from "./components/CookieConsent";
import LoadingScreen from "./components/LoadingScreen";
import Cardapio from "./pages/Cardapio";
import PoliticaPrivacidade from "./components/PoliticaPrivacidade";
import Dashboard from "./pages/Dashboard";
import CarrinhoPopup from "./context/CarrinhoPopup";
import PrivateRoute from "./context/PrivateRoute";
import PublicRoute from "./context/PublicRoute";
import Register from "./pages/Register";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import DireitosPage from "./pages/Direitos";
import PedidoConfirmadoPage from "./components/carrinhoPage/PedidoConfirmadoPage";
import { initMercadoPago } from "@mercadopago/sdk-react";
import UserPanel from "./pages/painel-usuario/UserPanel";
import Perfil from "./pages/Perfil";
import PedidosPage from "./pages/painel-usuario/PedidosPage";
import Login from "./pages/Login";
import CarrinhoPage from "./components/CarrinhoPage";
import PedidoFeitoPage from "./pages/PedidoFeitoPage";
import { RestaurantNotificationProvider } from "./context/RestaurantNotificationContext";
import DashboardTV from "./components/dashboard/pedidos/DashboardTV";
import { useAuth } from "./context/AuthContext";
import LoginAdmin from "./pages/login-admin/LoginAdmin";
import RegisterAdmin from "./pages/register-admin/RegisterAdmin";
import { normalizeRoles, getPrimaryRole, buildPermissions } from "./utils/acl";

const App = () => {
  const [loadingInicial, setLoadingInicial] = useState(true);
  const location = useLocation();
  const { user, loadingAuth } = useAuth();

  useEffect(() => {
    const publicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
    }

    const timer = setTimeout(() => setLoadingInicial(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const pathname = location.pathname;

  const roles = useMemo(() => normalizeRoles(user?.roles || []), [user?.roles]);
  const role = useMemo(() => getPrimaryRole(roles), [roles]);
  const permissions = useMemo(() => buildPermissions(roles), [roles]);

  const isDashboard = pathname.startsWith("/dashboard");
  const isRestaurante = pathname.startsWith("/restaurante/");
  const isCarrinho = pathname.includes("/carrinho");
  const isRestaurantFlow = isRestaurante || isCarrinho;

  const hideNavbar = useMemo(() => {
    if (permissions.canAccessDashboard) {
      return isDashboard;
    }

    if (permissions.isClientOnly) {
      return isDashboard || isRestaurantFlow;
    }

    return isDashboard || isRestaurantFlow;
  }, [permissions, isDashboard, isRestaurantFlow]);

  const hideFooter = useMemo(() => {
    if (permissions.canAccessDashboard) {
      return isDashboard;
    }

    if (permissions.isClientOnly) {
      return isDashboard || isRestaurantFlow;
    }

    return isDashboard || isRestaurantFlow;
  }, [permissions, isDashboard, isRestaurantFlow]);

  const showCarrinhoPopup = useMemo(() => {
    return !hideNavbar && permissions.isClientOnly;
  }, [hideNavbar, permissions.isClientOnly]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="absolute inset-0 z-50">
          <LoadingScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {loadingInicial && (
        <div className="absolute inset-0 z-50">
          <LoadingScreen />
        </div>
      )}

      <ToastContainer />
      <ScrollToTop />

      {!hideNavbar && (
        <div>
          {showCarrinhoPopup && <CarrinhoPopup />}

          <nav className="fixed left-0 top-0 z-20 w-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <NavBar />
            </div>
          </nav>
        </div>
      )}

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />

        <Route path="/restaurante/:slug" element={<Cardapio />} />
        <Route
          path="/restaurante/:slug/carrinho"
          element={<CarrinhoPage />}
        />

        <Route
          path="/pedido-confirmado/:pedidoId"
          element={<PedidoConfirmadoPage />}
        />
        <Route path="/pedido-feito" element={<PedidoFeitoPage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard/login"
          element={
            <PublicRoute>
              <LoginAdmin />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard/register"
          element={
            <PublicRoute>
              <RegisterAdmin />
            </PublicRoute>
          }
        />

        <Route
          path="/direitos"
          element={
            <PublicRoute>
              <DireitosPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Cliente */}
        <Route
          path="/perfil"
          element={
            <PrivateRoute
              roles={["USER", "ADMIN", "GERENTE", "FUNCIONARIO", "SUPER_ADMIN"]}
              showDeniedScreen
            >
              <Perfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/meu-painel"
          element={
            <PrivateRoute
              roles={["USER", "ADMIN", "GERENTE", "FUNCIONARIO", "SUPER_ADMIN"]}
              showDeniedScreen
            >
              <UserPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/meus-pedidos"
          element={
            <PrivateRoute
              role="USER"
              permissions={["canViewOrders"]}
              showDeniedScreen
            >
              <PedidosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/success"
          element={
            <PrivateRoute role="USER" showDeniedScreen>
              <SuccessPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cancel"
          element={
            <PrivateRoute role="USER" showDeniedScreen>
              <CancelPage />
            </PrivateRoute>
          }
        />

        {/* Restaurante / Operação */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute
              roles={["ADMIN", "GERENTE", "FUNCIONARIO", "SUPER_ADMIN"]}
              permissions={["canAccessDashboard"]}
              empresaOnly
              showDeniedScreen
              redirectToLoginIfDenied
            >
              <RestaurantNotificationProvider
                empresaId={Number(localStorage.getItem("empresaId") || 0)}
              >
                <Dashboard />
              </RestaurantNotificationProvider>
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/tv"
          element={
            <PrivateRoute
              roles={["ADMIN", "GERENTE", "FUNCIONARIO", "SUPER_ADMIN"]}
              permissions={["canAccessDashboard"]}
              empresaOnly
              showDeniedScreen
              redirectToLoginIfDenied
            >
              <RestaurantNotificationProvider
                empresaId={Number(localStorage.getItem("empresaId") || 0)}
              >
                <DashboardTV />
              </RestaurantNotificationProvider>
            </PrivateRoute>
          }
        />

        {/* Informativas */}
        <Route
          path="/politica-de-privacidade"
          element={<PoliticaPrivacidade />}
        />

        {/* 404 */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      {!hideFooter && (
        <footer className="mt-auto">
          <Footer />
        </footer>
      )}

      <CookieConsent />
    </div>
  );
};

export default App;