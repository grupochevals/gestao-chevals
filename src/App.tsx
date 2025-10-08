import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Login } from '@/pages/Login';
import { ChangePassword } from '@/pages/ChangePassword';
import { Dashboard } from '@/pages/Dashboard';
import { Contratos } from '@/pages/Contratos';
import { Entidades } from '@/pages/Entidades';
import { Unidades } from '@/pages/Unidades';
import { Projetos } from '@/pages/Projetos';
import { Bilheteria } from '@/pages/Bilheteria';
import { Financeiro } from '@/pages/Financeiro';
import { Configuracoes } from '@/pages/Configuracoes';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contratos" element={<Contratos />} />
            <Route path="unidades" element={<Unidades />} />
            <Route path="entidades" element={<Entidades />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="bilheteria" element={<Bilheteria />} />
            <Route path="financeiro" element={<Financeiro />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
