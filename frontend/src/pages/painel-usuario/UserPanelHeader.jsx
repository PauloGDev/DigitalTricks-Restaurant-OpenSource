import { User, Store, Crown, LogOut } from "lucide-react";

export default function UserPanelHeader({
  user,
  perfil,
  empresa,
  permissions,
  onLogout,
  onRefresh,
}) {
  return (
    <div className="bg-white rounded-3xl border p-6 flex justify-between">

      <div className="flex gap-4 items-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 grid place-items-center">
          {permissions.isSuperAdmin ? (
            <Crown />
          ) : permissions.isRestaurant ? (
            <Store />
          ) : (
            <User />
          )}
        </div>

        <div>
          <h2 className="font-bold text-xl">
            {permissions.isRestaurant
              ? empresa?.nomeFantasia
              : perfil?.nomeCompleto || user?.username}
          </h2>

          <p className="text-sm text-gray-500">
            {user?.username}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onRefresh}>Atualizar</button>
        <button onClick={onLogout}>
          <LogOut />
        </button>
      </div>

    </div>
  );
}