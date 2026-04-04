
import UserPanelHeader from "./UserPanelHeader";
import ClientPanelContent from "./ClientPanelContext";
import RestaurantPanelContent from "./RestaurantPanelContent";
import { useUserPanelData } from "../../utils/useUserPanelData";

const UserPanel = () => {
  const {
    loading,
    user,
    permissions,
    perfil,
    empresa,
    pedidos,
    usuariosEmpresa,
    analytics,

    actions,
  } = useUserPanelData();

  if (!user) return null;

  return (
    <section className="min-h-screen pt-20 bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-4">

        <UserPanelHeader
          user={user}
          perfil={perfil}
          empresa={empresa}
          permissions={permissions}
          onLogout={actions.logout}
          onRefresh={actions.reload}
        />

        {permissions.isClient && (
          <ClientPanelContent
            perfil={perfil}
            pedidos={pedidos}
            permissions={permissions}
            actions={actions}
          />
        )}

        {(permissions.isRestaurant || permissions.isSuperAdmin) && (
          <RestaurantPanelContent
            empresa={empresa}
            usuariosEmpresa={usuariosEmpresa}
            analytics={analytics}
            permissions={permissions}
            actions={actions}
          />
        )}

      </div>
    </section>
  );
};

export default UserPanel;