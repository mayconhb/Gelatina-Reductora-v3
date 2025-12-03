import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, MousePointer, TrendingUp, Calendar, RefreshCw, ArrowLeft, Lock } from 'lucide-react';

interface DailyActiveUser {
  date: string;
  total_users: number;
}

interface FeatureUsage {
  event_name: string;
  event_count: number;
  unique_users: number;
}

interface ProductView {
  product_id: string;
  view_count: number;
  unique_users: number;
  checkout_clicks: number;
}

interface AnalyticsSummary {
  total_events: number;
  unique_users_period: number;
  all_time_users: number;
}

interface DashboardData {
  period: { start: string; end: string };
  summary: AnalyticsSummary | null;
  daily_active_users: DailyActiveUser[];
  feature_usage: FeatureUsage[];
  product_views: ProductView[];
}

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001';

const EVENT_LABELS: Record<string, string> = {
  'app_open': 'Aberturas do App',
  'login': 'Logins',
  'logout': 'Logouts',
  'product_view': 'Visualizações de Produtos',
  'checkout_click': 'Cliques em Comprar',
  'protocol_day_complete': 'Dias de Protocolo Completos',
  'weight_add': 'Pesos Registrados',
  'weight_delete': 'Pesos Removidos',
  'tab_change': 'Navegações entre Abas',
  'install_prompt': 'Prompts de Instalação'
};

const PRODUCT_LABELS: Record<string, string> = {
  'p1': 'Gelatina Reductora Original',
  'p2': 'Protocolo Intensivo',
  'p3': 'Pack Completo',
  'l1': 'Guía de Recetas',
  'l2': 'Videos Exclusivos',
  'b1': 'Bono 1',
  'b2': 'Bono 2',
  'b3': 'Bono 3',
  'tracker': 'Rastreador de Peso'
};

interface Props {
  onBack: () => void;
  userEmail: string;
}

export const AnalyticsDashboard: React.FC<Props> = ({ onBack, userEmail }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [days, setDays] = useState(30);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE}/api/analytics/dashboard?days=${days}`, {
        headers: {
          'x-admin-email': userEmail
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Acesso não autorizado');
        } else {
          setError('Erro ao carregar dados');
        }
        return;
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days, userEmail]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getMaxDAU = () => {
    if (!data?.daily_active_users.length) return 1;
    return Math.max(...data.daily_active_users.map(d => d.total_users), 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <RefreshCw className="animate-spin" size={24} />
          <span>Cargando analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-6 text-center max-w-sm">
          <Lock size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button 
            onClick={onBack}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-400" />
            Analytics
          </h1>
          
          <button 
            onClick={fetchData}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                days === d 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Users size={18} />
              <span className="text-sm font-medium">Usuarios Activos</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {data?.summary?.unique_users_period || 0}
            </p>
            <p className="text-xs text-white/50 mt-1">Últimos {days} días</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">Total Usuarios</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {data?.summary?.all_time_users || 0}
            </p>
            <p className="text-xs text-white/50 mt-1">Desde el inicio</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white mb-4">
            <Calendar size={18} className="text-emerald-400" />
            <span className="font-semibold">Usuarios Activos por Día</span>
          </div>
          
          {data?.daily_active_users && data.daily_active_users.length > 0 ? (
            <div className="space-y-2">
              {data.daily_active_users.slice(-14).map((day, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-14">
                    {formatDate(day.date)}
                  </span>
                  <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${(day.total_users / getMaxDAU()) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white w-8 text-right">
                    {day.total_users}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">Sin datos disponibles</p>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white mb-4">
            <Eye size={18} className="text-purple-400" />
            <span className="font-semibold">Productos Más Vistos</span>
          </div>
          
          {data?.product_views && data.product_views.length > 0 ? (
            <div className="space-y-3">
              {data.product_views.map((product, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {PRODUCT_LABELS[product.product_id] || product.product_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-purple-300">
                      <Eye size={14} />
                      <span>{product.view_count} vistas</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-300">
                      <Users size={14} />
                      <span>{product.unique_users} usuarios</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-300">
                      <MousePointer size={14} />
                      <span>{product.checkout_clicks} clics</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">Sin datos disponibles</p>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-white mb-4">
            <MousePointer size={18} className="text-amber-400" />
            <span className="font-semibold">Uso de Funcionalidades</span>
          </div>
          
          {data?.feature_usage && data.feature_usage.length > 0 ? (
            <div className="space-y-2">
              {data.feature_usage.slice(0, 10).map((feature, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/80 text-sm">
                    {EVENT_LABELS[feature.event_name] || feature.event_name}
                  </span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-amber-300 font-medium">
                      {feature.event_count}x
                    </span>
                    <span className="text-white/50">
                      {feature.unique_users} usuarios
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-center py-8">Sin datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
};
