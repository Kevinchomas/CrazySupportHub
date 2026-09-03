import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Mail, Lock } from 'lucide-react';
import logo from '../assets/logo.png';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error.message || 'Credenciales inválidas');
      } else {
        setError('Error al conectar con el servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 overflow-hidden text-white">
      {/* Resplandor ambiental tenue de fondo */}
      <div className="absolute w-96 h-96 bg-[#C6FF00]/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#161F30] border border-[#232F48] shadow-2xl shadow-black/80 space-y-8">
        <div className="text-center">
          <img src={logo} alt="Crazy Imagine Logo" className="h-12 w-12 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-white tracking-tight">CrazySupportHub</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">Inicia sesión para gestionar tus tickets</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-medium my-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
                Correo Electrónico
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-[#232F48] bg-[#0E1422] py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#94A3B8] focus:border-[#C6FF00] focus:outline-none focus:ring-1 focus:ring-[#C6FF00]"
                  placeholder="admin@crazysupport.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#94A3B8] uppercase">
                Contraseña
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94A3B8]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-[#232F48] bg-[#0E1422] py-2.5 pl-10 pr-3 text-sm text-white placeholder-[#94A3B8] focus:border-[#C6FF00] focus:outline-none focus:ring-1 focus:ring-[#C6FF00]"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#C6FF00] px-4 py-2.5 text-sm font-bold text-[#0B0F19] hover:bg-[#b2e600] hover:shadow-lg hover:shadow-[#C6FF00]/25 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C6FF00] focus:ring-offset-2 focus:ring-offset-[#161F30] disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
