import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTraining } from '../hooks/useTraining';

/** Libera as rotas internas só para usuários logados e espera os dados carregarem. */
export default function ProtectedRoute() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading, error } = useTraining();
  const location = useLocation();

  if (authLoading) return <p className="status">Carregando…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (error) return <p className="alert alert-error" role="alert">{error}</p>;
  if (dataLoading) return <p className="status">Carregando seus treinos…</p>;
  return <Outlet />;
}
