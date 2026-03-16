import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import StudentView from './views/StudentView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import Loading from './components/Loading';
import Modal from './components/Modal';
import { LogOut } from 'lucide-react';
import pigierCampus from './assets/pigier_campus.jpeg';

// Route Protégée
const ProtectedRoute = ({ isAllowed, children }) => {
  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Composant Principal
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  // Simuler un chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/admin');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    setShowLogoutModal(false);
    navigate('/student');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 font-sans text-slate-800 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${pigierCampus})` }}
    >
      {/* Navigation / Header */}
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogoutClick} />

      <div className="min-h-screen bg-slate-900/60 backdrop-blur-[3px]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <Routes>
          <Route path="/" element={<Navigate to="/student" replace />} />
          <Route 
            path="/student" 
            element={<StudentView />} 
          />
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginView onLogin={handleLogin} />} 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute isAllowed={isAuthenticated}>
                <AdminView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      {/* Modal de Déconnexion */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirmation de déconnexion"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <LogOut className="w-6 h-6 mr-3 text-slate-500 flex-shrink-0" />
            <p className="font-medium">Voulez-vous vraiment vous déconnecter de l'administration ?</p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors flex items-center"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
}