import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Download, 
  Bell, 
  Settings, 
  Share2, 
  Grid, 
  Sparkles, 
  Check, 
  Zap, 
  QrCode, 
  Wifi, 
  Battery, 
  Lock, 
  Volume2, 
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, Goal } from '../types';

// Wallpapers for Material You theme extraction
interface Wallpaper {
  id: string;
  name: string;
  url: string;
  primary: string;     // Hex primary accent
  secondary: string;   // Hex secondary accent
  background: string;  // Hex dark base bg
  cardBg: string;      // Carbon-friendly card background
}

const WALLPAPERS: Wallpaper[] = [
  {
    id: 'cyber-dark',
    name: 'Cyberpunk Yellow (Default)',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    primary: '#ffcc00',
    secondary: '#e2b300',
    background: '#0a0a0a',
    cardBg: '#0d0d0d'
  },
  {
    id: 'nordic-forest',
    name: 'Bosque Esmeralda (Material You)',
    url: 'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=400',
    primary: '#10b981',
    secondary: '#059669',
    background: '#041611',
    cardBg: '#0a231c'
  },
  {
    id: 'cosmic-purple',
    name: 'Nebulosa Lavanda (Material You)',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80&w=400',
    primary: '#a855f7',
    secondary: '#8b5cf6',
    background: '#0f061f',
    cardBg: '#1b0f33'
  },
  {
    id: 'sunset-glow',
    name: 'Atardecer Sahara (Material You)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    primary: '#f97316',
    secondary: '#ea580c',
    background: '#190a02',
    cardBg: '#2c1203'
  },
  {
    id: 'oceanic-cyan',
    name: 'Bahía Turquesa (Material You)',
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=400',
    primary: '#06b6d4',
    secondary: '#0891b2',
    background: '#021217',
    cardBg: '#06262f'
  },
  {
    id: 'minimal-slate',
    name: 'Mármol Industrial',
    url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400',
    primary: '#94a3b8',
    secondary: '#64748b',
    background: '#0f172a',
    cardBg: '#1e293b'
  }
];

interface AndroidHubProps {
  habits: Habit[];
  goals: Goal[];
  points: number;
}

