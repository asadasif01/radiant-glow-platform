import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireProfile = false }: Props) => {
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireProfile && profile && !profile.profile_completed) return <Navigate to="/complete-profile" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
