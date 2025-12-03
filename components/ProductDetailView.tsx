import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, PlayCircle, Clock, BookOpen, ChefHat, Check, AlertTriangle, Lightbulb, Info, Utensils, Flame, ChevronDown, ChevronUp, CheckCircle, Circle, Target, Plus, TrendingDown, Calendar, Trash2, TrendingUp, Minus, Star, Zap, Coffee } from 'lucide-react';
import { Product, GuideBlock } from '../types';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
}

interface WeightEntry {
  id: number;
  date: string;
  weight: number;
}

// Helper to generate smooth bezier curves
const getSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
};

// Component to render individual guide blocks
const GuideBlockRenderer: React.FC<{ block: GuideBlock }> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <p className="text-slate-600 leading-relaxed text-[15px] mb-4">{block.content}</p>;
    
    case 'subtitle':
      return <h4 className="font-bold text-slate-800 text-lg mt-6 mb-3 flex items-center gap-2"><div className="w-1 h-4 bg-emerald-500 rounded-full"></div>{block.title}</h4>;
    
    case 'list':
      return (
        <ul className="space-y-3 mb-6">
          {block.items?.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    
    case 'tip':
      return (
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 mb-6 flex gap-4">
           <div className="bg-white p-2 rounded-full h-fit shadow-sm text-amber-500">
             <Lightbulb size={20} />
           </div>
           <div>
             {block.title && <h5 className="font-bold text-amber-800 text-xs uppercase tracking-wide mb-1">{block.title}</h5>}
             <p className="text-amber-900/80 text-sm leading-relaxed">{block.content}</p>
           </div>
        </div>
      );
      
    case 'warning':
      return (
        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 mb-6 flex gap-4">
           <div className="bg-white p-2 rounded-full h-fit shadow-sm text-red-500">
             <AlertTriangle size={20} />
           </div>
           <div>
             {block.title && <h5 className="font-bold text-red-800 text-xs uppercase tracking-wide mb-1">{block.title}</h5>}
             <p className="text-red-900/80 text-sm leading-relaxed">{block.content}</p>
           </div>
        </div>
      );

    case 'recipe_card':
      return (
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-2xl border border-emerald-100 mb-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
           <h5 className="font-bold text-slate-800 text-base mb-2 flex items-center gap-2 relative z-10">
             <Utensils size={16} className="text-emerald-600" />
             {block.title}
           </h5>
           <p className="text-slate-600 text-sm leading-relaxed relative z-10">{block.content}</p>
        </div>
      );

    default:
      return null;
  }
};

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onBack }) => {
  const isRecipe = !!product.recipeDetails;
  const isProtocol = !!product.protocolDetails;
  const isTracker = !!product.trackerDetails;
  const isGuide = !!product.guideDetails;
  
  // States for Protocol View
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  // States for Tracker View
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');

  // Load data from local storage on mount
  useEffect(() => {
    if (isProtocol) {
      const saved = localStorage.getItem(`protocol_completed_${product.id}`);
      if (saved) {
        setCompletedDays(JSON.parse(saved));
      }
    }
    if (isTracker) {
        const savedWeights = localStorage.getItem('weight_tracker_data');
        if (savedWeights) {
            setWeights(JSON.parse(savedWeights));
        }
    }
  }, [product.id, isProtocol, isTracker]);

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const toggleCompletion = (e: React.MouseEvent, day: number) => {
    e.stopPropagation(); // Prevent toggling accordion
    let newCompleted;
    if (completedDays.includes(day)) {
      newCompleted = completedDays.filter(d => d !== day);
    } else {
      newCompleted = [...completedDays, day];
    }
    setCompletedDays(newCompleted);
    localStorage.setItem(`protocol_completed_${product.id}`, JSON.stringify(newCompleted));
  };

  // Tracker Functions
  const handleAddWeight = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newWeight) return;
      
      const entry: WeightEntry = {
          id: Date.now(),
          date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          weight: parseFloat(newWeight)
      };
      
      const updatedWeights = [...weights, entry];
      setWeights(updatedWeights);
      localStorage.setItem('weight_tracker_data', JSON.stringify(updatedWeights));
      setNewWeight('');
  };

  const handleDeleteWeight = (id: number) => {
      const updatedWeights = weights.filter(w => w.id !== id);
      setWeights(updatedWeights);
      localStorage.setItem('weight_tracker_data', JSON.stringify(updatedWeights));
  };

  const getWeightStats = () => {
      if (weights.length === 0) return { start: 0, current: 0, lost: 0 };
      const start = weights[0].weight;
      const current = weights[weights.length - 1].weight;
      const lost = start - current;
      return { start, current, lost };
  };

  const stats = getWeightStats();

  // --- CHART LOGIC ---
  const chartData = useMemo(() => {
    const data = weights.slice(-7);
    if (data.length === 0) return null;

    const rawMin = Math.min(...data.map(d => d.weight));
    const rawMax = Math.max(...data.map(d => d.weight));
    const padding = (rawMax - rawMin) * 0.2 || 1; 
    const minWeight = rawMin - padding;
    const maxWeight = rawMax + padding;
    
    const width = 100;
    const height = 100;
    const paddingX = 5;

    const getX = (index: number) => paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2);
    const getY = (weight: number) => height - ((weight - minWeight) / (maxWeight - minWeight)) * height;

    const points = data.map((d, i) => ({
        x: getX(i),
        y: getY(d.weight),
        val: d.weight,
        date: d.date.split(' ')[0]
    }));

    const pathD = getSmoothPath(points);
    const fillPathD = `${pathD} L ${points[points.length-1].x} ${height} L ${points[0].x} ${height} Z`;

    const gridLines = [
        { val: rawMax, y: getY(rawMax), label: 'Max' },
        { val: (rawMax + rawMin) / 2, y: getY((rawMax + rawMin) / 2), label: 'Med' },
        { val: rawMin, y: getY(rawMin), label: 'Min' }
    ];

    return { points, pathD, fillPathD, minWeight, maxWeight, gridLines };
  }, [weights]);


  return (
    <div className="absolute inset-0 z-50 bg-white overflow-y-auto animate-slide-in font-sans">
      
      {/* Header Image & Nav */}
      <div className="relative h-[320px] w-full group">
        <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        {/* Dark Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
            <button 
            onClick={onBack}
            className="bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition-all active:scale-95 border border-white/10 shadow-lg"
            >
            <ArrowLeft size={22} />
            </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-20 flex flex-col items-start z-20">
            <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 inline-block shadow-sm">
                {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                {product.title}
            </h1>
        </div>
      </div>

      {/* Content Body */}
      <div className="relative bg-white -mt-10 rounded-t-[2.5rem] px-6 pt-10 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[50vh]">
        
        {/* Meta Info Bar (Only for Recipe) */}
        {isRecipe ? (
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col items-center gap-1 flex-1 border-r border-slate-200/60 last:border-0">
                    <Clock className="text-emerald-500 mb-1" size={20} />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Tiempo</span>
                    <span className="text-sm font-semibold text-slate-700">{product.duration?.replace('PREP: ', '')}</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 border-r border-slate-200/60 last:border-0">
                    <Utensils className="text-orange-500 mb-1" size={20} />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Dificultad</span>
                    <span className="text-sm font-semibold text-slate-700">Fácil</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1">
                    <Flame className="text-red-500 mb-1" size={20} />
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Calorías</span>
                    <span className="text-sm font-semibold text-slate-700">Baja</span>
                </div>
            </div>
        ) : !isProtocol && !isTracker && !isGuide && (
            <div className="flex gap-6 mb-8 text-slate-600">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Clock size={16} className="text-emerald-600"/>
                    <span className="text-sm font-medium">{product.duration}</span>
                </div>
                {product.lessons && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <BookOpen size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium">{product.lessons} Clases</span>
                </div>
                )}
            </div>
        )}

        {/* Description */}
        <div className="mb-10">
          <p className="text-slate-600 leading-loose text-[15px] font-light">
            {product.description}
          </p>
        </div>

        {/* --- GUIDE VIEW CONTENT (BONUS) --- */}
        {isGuide && product.guideDetails && (
          <div className="animate-fade-in-up space-y-8">
            {product.guideDetails.map((section, idx) => (
              <div key={idx} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                <h3 className="font-bold text-slate-900 text-xl mb-4">{section.title}</h3>
                <div>
                  {section.blocks.map((block, bIdx) => (
                    <GuideBlockRenderer key={bIdx} block={block} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TRACKER VIEW CONTENT --- */}
        {isTracker && (
            <div className="animate-fade-in-up space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wide">Inicial</p>
                        <p className="text-lg font-bold text-slate-800">{stats.start > 0 ? stats.start : '--'}</p>
                        <p className="text-[10px] text-slate-400">kg</p>
                    </div>
                    <div className="bg-emerald-500 p-4 rounded-2xl border border-emerald-400 text-center shadow-lg shadow-emerald-200 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-2 opacity-20">
                             <Target color="white" size={40} />
                         </div>
                        <p className="text-[10px] uppercase font-bold text-emerald-100 mb-1 tracking-wide relative z-10">Actual</p>
                        <p className="text-2xl font-black text-white relative z-10">{stats.current > 0 ? stats.current : '--'}</p>
                        <p className="text-[10px] text-emerald-100 relative z-10">kg</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wide">Perdido</p>
                        <div className="flex items-center justify-center gap-1">
                            {stats.lost > 0 ? <TrendingDown size={14} className="text-emerald-500" /> : null}
                            <p className={`text-lg font-bold ${stats.lost > 0 ? 'text-emerald-500' : 'text-slate-800'}`}>
                                {stats.lost > 0 ? `${stats.lost.toFixed(1)}` : '0'}
                            </p>
                        </div>
                        <p className="text-[10px] text-slate-400">kg</p>
                    </div>
                </div>

                {/* VISUAL CHART AREA */}
                {weights.length > 0 && chartData && (
                    <div className="bg-white rounded-3xl pt-8 pb-4 px-2 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8 px-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                <div className="bg-emerald-100 p-1.5 rounded-lg">
                                    <TrendingUp size={14} className="text-emerald-600" />
                                </div>
                                Gráfico de Evolución
                            </h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                Últimos 7
                            </span>
                        </div>

                        {weights.length === 1 ? (
                             <div className="h-48 mx-6 flex flex-col items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                <Target size={32} className="mb-2 opacity-50" />
                                <p>Agrega un segundo peso para ver la evolución.</p>
                             </div>
                        ) : (
                            <div className="relative h-48 w-full select-none pr-10 pl-2">
                                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
                                        </filter>
                                    </defs>
                                    
                                    {chartData.gridLines.map((line, i) => (
                                        <g key={i}>
                                            <line 
                                                x1="0" y1={line.y} x2="100" y2={line.y} 
                                                stroke="#f1f5f9" strokeWidth="0.5" strokeDasharray="3" 
                                            />
                                            <text 
                                                x="105" y={line.y + 1.5} 
                                                fill="#cbd5e1" fontSize="3.5" fontWeight="600" textAnchor="start"
                                                className="uppercase"
                                            >
                                                {line.val.toFixed(1)}
                                            </text>
                                        </g>
                                    ))}

                                    <path d={chartData.fillPathD} fill="url(#chartGradient)" stroke="none" />
                                    
                                    <path 
                                        d={chartData.pathD} 
                                        fill="none" 
                                        stroke="#10b981" 
                                        strokeWidth="2.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        filter="url(#shadow)"
                                        vectorEffect="non-scaling-stroke"
                                    />

                                    {chartData.points.map((p, i) => {
                                        const isLast = i === chartData.points.length - 1;
                                        return (
                                        <g key={i}>
                                            <text 
                                                x={p.x} 
                                                y="112" 
                                                textAnchor="middle" 
                                                fill={isLast ? "#10b981" : "#94a3b8"}
                                                fontSize="3.5"
                                                fontWeight={isLast ? "700" : "500"}
                                            >
                                                {p.date}
                                            </text>
                                            <circle 
                                                cx={p.x} 
                                                cy={p.y} 
                                                r={isLast ? 4 : 2.5} 
                                                fill="white" 
                                                stroke="#10b981" 
                                                strokeWidth={isLast ? 3 : 2}
                                            />
                                        </g>
                                    )})}
                                </svg>
                            </div>
                        )}
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleAddWeight} className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-emerald-500" />
                        Nuevo Registro
                    </h3>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <input 
                                type="number" 
                                step="0.1" 
                                placeholder="00.0" 
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xl font-bold text-slate-900 placeholder:text-slate-300 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">kg</span>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!newWeight}
                            className="bg-slate-900 text-white px-6 rounded-2xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            Registrar
                        </button>
                    </div>
                </form>

                {/* History List */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm ml-1">
                        <Calendar size={18} className="text-slate-400" />
                        Historial Completo
                    </h3>
                    <div className="space-y-3">
                        {weights.slice().reverse().map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-100 transition-colors">
                                <span className="text-slate-500 font-medium text-sm bg-slate-50 px-3 py-1 rounded-lg">{entry.date}</span>
                                <div className="flex items-center gap-5">
                                    <span className="font-bold text-slate-900 text-lg">{entry.weight} kg</span>
                                    <button 
                                        onClick={() => handleDeleteWeight(entry.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- PROTOCOL VIEW CONTENT --- */}
        {isProtocol && product.protocolDetails ? (
           <div className="space-y-6 animate-fade-in-up">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                   <span>Progreso</span>
                   <span>{Math.round((completedDays.length / 7) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-500"
                     style={{ width: `${(completedDays.length / 7) * 100}%` }}
                   />
                </div>
              </div>

              <div className="space-y-4">
                {product.protocolDetails.map((dayData) => {
                  const isCompleted = completedDays.includes(dayData.day);
                  const isExpanded = expandedDay === dayData.day;
                  
                  return (
                    <div 
                      key={dayData.day} 
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isCompleted 
                          ? 'bg-emerald-50 border-emerald-100' 
                          : isExpanded 
                            ? 'bg-white border-slate-200 shadow-lg' 
                            : 'bg-white border-slate-100 shadow-sm'
                      }`}
                    >
                      {/* Header (Clickable) */}
                      <div 
                        onClick={() => toggleDay(dayData.day)}
                        className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50/50"
                      >
                         <div className="flex items-center gap-4">
                            {/* Status Indicator */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                               {isCompleted ? <Check size={20} strokeWidth={3} /> : <span className="font-bold text-sm">{dayData.day}</span>}
                            </div>
                            
                            <div>
                               <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                 DÍA {dayData.day}
                               </p>
                               <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'text-emerald-900 line-through decoration-emerald-500/30' : 'text-slate-900'}`}>
                                 {dayData.title}
                               </h3>
                            </div>
                         </div>
                         
                         <div className="text-slate-300">
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                         </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-5 pb-6 pt-0 border-t border-dashed border-slate-100 animate-fade-in">
                           <div className="mt-4 mb-6">
                              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm mb-4">
                                 <Target size={18} className="shrink-0 mt-0.5" />
                                 <p><span className="font-bold">Enfoque:</span> {dayData.focus}</p>
                              </div>

                              <div className="space-y-3">
                                {dayData.tricks.map((trick, i) => (
                                  <div key={i} className="flex gap-3 text-slate-700 text-sm">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                     <p className="leading-relaxed">{trick}</p>
                                  </div>
                                ))}
                              </div>
                           </div>

                           <button 
                             onClick={(e) => toggleCompletion(e, dayData.day)}
                             className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                               isCompleted 
                                 ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                 : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'
                             }`}
                           >
                             {isCompleted ? (
                               <>
                                 <CheckCircle size={18} />
                                 Completado
                               </>
                             ) : (
                               <>
                                 <Circle size={18} />
                                 Marcar como Completado
                               </>
                             )}
                           </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
           </div>
        ) : isRecipe && product.recipeDetails ? (
           /* --- RECIPE VIEW CONTENT --- */
          <div className="space-y-10 animate-fade-in-up">
            
            {/* Ingredients Section */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                    <ChefHat size={22} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Ingredientes</h3>
              </div>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {product.recipeDetails.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <div className="w-5 h-5 rounded-full border-2 border-emerald-200 mt-0.5 shrink-0 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-0" /> {/* Checkbox visual placeholder */}
                      </div>
                      <span className="text-slate-700 text-[15px] leading-relaxed font-medium">{ing}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Preparation Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                    <Utensils size={22} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Modo de Preparación</h3>
              </div>

              <div className="relative space-y-0">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100" />

                {product.recipeDetails.preparation.map((step, idx) => (
                  <div key={idx} className="relative pl-14 pb-8 last:pb-0">
                    {/* Number Bubble */}
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-slate-200 ring-4 ring-white z-10">
                      {idx + 1}
                    </div>
                    
                    {/* Step Card */}
                    <div className="bg-slate-50 p-5 rounded-xl rounded-tl-none border border-slate-100">
                        <h4 className="font-bold text-slate-900 text-[15px] mb-2">{step.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{step.step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid of Info Cards (Usage, Tips) */}
            <div className="grid grid-cols-1 gap-4">
                {/* Usage Card */}
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="text-blue-500" size={18} />
                        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Cómo Usar</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {product.recipeDetails.usage.map((item, idx) => (
                        <div key={idx}>
                            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">{item.title}</p>
                            <p className="text-slate-700 font-medium text-sm">{item.content}</p>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Tips Card */}
                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="text-amber-500" size={18} />
                        <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Tips del Chef</h3>
                    </div>
                    <ul className="space-y-3">
                        {product.recipeDetails.tips.map((tip, idx) => (
                            <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                <span className="text-amber-400 text-lg leading-none">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Variants Accordion-style */}
            <div className="bg-purple-50/30 rounded-2xl border border-purple-100 p-6">
                 <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    Variantes
                 </h3>
                 <div className="grid gap-3">
                    {product.recipeDetails.variants.map((v, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-purple-50 text-xs font-medium text-slate-600 shadow-sm">
                            {v}
                        </div>
                    ))}
                 </div>
            </div>

            {/* Warnings */}
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex gap-4">
              <div className="bg-white p-2 rounded-full h-fit shadow-sm">
                  <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div className="space-y-1 pt-1">
                 <h4 className="font-bold text-red-900 text-xs uppercase tracking-wide">Atención</h4>
                 <ul className="space-y-1.5">
                    {product.recipeDetails.warnings.map((w, idx) => (
                      <li key={idx} className="text-xs text-red-700/80 leading-relaxed font-medium">
                        {w}
                      </li>
                    ))}
                 </ul>
              </div>
            </div>
            
          </div>
        ) : !isTracker && !isGuide && (
          /* --- STANDARD COURSE VIEW (LESSONS) --- */
          <div className="animate-fade-in-up">
            <h3 className="font-bold text-slate-900 mb-6 text-xl">Contenido del Curso</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-colors shadow-sm">
                    <PlayCircle size={24} strokeWidth={1.5} className="ml-0.5" />
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-[15px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Clase {i}: Fundamentos</h4>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">10:00</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">En esta clase aprenderemos los conceptos básicos para comenzar.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button (Only for Standard Course) */}
      {!isRecipe && !isProtocol && !isTracker && !isGuide && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 z-40">
          <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <PlayCircle size={20} />
              Continuar Viendo
          </button>
        </div>
      )}
    </div>
  );
};