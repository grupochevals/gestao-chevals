import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Força a re-renderização quando qualquer parte do estado mudar
  const authState = useAuthStore();
  const { user, loading, initialize, initialized } = authState;
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Aguardar um frame após a inicialização para garantir que o estado está sincronizado
  useEffect(() => {
    if (initialized && !loading) {
      // Pequeno delay para garantir propagação do estado
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [initialized, loading]);

  console.log('🛡️ [ProtectedRoute] Estado:', {
    user: !!user,
    loading,
    initialized,
    isReady,
    userId: user?.id
  });

  // Aguardar inicialização e ready state
  if (!initialized || loading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 [ProtectedRoute] Sem usuário, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ [ProtectedRoute] Usuário autenticado, permitindo acesso');
  return <>{children}</>;
}