import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, ShieldCheck, Power, UserCircle, Menu, X } from 'lucide-react';
import logo from '../assets/logo_pigier.png';

const Header = ({ isAuthenticated, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = ({ isActive }) => 
    `group px-4 py-2 bg-transparent rounded-xl font-medium flex items-center transition-all duration-300 ${
      isActive ? 'bg-white/10 text-white shadow-inner border border-white/20' : 'text-slate-100 hover:bg-white/5 hover:text-white'
    }`;

  const getAdminLinkClass = ({ isActive }) => 
    `group px-4 py-2 rounded-xl font-medium flex items-center transition-all duration-300 ${
      isActive ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' : 'text-slate-100 hover:bg-white/5 hover:text-white'
    }`;
    
  // Classes pour le menu mobile
  const getMobileLinkClass = ({ isActive }) => 
    `group px-4 py-3 rounded-xl font-medium flex items-center transition-all duration-300 w-full ${
      isActive ? 'bg-white/10 text-white shadow-inner border border-white/20' : 'text-slate-100 hover:bg-white/5 hover:text-white'
    }`;
  
  const getMobileAdminLinkClass = ({ isActive }) => 
    `group px-4 py-3 rounded-xl font-medium flex items-center transition-all duration-300 w-full ${
      isActive ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30' : 'text-slate-100 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <header className="bg-gradient-to-r from-[#003366] to-[#004080] shadow-lg border-b border-white/10 fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <img src={logo} alt="Logo Pigier" className="relative h-12 w-auto object-contain bg-white rounded-lg p-1.5 shadow-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-wide leading-tight hidden sm:block">
                CAMPUS EN LIGNE
              </span>
               <span className="font-bold text-lg text-white tracking-wide leading-tight sm:hidden">
                CAMPUS
              </span>
              <span className="text-xs text-blue-200 font-light tracking-widest uppercase">
                Espace Numérique
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-3 items-center">
            <NavLink
              to="/student"
              className={getLinkClass}
            >
              <div className="mr-2 p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                 <GraduationCap className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <span>Espace Étudiant</span>
            </NavLink>
            
            {!isAuthenticated ? (
              <NavLink
                to="/login"
                className={getAdminLinkClass}
              >
                <div className="mr-2 p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <span>Accès Staff</span>
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  className={getAdminLinkClass}
                >
                  <div className="mr-2 p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                    <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <span>Administration</span>
                </NavLink>
                <button 
                  onClick={onLogout}
                  className="ml-2 px-4 py-2 rounded-xl font-medium flex items-center transition-all duration-300 text-red-200 hover:text-red-100 hover:bg-red-900/30 border border-transparent hover:border-red-500/30"
                >
                  <Power className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  <span className="hidden lg:inline">Déconnexion</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:bg-white/10 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#003366] border-t border-white/10 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-2 shadow-inner">
            <NavLink
              to="/student"
              onClick={() => setIsMobileMenuOpen(false)}
              className={getMobileLinkClass}
            >
              <div className="mr-3 p-1.5 rounded-lg bg-white/10">
                 <GraduationCap className="w-5 h-5" strokeWidth={1.5} />
              </div>
              Espace Étudiant
            </NavLink>
            
            {!isAuthenticated ? (
              <NavLink
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={getMobileAdminLinkClass}
              >
                <div className="mr-3 p-1.5 rounded-lg bg-white/10">
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
                </div>
                Accès Staff
              </NavLink>
            ) : (
              <>
                <NavLink
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={getMobileAdminLinkClass}
                >
                  <div className="mr-3 p-1.5 rounded-lg bg-white/10">
                    <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  Administration
                </NavLink>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl font-medium flex items-center transition-all duration-300 text-red-200 hover:text-red-100 hover:bg-red-900/30 border border-transparent hover:border-red-500/30"
                >
                  <Power className="w-5 h-5 mr-3" strokeWidth={1.5} />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
