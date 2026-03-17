import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertTriangle, KeyRound, User } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // La redirection sera gérée par le listener onAuthStateChanged dans App.jsx
      // Mais on appelle quand même onLogin pour la rétrocompatibilité immédiate si besoin
      if (onLogin) onLogin();
    } catch (err) {
      console.error("Login error:", err);
      let message = "Erreur de connexion. Vérifiez vos identifiants.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = "Email ou mot de passe incorrect.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Trop de tentatives échouées. Veuillez réessayer plus tard.";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/50 w-full max-w-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-700"></div>

        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-[#003366] to-[#004080] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20 rotate-3 group-hover:rotate-6 transition-all duration-500 ring-4 ring-white">
            <ShieldCheck className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Espace Administration</h2>
          <p className="text-slate-500 mt-3 text-center text-sm font-medium max-w-xs leading-relaxed">
            Authentification sécurisée requise pour accéder au tableau de bord.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50/90 backdrop-blur-sm border border-red-100 text-red-700 p-4 rounded-2xl mb-8 text-sm shadow-sm animate-in slide-in-from-top-2">
            <AlertTriangle size={20} className="flex-shrink-0" strokeWidth={2} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="relative group/input">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
              Email administrateur
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within/input:text-[#003366]">
                <User className="h-5 w-5 text-slate-400" strokeWidth={2} />
              </div>
              <input
                type="email"
                required
                className="pl-11 pr-4 w-full py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 font-medium"
                placeholder="admin@ecole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="relative group/input">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 group-focus-within/input:text-[#003366]">
                <KeyRound className="h-5 w-5 text-slate-400" strokeWidth={2} />
              </div>
              <input
                type="password"
                required
                className="pl-11 pr-4 w-full py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#003366]/10 focus:border-[#003366] transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 font-bold text-lg tracking-widest"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`group/btn relative w-full flex justify-center items-center py-4.5 px-6 bg-gradient-to-r from-[#003366] to-[#004080] hover:from-[#002244] hover:to-[#003366] text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 overflow-hidden ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
          >
            <span className="relative z-10 flex items-center">
              {isLoading ? 'Connexion...' : 'Connexion'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2} />}
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
