
import React, { useState } from 'react';
import { Download, Leaf, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (name: string, email: string) => void;
  isInstalled: boolean;
  onInstall: () => void;
  installing: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, isInstalled, onInstall, installing }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      onLogin(name, email);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Install Button (Floating above card) */}
      {!isInstalled && (
        <button 
          onClick={onInstall}
          className="absolute top-12 right-6 sm:static sm:mb-6 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl shadow-emerald-200 active:scale-95 transition-transform z-10 animate-pulse"
        >
          <Download size={16} strokeWidth={2.5} />
          INSTALAR APP
        </button>
      )}

      {/* Main Card */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative animate-fade-in-up border border-white/50">
        
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 shadow-sm border border-emerald-100/50">
            <Leaf size={32} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gelatina Reductora</h1>
          <p className="text-slate-500 text-sm">Accede a tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Nome Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">NOMBRE</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">CORREO</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-medium">
              Utiliza el correo de compra
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center mt-2 hover:bg-slate-800"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>

      {/* Simulated Install Alert (Feedback) */}
      {installing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3 animate-bounce-in min-w-[280px]">
          <div className="bg-emerald-100 p-1.5 rounded-full">
            <Download size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Instalando...</p>
          </div>
        </div>
      )}
    </div>
  );
};
