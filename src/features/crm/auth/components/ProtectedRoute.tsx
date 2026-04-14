import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/crm/auth/hooks/useAuth";
import { AuthPermission } from "@/features/crm/auth/lib/authAccess";
import { CRM_ROUTES } from "@/features/crm/shared/constants/routes";
import { logAppEvent } from "@/lib/appLogger";

interface ProtectedRouteProps {
  requiredPermission?: AuthPermission;
  loginPath?: string;
  unauthorizedPath?: string;
}

const ProtectedRoute = ({
  requiredPermission,
  loginPath = CRM_ROUTES.login,
  unauthorizedPath = CRM_ROUTES.root,
}: ProtectedRouteProps) => {
  const { session, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    logAppEvent("auth", "warn", "Acesso negado por permissao", {
      pathname: location.pathname,
      requiredPermission,
      userId: session.user.id,
    });

    return (
      <Navigate
        to={unauthorizedPath}
        state={{ from: location, reason: "missing_permission", requiredPermission }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