export default function AndroidHub({ habits, goals, points }: AndroidHubProps) {
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper>(WALLPAPERS[0]);
  const [simulatorMode, setSimulatorMode] = useState<'lock' | 'home' | 'app'>('app'); // Simulation views
  const [notificationMsg, setNotificationMsg] = useState('¡Excelente racha! Sigue vendiendo en tu e-commerce 🚀');
  const [showNotification, setShowNotification] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  
  // Widget Customizer configuration
  const [widgetType, setWidgetType] = useState<'habits' | 'metrics' | 'xp'>('habits');
  const [simulatedCheckedHabits, setSimulatedCheckedHabits] = useState<Record<string, boolean>>({});

  // Dynamic system sound chime setup using HTML5 Web Audio API (Zero static audio files required)
  const playAndroidChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Node 1: High crisp chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.01, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      // Node 2: Secondary harmony tone slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain2.gain.setValueAtTime(0.01, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("AudioContext block by browser auto-play policy");
    }
  };

  // Capture deferred installation prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("'beforeinstallprompt' cached successfully.");
    };
    
    const handleAppInstalled = () => {
      setIsPWAInstalled(true);
      console.log("HabitFlow PWA installed successfully on Android.");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running inside installed standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPWAInstall = async () => {
    if (!deferredPrompt) {
      alert("Para instalar en tu Android, abre esta web en Google Chrome en tu celular, toca los tres puntos (Menú) de la esquina superior derecha y selecciona 'Agregar a la pantalla principal' o 'Instalar aplicación'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
  };

  // Push Android simulated alert card
  const handleAlertTrigger = () => {
    setShowNotification(true);
    playAndroidChime();
    setTimeout(() => {
      setShowNotification(false);
    }, 5500);
  };

  // Apply Wallpaper Dynamic Colors (Theme variables) to the page HTML root
  const applyMaterialYouToEntireApp = () => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary-custom', selectedWallpaper.primary);
    root.style.setProperty('--color-primary-custom-dark', selectedWallpaper.secondary);

    // We can also create custom Tailwind utility triggers override
    alert(`¡Estilo Material You Aplicado! Toda la aplicación ahora adoptará el color de acento "${selectedWallpaper.name}" (${selectedWallpaper.primary}).`);
  };

  // Render dummy activities inside Android simulator screen
  const simulatedHabits = habits.slice(0, 4);

  return (
    <div className="px-4 py-6 md:p-8 bg-[#0a0a0a] min-h-screen text-slate-100">
      
      {/* Dynamic Slide-down Android Notification Alert Banner (Synthesized Chime Sound) */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:w-[420px] md:-translate-x-1/2 z-50 bg-[#161618] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5"
          >
            <div className="w-10 h-10 bg-[#ffcc00] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#ffcc00]/20" style={{ backgroundColor: selectedWallpaper.primary }}>
              <Smartphone size={20} className="text-black" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2.5 mb-0.5">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">HabitFlow Android</span>
                <span className="text-[10px] text-slate-500">Ahora</span>
              </div>
              <p className="text-sm font-semibold text-white leading-snug">Metas & Hábitos E-commerce</p>
              <p className="text-xs text-slate-300 mt-1">{notificationMsg}</p>
              
              <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/5">
                <button 
                  onClick={() => setShowNotification(false)} 
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Descartar
                </button>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <button 
                  onClick={() => {
                    setShowNotification(false);
                    setSimulatorMode('app');
                  }} 
                  className="text-xs font-bold transition-colors"
                  style={{ color: selectedWallpaper.primary }}
                >
                  Abrir App
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Soporte Android Nativo
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
            Centro de Aplicación Android
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl font-medium">
            Configura, simula e instala HabitFlow como una aplicación nativa de Android en tu celular. Ajusta los colores dinámicos del sistema Material You y prueba alertas del negocio.
          </p>
        </div>

        <button
          onClick={triggerPWAInstall}
          className="bg-[#ffcc00] hover:bg-white text-black font-black px-6 py-3.5 rounded-2xl flex items-center gap-2.5 transition-all text-xs tracking-wider uppercase shrink-0 shadow-lg shadow-[#ffcc00]/10 cursor-pointer"
          style={{ backgroundColor: selectedWallpaper.primary }}
        >
          <Download size={16} className="stroke-[2.5]" />
          Instalar en Android
        </button>
      </div>

      {/* Main Grid: Left is Configuration & Setup Cards, Right is the Interactive Live Phone Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Controls, Customizers & Manuals (8 Cols on large screns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Wallpaper & Material You Palette Generator */}
          <section className="bg-[#0d0d0f] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Sparkles size={20} className="fill-indigo-400/10" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Paletas "Material You" de Android</h3>
                <p className="text-xs text-slate-400">Selecciona un fondo de pantalla para extraer y aplicar sus colores dinámicos.</p>
              </div>
            </div>

            {/* Grid of Wallpapers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {WALLPAPERS.map((wall) => {
                const isSelected = selectedWallpaper.id === wall.id;
                return (
                  <button
                    key={wall.id}
                    onClick={() => setSelectedWallpaper(wall)}
                    className={`relative rounded-2xl overflow-hidden aspect-[4/3] text-left p-3.5 border transition-all flex flex-col justify-end group cursor-pointer ${
                      isSelected 
                        ? 'border-white ring-2 ring-white/10 scale-[1.02]' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                    
                    {/* Background image */}
                    <img 
                      src={wall.url} 
                      alt={wall.name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Check icon or dot */}
                    <div className="absolute top-2 right-2 z-20">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black">
                          <Check size={12} className="stroke-[3.5]" />
                        </div>
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10"></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="relative z-20">
                      <p className="text-[11px] font-black leading-tight text-white">{wall.name}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: wall.primary }}></span>
                        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: wall.secondary }}></span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Actions for Wallpaper */}
            <div className="p-4 bg-[#141416] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full border border-white/20 shadow-md animate-pulse" style={{ backgroundColor: selectedWallpaper.primary }}></span>
                <span className="text-xs text-slate-300 font-medium">Color de acento actual: <strong style={{ color: selectedWallpaper.primary }}>{selectedWallpaper.primary}</strong></span>
              </div>
              <button
                onClick={applyMaterialYouToEntireApp}
                className="w-full sm:w-auto px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Aplicar a toda la aplicación
              </button>
            </div>
          </section>

          {/* Core Widget Configuration sandbox */}
          <section className="bg-[#0d0d0f] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#ffcc00]/10 rounded-xl text-[#ffcc00]" style={{ color: selectedWallpaper.primary, backgroundColor: `${selectedWallpaper.primary}15` }}>
                <Grid size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Android Home Widget Customizer</h3>
                <p className="text-xs text-slate-400">Configura y previsualiza los widgets oficiales de HabitFlow que puedes poner en tu fondo de Android.</p>
              </div>
            </div>

            {/* Selector tabs for Widget Customizer */}
            <div className="flex bg-[#141416] p-1.5 rounded-2xl gap-1.5 border border-white/5 mb-5 select-none">
              <button
                onClick={() => setWidgetType('habits')}
                className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  widgetType === 'habits' 
                    ? 'bg-[#1a1a1c] text-white shadow-md border border-white/5' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Hábitos Hoy (4x2)
              </button>
              <button
                onClick={() => setWidgetType('metrics')}
                className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  widgetType === 'metrics' 
                    ? 'bg-[#1a1a1c] text-white shadow-md border border-white/5' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                E-commerce (2x2)
              </button>
              <button
                onClick={() => setWidgetType('xp')}
                className={`flex-1 text-center py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                  widgetType === 'xp' 
                    ? 'bg-[#1a1a1c] text-white shadow-md border border-white/5' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Medidor XP (4x1)
              </button>
            </div>

            {/* Widget layout preview sandbox */}
            <div className="bg-[#070708] border border-white/5 p-6 rounded-2xl flex items-center justify-center min-h-[160px] relative">
              <div className="absolute top-2 left-2 text-[10px] font-black uppercase text-slate-600 tracking-wider">
                Previsualización del Widget en Celular (Android Home Grid)
              </div>
              
              <AnimatePresence mode="wait">
                {widgetType === 'habits' && (
                  <motion.div
                    key="widget-habits"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-[#161618]/90 border border-white/10 p-4 rounded-3xl shadow-xl flex flex-col gap-2.5 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Zap size={14} style={{ color: selectedWallpaper.primary }} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Hábitos E-Commerce</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-black">Actualizado hace 1m</span>
                    </div>

                    <div className="space-y-1.5">
                      {simulatedHabits.map((habit) => {
                        const isChecked = simulatedCheckedHabits[habit.id];
                        return (
                          <div 
                            key={habit.id}
                            onClick={() => setSimulatedCheckedHabits(p => ({ ...p, [habit.id]: !p[habit.id] }))}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none ${
                              isChecked 
                                ? 'bg-white/5 border-white/10 text-slate-300' 
                                : 'bg-[#1a1a1c] border-white/[0.04] text-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{habit.icon || '🚀'}</span>
                              <span className="text-xs font-bold truncate max-w-[150px]">{habit.habit}</span>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                              isChecked 
                                ? 'bg-white border-white text-black' 
                                : 'border-slate-600 hover:border-slate-500'
                            }`} style={{ 
                              backgroundColor: isChecked ? selectedWallpaper.primary : 'transparent',
                              borderColor: isChecked ? selectedWallpaper.primary : undefined 
                            }}>
                              {isChecked && <Check size={12} className="stroke-[3.5] text-black" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {widgetType === 'metrics' && (
                  <motion.div
                    key="widget-metrics"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-40 h-40 bg-[#161618]/90 border border-white/10 p-4.5 rounded-3xl shadow-xl flex flex-col justify-between backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Meta Ventas</span>
                      <Smartphone size={12} style={{ color: selectedWallpaper.primary }} />
                    </div>

                    <div className="my-2 text-center">
                      <span className="text-2xl font-black text-white">$1,540</span>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">USD Semanales</div>
                    </div>

                    <div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: '74%', backgroundColor: selectedWallpaper.primary }}></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mt-1.5">
                        <span>74% completado</span>
                        <span style={{ color: selectedWallpaper.primary }}>Racha: 3 sem</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {widgetType === 'xp' && (
                  <motion.div
                    key="widget-xp"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-[#161618]/90 border border-white/10 p-4.5 rounded-2xl shadow-xl flex items-center justify-between gap-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center" style={{ backgroundColor: `${selectedWallpaper.primary}10` }}>
                        <Zap size={20} style={{ color: selectedWallpaper.primary }} className="fill-current" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">Nivel 4 (Venta Mayorista)</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-0.5">{points} XP / 3000 XP para el Siguiente Premio</div>
                      </div>
                    </div>

                    <div className="h-2 w-28 bg-slate-800 rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (points / 3000) * 100)}%`, backgroundColor: selectedWallpaper.primary }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <p className="text-slate-500 text-[11px] mt-3 font-semibold leading-relaxed flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>Para agregar estos widgets en tu Android real: mantén presionado el icono de HabitFlow en tu pantalla de inicio, selecciona "Widgets", elige tu tamaño preferido e intégralo.</span>
            </p>
          </section>

          {/* Alerts and Push notifications tester panel */}
          <section className="bg-[#0d0d0f] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                <Bell size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Simulador de Alertas Notificables</h3>
                <p className="text-xs text-slate-400">Prueba cómo se ven y se escuchan las notificaciones automáticas de metas y ventas de e-commerce en tu teléfono.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Escribe o selecciona tu mensaje para la notificación:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={notificationMsg}
                    onChange={(e) => setNotificationMsg(e.target.value)}
                    placeholder="Mensaje de notificación..."
                    className="flex-1 bg-[#141416] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ffcc00] outline-none transition-all placeholder:text-slate-600 font-semibold"
                    style={{ focusBorderColor: selectedWallpaper.primary }}
                  />
                  
                  <button
                    onClick={handleAlertTrigger}
                    className="px-5 py-3 bg-[#1a1a1c] hover:bg-white text-slate-200 hover:text-black rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 size={14} />
                    Sonar
                  </button>
                </div>
              </div>

              {/* Quick Preset select */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationMsg("💸 ¡Shopify Alert! Venta de $49.99 en Aretes de Plata.")}
                  className="px-3 py-1.5 bg-[#141416] hover:bg-[#1f1f23] border border-white/5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Preset: Venta E-commerce
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationMsg("🔥 ¡Racha del Negocio! Se completaron 6 metas de contenido en TikTok.")}
                  className="px-3 py-1.5 bg-[#141416] hover:bg-[#1f1f23] border border-white/5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Preset: Racha Hábitos
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationMsg("⏰ Recordatorio: Sube las fotos de la nueva colección de collares.")}
                  className="px-3 py-1.5 bg-[#141416] hover:bg-[#1f1f23] border border-white/5 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Preset: Recordatorio
                </button>
              </div>
            </div>
          </section>

          {/* Installation Manual for PWA on Android */}
          <section className="bg-[#0d0d0f] border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="font-extrabold text-white text-base mb-4 flex items-center gap-2">
              <Smartphone size={18} />
              Cómo Instalar HabitFlow en tu Android
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* QR Code Container */}
              <div className="p-5 bg-[#141416] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white rounded-2xl mb-3 shadow-lg flex items-center justify-center">
                  {/* Styled mock QR, responsive */}
                  <div className="w-32 h-32 relative bg-slate-900 rounded-xl p-1 overflow-hidden flex flex-wrap gap-1.5 justify-center items-center">
                    <div className="absolute inset-0 bg-white flex items-center justify-center">
                      <QrCode size={110} className="text-black" />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Código QR de Instalación</p>
                <p className="text-[10px] text-slate-500 font-medium">Escanea con la cámara de tu celular para abrir e instalar en tu celular.</p>
              </div>

              {/* Install steps */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">Abre en Google Chrome</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Navega a la URL de HabitFlow utilizando Chrome en tu teléfono Android.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">Toca el botón o menú</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Haz clic en el botón superior de "Instalar en Android" o pulsa los tres puntos de Chrome y elige 'Agregar a la pantalla principal'.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200">¡Eso es todo!</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Se creará un icono directo de HabitFlow en tu launcher de celular que abre a pantalla completa con soporte fuera de línea (Offline).</p>
                  </div>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Interactive Smartphone Simulator Frame (5 Cols on large screens) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start sticky top-6">
          
          {/* Simulation Header controls */}
          <div className="flex items-center gap-2 mb-3 bg-[#0d0d0f] border border-white/5 rounded-2xl p-1.5 w-full max-w-[320px] shadow-md justify-between select-none">
            <button
              onClick={() => setSimulatorMode('lock')}
              className={`flex-1 py-1 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                simulatorMode === 'lock' ? 'bg-[#ffcc00] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ 
                backgroundColor: simulatorMode === 'lock' ? selectedWallpaper.primary : undefined,
                color: simulatorMode === 'lock' ? 'black' : undefined 
              }}
            >
              Pantalla Bloqueo
            </button>
            <button
              onClick={() => setSimulatorMode('home')}
              className={`flex-1 py-1 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                simulatorMode === 'home' ? 'bg-[#ffcc00] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ 
                backgroundColor: simulatorMode === 'home' ? selectedWallpaper.primary : undefined,
                color: simulatorMode === 'home' ? 'black' : undefined 
              }}
            >
              Launcher
            </button>
            <button
              onClick={() => setSimulatorMode('app')}
              className={`flex-1 py-1 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                simulatorMode === 'app' ? 'bg-[#ffcc00] text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ 
                backgroundColor: simulatorMode === 'app' ? selectedWallpaper.primary : undefined,
                color: simulatorMode === 'app' ? 'black' : undefined 
              }}
            >
              App Interior
            </button>
          </div>

          {/* Realistic HTML / CSS Smartphone Frame */}
          <div className="relative w-full max-w-[320px] aspect-[9/19.5] rounded-[48px] bg-black p-3.5 shadow-2xl border-4 border-slate-800 ring-1 ring-white/10 overflow-hidden flex flex-col select-none">
            
            {/* Front Camera Notch (Dynamic Island styled hole on Android) */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-3xl z-40 flex items-center justify-center p-1 border border-white/5 shadow-inner">
              <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800"></div>
            </div>

            {/* Simulated Android 14 System Status Bar */}
            <div className="absolute top-2.5 left-8 right-8 h-6 flex items-center justify-between text-[11px] font-bold text-white z-40 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold opacity-80 shrink-0">LTE</span>
                <Wifi size={12} className="shrink-0" />
                <Battery size={13} className="shrink-0 text-emerald-400 fill-emerald-400" />
              </div>
            </div>

            {/* SCREEN VIEWPORT CONTAINER: Dynamic render based on wallpaper theme and view mode */}
            <div className="relative flex-1 rounded-[38px] overflow-hidden flex flex-col" style={{ backgroundColor: selectedWallpaper.background }}>
              
              {/* Lock Screen simulation */}
              {simulatorMode === 'lock' && (
                <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 overflow-hidden">
                  {/* Wallpaper Background */}
                  <img src={selectedWallpaper.url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Wallpaper" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>
                  
                  {/* Lock Screen Time */}
                  <div className="relative z-10 flex flex-col items-center mt-12">
                    <span className="text-5xl font-black tracking-tight text-white/90 drop-shadow-md">09:41</span>
                    <span className="text-xs font-bold text-white/70 tracking-wider mt-1 drop-shadow-sm">Dom, 24 de Mayo</span>
                  </div>

                  {/* Incoming alert preview slide-in inside lockscreen */}
                  <div className="relative z-10 space-y-2">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-lg">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-300 mb-1">
                        <Smartphone size={10} style={{ color: selectedWallpaper.primary }} />
                        <span>HABITFLOW • AHORA</span>
                      </div>
                      <p className="text-xs font-bold text-white">Prueba de Alertas E-Commerce</p>
                      <p className="text-[10px] text-slate-300 mt-0.5 line-clamp-1">{notificationMsg}</p>
                    </div>

                    <div className="text-center pt-2">
                      <div className="w-10 h-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-sm mx-auto flex items-center justify-center text-white cursor-pointer hover:bg-white/10">
                        <Lock size={16} />
                      </div>
                      <span className="text-[9px] text-white/50 block mt-1.5">Desliza para desbloquear</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Launcher/Home Screen simulation with selectable widget */}
              {simulatorMode === 'home' && (
                <div className="absolute inset-0 z-30 flex flex-col justify-between p-5 overflow-hidden">
                  {/* Wallpaper Background */}
                  <img src={selectedWallpaper.url} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="Wallpaper" />
                  <div className="absolute inset-0 bg-black/20"></div>

                  {/* Launcher top widget */}
                  <div className="relative z-10 pt-10 px-1 text-white">
                    <div className="flex items-center justify-between text-shadow-md">
                      <div>
                        <span className="text-sm font-black uppercase text-white/95">Domingo 24</span>
                        <div className="text-xs font-semibold text-white/80">Soleado • 24°C</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <Calendar size={14} />
                      </div>
                    </div>
                  </div>

                  {/* Selected Widget placement inside home screen */}
                  <div className="relative z-10 my-auto flex items-center justify-center">
                    {widgetType === 'habits' ? (
                      <div className="bg-[#161618]/90 border border-white/10 p-3 rounded-2xl shadow-xl flex flex-col gap-1.5 w-full select-none backdrop-blur-md">
                        <div className="flex items-center justify-between text-[8px] font-black tracking-wider text-slate-400">
                          <span>HABITFLOW RAPID (4x2)</span>
                          <span style={{ color: selectedWallpaper.primary }}>• Activo</span>
                        </div>
                        <div className="space-y-1.5">
                          {simulatedHabits.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-black/20 border border-white/5 p-1 rounded-lg">
                              <span className="text-[10px] text-white font-bold truncate max-w-[120px]">{item.icon} {item.habit}</span>
                              <div className="w-3.5 h-3.5 rounded bg-slate-800"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : widgetType === 'metrics' ? (
                      <div className="bg-[#161618]/90 border border-white/10 p-3.5 rounded-2xl shadow-xl w-36 h-36 flex flex-col justify-between select-none backdrop-blur-md">
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">VENTAS EXP</span>
                        <div className="text-center font-black text-white text-xl">$1,540</div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: '74%', backgroundColor: selectedWallpaper.primary }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#161618]/90 border border-white/10 p-3 rounded-xl shadow-xl w-full flex items-center justify-between gap-2 select-none backdrop-blur-md">
                        <div className="text-[10px] font-black text-white">XP: {points}</div>
                        <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full" style={{ width: `${Math.min(100, (points / 3000) * 100)}%`, backgroundColor: selectedWallpaper.primary }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Standard dock app icons */}
                  <div className="relative z-10 grid grid-cols-4 gap-4 px-2 mt-auto">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/5">
                        {/* Custom shopify/ecommerce logo representation */}
                        <Zap size={18} className="fill-current" />
                      </div>
                      <span className="text-[8px] text-white font-semibold tracking-wide truncate max-w-[50px] text-shadow-md">Shopify</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-[#ff0050]/20 rounded-2xl flex items-center justify-center text-rose-500 border border-[#ff0050]/10">
                        <span className="text-[10px] font-extrabold text-white">♪</span>
                      </div>
                      <span className="text-[8px] text-white font-semibold tracking-wide truncate max-w-[50px] text-shadow-md">TikTok</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-[#e1306c]/20 rounded-2xl flex items-center justify-center text-[#e1306c] border border-white/5">
                        <span className="text-[10px] font-extrabold text-white">📷</span>
                      </div>
                      <span className="text-[8px] text-white font-semibold tracking-wide truncate max-w-[50px] text-shadow-md">Instagram</span>
                    </div>

                    <div className="flex flex-col items-center gap-1" onClick={() => setSimulatorMode('app')}>
                      <div className="w-10 h-10 bg-[#ffcc00] rounded-xl flex items-center justify-center border border-white/10 cursor-pointer shadow-lg shadow-[#ffcc00]/20 overflow-hidden" style={{ backgroundColor: selectedWallpaper.primary }}>
                        <img 
                          src="/habit_icon.png" 
                          className="w-full h-full object-cover" 
                          alt="HabitFlow" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[8px] text-white font-black tracking-wide truncate max-w-[55px] text-shadow-md">HabitFlow</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Native App View Simulator Mock */}
              {simulatorMode === 'app' && (
                <div className="absolute inset-0 z-30 flex flex-col bg-[#0a0a0a] text-white overflow-hidden pb-4">
                  
                  {/* Running App Navbar */}
                  <div className="pt-9 pb-3 px-4 bg-[#0d0d0f] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded overflow-hidden">
                        <img 
                          src="/habit_icon.png" 
                          className="w-full h-full object-cover" 
                          alt="Logo" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[11px] font-extrabold tracking-tight font-sans text-white">HABITFLOW</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 font-bold" style={{ color: selectedWallpaper.primary }}>
                      {points} XP
                    </span>
                  </div>

                  {/* Simulated App content viewport on Pixel */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                    
                    {/* Welcome banner inside mobile app */}
                    <div className="p-3 bg-[#0d0d0f]/90 border border-white/[0.04] rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: `${selectedWallpaper.primary}15` }}></div>
                      <div className="text-[10px] text-[#ffcc00] font-black" style={{ color: selectedWallpaper.primary }}>ACTIVIDAD DE HOY</div>
                      <div className="text-xs font-extrabold text-white mt-0.5">¡Estás con todo! ⭐</div>
                    </div>

                    {/* Small layout widget inside mobile view */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Tus Actividades</span>
                        <span className="text-[8px] text-slate-600">Ver todas</span>
                      </div>

                      {simulatedHabits.map((item) => (
                        <div key={item.id} className="p-2.5 bg-[#0d0d0f] border border-white/5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">{item.icon || '🎯'}</span>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-white truncate max-w-[110px]">{item.habit}</p>
                              <p className="text-[8px] text-slate-500 truncate">{item.suggestedTime || 'Cualquier hora'}</p>
                            </div>
                          </div>
                          
                          <div className="w-5 h-5 rounded-lg bg-[#141416] border border-white/5 flex items-center justify-center shrink-0" style={{ borderColor: `${selectedWallpaper.primary}20` }}>
                            <div className="w-2.5 h-2.5 rounded bg-slate-800"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Standard Android Nav Bar indicators */}
                  <div className="mt-auto px-4 py-2 bg-[#0d0d0f] border-t border-white/5 flex justify-around items-center text-slate-500 text-[10px]">
                    <div className="flex flex-col items-center text-[#ffcc00]" style={{ color: selectedWallpaper.primary }}>
                      <span>●</span>
                      <span className="text-[8px] font-bold">Hoy</span>
                    </div>
                    <div className="flex flex-col items-center hover:text-slate-200">
                      <span>📊</span>
                      <span className="text-[8px] font-bold">Logros</span>
                    </div>
                    <div className="flex flex-col items-center hover:text-slate-200">
                      <span>🏆</span>
                      <span className="text-[8px] font-bold">Premios</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom Android Gesture Line Bar */}
              <div className="absolute bottom-1 right-0 left-0 h-1.5 flex items-center justify-center z-40 pointer-events-none">
                <div className="w-28 h-1 bg-white/70 rounded-full"></div>
              </div>

            </div>

          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500 font-extrabold flex items-center gap-1 justify-center">
              <span>Dispositivo Simulado: Google Pixel 8 Pro</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Android 14 API 34</span>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
