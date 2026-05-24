/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Zap, 
  Calendar as CalendarIcon, 
  BarChart3, 
  ClipboardCheck, 
  Gift, 
  AlertTriangle,
  Menu,
  X,
  Plus,
  Star,
  Sparkles,
  LogIn,
  LogOut,
  Smartphone,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Habit, Goal, DailyTracking, Reward } from './types';
import Dashboard from './components/Dashboard';
import GoalsModule from './components/GoalsModule';
import ActionPlanModule from './components/ActionPlanModule';
import HabitTracker from './components/HabitTracker';
import HabitCalendar from './components/HabitCalendar';
import WeeklyTracker from './components/WeeklyTracker';
import ReviewModule from './components/ReviewModule';
import RewardsModule from './components/RewardsModule';
import AlertsModule from './components/AlertsModule';
import TodayView from './components/TodayView';
import HabitDetailView from './components/HabitDetailView';
import AndroidHub from './components/AndroidHub';
import AICoach from './components/AICoach';
import SettingsModal from './components/SettingsModal';
import { auth, signInWithGoogle } from './lib/firebase';
import { dbService } from './services/dbService';
import { INITIAL_GOALS, ACTION_PLANS, HABITS, REWARDS, DAILY_TRACKING_EXAMPLES } from './mockData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [isLocalGuest, setIsLocalGuest] = useState(() => {
    try {
      return localStorage.getItem('force_local_mode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeDate, setActiveDate] = useState(new Date(2026, 4, 10)); // May 10, 2026
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [points, setPoints] = useState(0); 
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState('today');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLocalMode = () => {
    try {
      localStorage.setItem('force_local_mode', 'true');
    } catch (e) {}
    dbService.isLocalOnly = true;
    setIsLocalGuest(true);
    
    const dummyUser = {
      uid: 'guest_user',
      displayName: 'Usuario Local',
      email: 'local@habitflow.com',
      emailVerified: true,
      isAnonymous: true,
    } as any;
    setUser(dummyUser);
    
    const cachedGoals = localStorage.getItem(`goals_fallback_guest_user`);
    const cachedHabits = localStorage.getItem(`habits_fallback_guest_user`);
    const cachedRewards = localStorage.getItem(`rewards_fallback_guest_user`);
    const cachedPoints = localStorage.getItem(`points_fallback_guest_user`);

    setGoals(cachedGoals ? JSON.parse(cachedGoals) : INITIAL_GOALS);
    setHabits(cachedHabits ? JSON.parse(cachedHabits) : HABITS);
    setRewards(cachedRewards ? JSON.parse(cachedRewards) : REWARDS);
    setPoints(cachedPoints ? parseInt(cachedPoints, 10) : 1250);
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (isLocalGuest) {
      try {
        localStorage.removeItem('force_local_mode');
      } catch (e) {}
      dbService.isLocalOnly = false;
      setIsLocalGuest(false);
      setUser(null);
    } else {
      await signOut(auth);
    }
  };

  useEffect(() => {
    if (isLocalGuest) {
      dbService.isLocalOnly = true;
      const dummyUser = {
        uid: 'guest_user',
        displayName: 'Usuario Local',
        email: 'local@habitflow.com',
        emailVerified: true,
        isAnonymous: true,
      } as any;
      setUser(dummyUser);
      
      const cachedGoals = localStorage.getItem(`goals_fallback_guest_user`);
      const cachedHabits = localStorage.getItem(`habits_fallback_guest_user`);
      const cachedRewards = localStorage.getItem(`rewards_fallback_guest_user`);
      const cachedPoints = localStorage.getItem(`points_fallback_guest_user`);

      setGoals(cachedGoals ? JSON.parse(cachedGoals) : INITIAL_GOALS);
      setHabits(cachedHabits ? JSON.parse(cachedHabits) : HABITS);
      setRewards(cachedRewards ? JSON.parse(cachedRewards) : REWARDS);
      setPoints(cachedPoints ? parseInt(cachedPoints, 10) : 1250);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Load data safely
          const [fetchedGoals, fetchedHabits, fetchedRewards, profile] = await Promise.all([
            dbService.getGoals(),
            dbService.getHabits(),
            dbService.getRewards(),
            dbService.getUserProfile()
          ]);

          if (fetchedGoals.length === 0 && fetchedHabits.length === 0) {
            // Initialize with mock data if new user
            try {
              await Promise.all([
                ...INITIAL_GOALS.map(g => dbService.saveGoal(g)),
                ...HABITS.map(h => dbService.saveHabit(h)),
                ...REWARDS.map(r => dbService.saveReward(r)),
                dbService.updateUserProfile({ points: 1250 })
              ]);
            } catch (err) {
              console.warn("Failed to initialize server-side mock data:", err);
            }
            setGoals(INITIAL_GOALS);
            setHabits(HABITS);
            setRewards(REWARDS);
            setPoints(1250);
          } else {
            setGoals(fetchedGoals);
            setHabits(fetchedHabits);
            setRewards(fetchedRewards);
            setPoints(profile?.points || 0);
          }
        } catch (error) {
          console.error("Firestore loading error, falling back to local fallback data:", error);
          // Try to load any local state, or use default mocks
          const cachedGoals = localStorage.getItem(`goals_fallback_${user.uid}`);
          const cachedHabits = localStorage.getItem(`habits_fallback_${user.uid}`);
          const cachedRewards = localStorage.getItem(`rewards_fallback_${user.uid}`);
          const cachedPoints = localStorage.getItem(`points_fallback_${user.uid}`);

          setGoals(cachedGoals ? JSON.parse(cachedGoals) : INITIAL_GOALS);
          setHabits(cachedHabits ? JSON.parse(cachedHabits) : HABITS);
          setRewards(cachedRewards ? JSON.parse(cachedRewards) : REWARDS);
          setPoints(cachedPoints ? parseInt(cachedPoints, 10) : 1250);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isLocalGuest]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isRegistering) {
        if (!displayName.trim()) throw new Error('El nombre es requerido');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let message = 'Ocurrió un error en la autenticación';
      if (error.code === 'auth/email-already-in-use') message = 'Este correo ya está en uso';
      else if (error.code === 'auth/invalid-credential') message = 'Credenciales inválidas';
      else if (error.code === 'auth/weak-password') message = 'La contraseña es muy débil (mínimo 6 caracteres)';
      else if (error.message) message = error.message;
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      if (error?.code === 'auth/unauthorized-domain' || (error?.message && error.message.includes('unauthorized-domain'))) {
        setAuthError('UNAUTHORIZED_DOMAIN_ERROR');
      } else {
        setAuthError(error?.message || 'Error al iniciar sesión con Google');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const areas = useMemo(() => {
    return Array.from(new Set(habits.map(h => h.area || 'General')));
  }, [habits]);

  const onAddArea = (newArea: string) => {
    // Areas are now derived from habits, but we keep this for compatibility with other modules if they need to suggest non-habit areas
  };
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  const toggleHabitDate = (habitId: string, date: Date, increment: number = 1) => {
    const dateStr = date.toDateString();
    let updatedPoints = points;

    const newHabits = habits.map(h => {
      if (h.id === habitId) {
        const currentCompletions = h.completions || {};
        const currentCount = currentCompletions[dateStr] || 0;
        
        let newCount;
        if (h.trackingUnit === 'days') {
          newCount = currentCount > 0 ? 0 : 1;
        } else if (h.trackingUnit === 'duration') {
          newCount = currentCount + increment;
        } else {
          newCount = (currentCount + increment) % ((h.dailyGoal || 1) + 1);
        }

        const newCompletions = { ...currentCompletions, [dateStr]: newCount };
        
        const isGoalMet = h.trackingUnit === 'duration' 
          ? newCount >= (h.dailyGoal || 30) 
          : newCount >= (h.dailyGoal || 1);
          
        const existsInDates = h.completedDates.includes(dateStr);
        let newCompletedDates = h.completedDates;

        if (isGoalMet && !existsInDates) {
          newCompletedDates = [...h.completedDates, dateStr];
          updatedPoints += 50;
        } else if (!isGoalMet && existsInDates) {
          newCompletedDates = h.completedDates.filter(d => d !== dateStr);
          updatedPoints = Math.max(0, updatedPoints - 50);
        }

        const updatedHabit = {
          ...h,
          completions: newCompletions,
          completedDates: newCompletedDates
        };
        
        dbService.saveHabit(updatedHabit); // Sync to Firestore
        return updatedHabit;
      }
      return h;
    });

    setHabits(newHabits);
    if (updatedPoints !== points) {
      setPoints(updatedPoints);
      dbService.updateUserProfile({ points: updatedPoints });
    }
  };

  const handleAddHabit = (newHabit: Habit) => {
    setHabits(prev => [...prev, newHabit]);
    dbService.saveHabit(newHabit);
  };

  const handleCompleteHabitToday = (habitId: string, date: Date) => {
    toggleHabitDate(habitId, date);
  };

  const navigation = [
    { id: 'today', label: 'Hoy', icon: CalendarIcon },
    { id: 'dashboard', label: 'Semana', icon: BarChart3 },
    { id: 'goals', label: 'Objetivos', icon: Target },
    { id: 'habits', label: 'Actividades', icon: Star },
    { id: 'rewards', label: 'Premios', icon: Gift },
    { id: 'android', label: 'Móvil App', icon: Smartphone }
  ];

  const renderContent = () => {
    if (selectedHabit && activeTab === 'today') {
      return (
        <HabitDetailView 
          habit={selectedHabit} 
          onBack={() => setSelectedHabit(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'today': 
        return (
          <TodayView 
            activeDate={activeDate}
            setActiveDate={setActiveDate}
            habits={habits}
            onToggleDate={toggleHabitDate}
            onCompleteToday={handleCompleteHabitToday}
            onHabitClick={(habit) => setSelectedHabit(habit)} 
          />
        );
      case 'dashboard': 
        return (
          <Dashboard 
            activeDate={activeDate}
            habits={habits}
            goals={goals} 
            tracking={DAILY_TRACKING_EXAMPLES} 
          />
        );
      case 'goals': return (
        <GoalsModule 
          goals={goals} 
          habits={habits} 
          activeDate={activeDate} 
          areas={areas} 
          onAddArea={onAddArea} 
          onAddGoal={(goal) => {
            setGoals(prev => [...prev, goal]);
            dbService.saveGoal(goal);
          }}
        />
      );
      case 'action-plan': return <ActionPlanModule actions={ACTION_PLANS} goals={goals} />;
      case 'habits': return <HabitTracker habits={habits} onAddHabit={handleAddHabit} goals={goals} tracking={DAILY_TRACKING_EXAMPLES} areas={areas} onAddArea={onAddArea} />;
      case 'calendar': return <HabitCalendar tracking={DAILY_TRACKING_EXAMPLES} habits={habits} />;
      case 'weekly': return <WeeklyTracker tracking={DAILY_TRACKING_EXAMPLES} />;
      case 'review': return <ReviewModule />;
      case 'rewards': return (
        <RewardsModule 
          rewards={rewards} 
          points={points} 
          areas={areas}
          habits={habits}
          onClaim={(id) => {
            const reward = rewards.find(r => r.id === id);
            if (!reward) return;
            const cost = reward.costXP || (reward.type === 'pequeña' ? 200 : 1000);
            if (points < cost) return;

            const updatedReward = { ...reward, status: 'reclamada' as const };
            setRewards(prev => prev.map(r => r.id === id ? updatedReward : r));
            dbService.saveReward(updatedReward);
            
            const newPoints = points - cost;
            setPoints(newPoints);
            dbService.updateUserProfile({ points: newPoints });
          }}
          onAddReward={(newReward) => {
            setRewards(prev => [...prev, newReward]);
            dbService.saveReward(newReward);
          }}
          onEditReward={(edited) => {
            setRewards(prev => prev.map(r => r.id === edited.id ? edited : r));
            dbService.saveReward(edited);
          }}
          onDeleteReward={async (id) => {
            setRewards(prev => prev.filter(r => r.id !== id));
            // Add delete logic to dbService if needed, for now just status update
          }}
        />
      );
      case 'alerts': return <AlertsModule tracking={DAILY_TRACKING_EXAMPLES} goals={goals} />;
      case 'android': return <AndroidHub habits={habits} goals={goals} points={points} />;
      default: return <Dashboard goals={goals} tracking={DAILY_TRACKING_EXAMPLES} habits={habits} activeDate={activeDate} />;
    }
  };

  const isDarkTab = true; // Force dark theme everywhere as per screenshot vibe

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={48} className="text-[#ffcc00] fill-[#ffcc00]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0d0d0d] border border-white/5 rounded-3xl p-8 md:p-10 text-center shadow-2xl">
          <div className="w-16 h-16 bg-[#ffcc00] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#ffcc00]/20">
            <Zap size={32} className="text-black fill-black" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase">HabitFlow</h1>
          <p className="text-slate-500 mb-8 font-medium">Eleva tus hábitos, conquista tus metas.</p>
          
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            {isRegistering && (
              <div className="text-left">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-[#111] border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] outline-none transition-all"
                  required
                />
              </div>
            )}
            <div className="text-left">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] outline-none transition-all"
                required
              />
            </div>
            <div className="text-left">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111] border border-white/5 rounded-2xl px-4 py-3.5 text-white focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] outline-none transition-all"
                required
              />
            </div>

            {authError && (
              authError === 'UNAUTHORIZED_DOMAIN_ERROR' ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-slate-200 text-xs py-4 px-4 rounded-2xl text-left font-medium space-y-3.5 shadow-xl">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-[#ffcc00] shrink-0 mt-0.5" size={18} />
                    <div>
                      <strong className="text-white text-xs font-black uppercase tracking-wider block mb-1">Dominio No Autorizado en Firebase</strong>
                      <span className="text-slate-400 text-[11px] leading-relaxed block">
                        Google OAuth rechaza el inicio de sesión porque el dominio actual no está agregado en los dominios autorizados en la Consola de tu Firebase.
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-xl p-3 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">Pasos para autorizar:</span>
                    <ol className="list-decimal list-inside text-slate-300 space-y-1 text-[10px] leading-relaxed">
                      <li>Abre la <a href="https://console.firebase.google.com/project/habit-flow-f524f/authentication/settings" target="_blank" rel="noopener noreferrer" className="text-[#ffcc00] font-extrabold underline inline-flex items-center gap-0.5">Configuración de Firebase Auth</a>.</li>
                      <li>Haz clic en <strong>"Agregar dominio"</strong> (Authorized domains).</li>
                      <li>Copia y agrega este valor:</li>
                    </ol>
                    <div className="flex items-center gap-1.5 mt-2 bg-[#111] p-2 rounded-lg border border-white/5 justify-between">
                      <code className="text-[10px] font-mono text-[#ffcc00] truncate select-all">{window.location.hostname}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.hostname);
                          alert('¡Copiado con éxito!');
                        }}
                        className="bg-white/10 hover:bg-[#ffcc00] hover:text-black px-2 py-1 rounded text-[9px] font-extrabold uppercase text-white transition-all cursor-pointer"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setAuthError(null)}
                    className="w-full bg-[#ffcc00]/10 hover:bg-[#ffcc00]/20 border border-[#ffcc00]/20 text-[#ffcc00] font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Entendido, Volver a intentar
                  </button>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl font-medium">
                  {authError}
                </div>
              )
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#ffcc00] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>{isRegistering ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</>
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-[#0d0d0d] px-4 text-slate-600">O continúa con</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-slate-900 border border-slate-200 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:shadow-lg hover:shadow-white/5 focus:ring-2 focus:ring-yellow-500/20 active:scale-[0.98] transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-5 h-5" alt="Google" />
            Continuar con Google
          </button>

          <button
            onClick={handleLocalMode}
            className="w-full mt-3 bg-[#ffcc00]/10 border border-[#ffcc00]/20 hover:border-[#ffcc00]/40 text-[#ffcc00] font-black py-4 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-[#ffcc00]/20 transition-all duration-300 active:scale-[0.98] cursor-pointer uppercase text-xs tracking-wider"
          >
            <Sparkles size={16} className="text-[#ffcc00] fill-[#ffcc00]" />
            Usar de Manera Individual (Sin Cuenta)
          </button>
          
          <p className="mt-8 text-xs text-slate-500 font-medium">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'} 
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="ml-2 text-[#ffcc00] font-black hover:underline uppercase tracking-tighter"
            >
              {isRegistering ? 'Inicia Sesión' : 'Regístrate'}
            </button>
          </p>

          <p className="mt-8 text-[9px] text-slate-700 uppercase tracking-widest font-black opacity-50">
            Sincronización en la nube HabitFlow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 bg-[#0a0a0a] text-white`}>
      {/* Mobile Toggle removed */}

      {/* Sidebar - Desktop Only */}
      <aside className={`
        hidden lg:flex lg:flex-col
        border-r transition-all duration-300 ease-in-out z-40
        bg-[#0d0d0d] border-white/5
        w-64 h-screen sticky top-0
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-[#ffcc00] rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">HABITFLOW</h1>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedHabit(null);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'}
                `}
              >
                <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'text-slate-400 group-hover:text-[#ffcc00]'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 bg-white/10 ring-white/5">
                 <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'HabitFlow'}`} alt="Avatar" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-[100px]">{user?.displayName || 'FlowMaster'}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-[#ffcc00] fill-[#ffcc00]" />
                  <span className="text-[10px] font-bold text-[#ffcc00]">{points} XP</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0">
        {/* Top Header Bar with Actions & Adjustments */}
        <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-[#ffcc00] rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-slate-500 hover:text-[#ffcc00] uppercase block cursor-default">HabitFlow OS</span>
              <h1 className="text-xl font-bold text-white transition-colors uppercase select-none">
                {activeTab === 'today' ? 'Hoy' : activeTab === 'dashboard' ? 'Semana' : activeTab === 'goals' ? 'Objetivos' : activeTab === 'habits' ? 'Actividades' : activeTab === 'rewards' ? 'Premios' : activeTab === 'android' ? 'Móvil App' : 'HabitFlow'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* XP Points Tracker Pill */}
            <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-2 select-none">
              <Star size={13} className="text-[#ffcc00] fill-[#ffcc00]" />
              <span className="text-xs font-black text-[#ffcc00] tracking-tight">{points} XP</span>
            </div>

            {/* Ajustes Button Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 sm:px-4 sm:py-2 bg-white/5 border border-white/5 hover:border-[#ffcc00]/40 hover:bg-[#ffcc00]/10 rounded-2xl text-slate-400 hover:text-[#ffcc00] transition-all duration-300 cursor-pointer flex items-center gap-2 group shadow-xl"
              title="Ajustes y Configuración"
            >
              <Settings size={16} className="group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Ajustes</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-around px-2 z-50">
         {navigation.slice(0, 6).map((item) => (
           <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedHabit(null);
            }}
            className="flex flex-col items-center gap-1 min-w-[60px]"
           >
             <div className={`p-1.5 rounded-xl transition-all ${activeTab === item.id ? 'text-[#ffcc00] scale-110' : 'text-slate-500'}`}>
                <item.icon size={24} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'} />
             </div>
             <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'text-[#ffcc00]' : 'text-slate-500'}`}>
               {item.label}
             </span>
           </button>
         ))}
      </div>

      {/* Floating AI Assistant Coach */}
      <AICoach habits={habits} goals={goals} user={user} />

      {/* Global Config Settings Dashboard Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSignOut={handleSignOut}
        user={user}
        isLocalGuest={isLocalGuest}
        points={points}
        setPoints={setPoints}
        habits={habits}
        setHabits={setHabits}
        goals={goals}
        setGoals={setGoals}
        rewards={rewards}
        setRewards={setRewards}
      />
    </div>
  );
}
