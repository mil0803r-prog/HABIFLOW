import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Database, 
  Trash2, 
  Download, 
  Upload, 
  Star, 
  ShieldAlert, 
  Check, 
  AlertTriangle,
  BrainCircuit,
  Settings,
  HelpCircle,
  Lightbulb,
  LogOut,
  Cpu
} from 'lucide-react';
import { Habit, Goal, Reward } from '../types';
import { dbService } from '../services/dbService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  user: any;
  isLocalGuest: boolean;
  points: number;
  setPoints: (points: number) => void;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSignOut,
  user,
  isLocalGuest,
  points,
  setPoints,
  habits,
  setHabits,
  goals,
  setGoals,
  rewards,
  setRewards
}: SettingsModalProps) {
  // AI Settings State
  const [persona, setPersona] = useState(() => localStorage.getItem('ai_coach_persona') || 'sabio');
  const [customInstruction, setCustomInstruction] = useState(() => localStorage.getItem('ai_coach_custom_instruction') || '');
  const [maxLengthRule, setMaxLengthRule] = useState(() => localStorage.getItem('ai_coach_max_length') || 'short');
  const [model, setModel] = useState(() => localStorage.getItem('ai_coach_model') || 'gemini-3.5-flash');
  
  // Custom XP editor state
  const [xpInput, setXpInput] = useState(String(points));
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'data' | 'xp'>('ai');

  useEffect(() => {
    setXpInput(String(points));
  }, [points]);

  if (!isOpen) return null;

  // Save AI Settings to localStorage
  const handleSaveAISettings = () => {
    localStorage.setItem('ai_coach_persona', persona);
    localStorage.setItem('ai_coach_custom_instruction', customInstruction);
    localStorage.setItem('ai_coach_max_length', maxLengthRule);
    localStorage.setItem('ai_coach_model', model);
    
    // Show premium visual callback
    setBackupSuccess('¡Configuración de IA Guardada Exitosamente!');
    setTimeout(() => setBackupSuccess(null), 3000);
  };

  // Export User Progress & Configuration payload as a clean json file
  const handleExportData = () => {
    try {
      const exportPayload = {
        app: 'HabitFlow',
        exportedAt: new Date().toISOString(),
        points,
        habits,
        goals,
        rewards,
        aiSettings: {
          persona,
          customInstruction,
          maxLengthRule
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `habitflow_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupSuccess('¡Copia de seguridad descargada con éxito!');
      setTimeout(() => setBackupSuccess(null), 3000);
    } catch (e) {
      alert('Error al exportar datos: ' + String(e));
    }
  };

  // Import JSON backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.app !== 'HabitFlow') {
          alert('El archivo cargado no parece ser un respaldo compatible de HabitFlow.');
          return;
        }

        // Apply fallback points and states
        const importedPoints = parsed.points ?? 1250;
        const importedHabits = parsed.habits ?? [];
        const importedGoals = parsed.goals ?? [];
        const importedRewards = parsed.rewards ?? [];

        // Save imported settings
        if (parsed.aiSettings) {
          setPersona(parsed.aiSettings.persona || 'sabio');
          setCustomInstruction(parsed.aiSettings.customInstruction || '');
          setMaxLengthRule(parsed.aiSettings.maxLengthRule || 'short');
          localStorage.setItem('ai_coach_persona', parsed.aiSettings.persona || 'sabio');
          localStorage.setItem('ai_coach_custom_instruction', parsed.aiSettings.customInstruction || '');
          localStorage.setItem('ai_coach_max_length', parsed.aiSettings.maxLengthRule || 'short');
        }

        // Save to system
        setPoints(importedPoints);
        setHabits(importedHabits);
        setGoals(importedGoals);
        setRewards(importedRewards);

        // Sync to fallback storage
        const uid = user?.uid || 'guest_user';
        localStorage.setItem(`goals_fallback_${uid}`, JSON.stringify(importedGoals));
        localStorage.setItem(`habits_fallback_${uid}`, JSON.stringify(importedHabits));
        localStorage.setItem(`rewards_fallback_${uid}`, JSON.stringify(importedRewards));
        localStorage.setItem(`points_fallback_${uid}`, String(importedPoints));

        // Attempt Cloud Sync if connected
        if (!isLocalGuest && user) {
          try {
            await Promise.all([
              ...importedGoals.map((g: Goal) => dbService.saveGoal(g)),
              ...importedHabits.map((h: Habit) => dbService.saveHabit(h)),
              ...importedRewards.map((r: Reward) => dbService.saveReward(r)),
              dbService.updateUserProfile({ points: importedPoints })
            ]);
          } catch (cloudErr) {
            console.warn("Could not sync imported data to cloud Firestore:", cloudErr);
          }
        }

        setBackupSuccess('¡Respaldo importado y cargado correctamente!');
        setTimeout(() => setBackupSuccess(null), 3500);
      } catch (err) {
        alert('Formato de JSON inválido o corrupto: ' + String(err));
      }
    };
    fileReader.readAsText(files[0]);
  };

  // Factory Reset / Limpieza de Datos
  const handleFactoryReset = async () => {
    if (window.confirm('⚠️ ¿Estás COMPLETAMENTE SEGURO de querer restablecer HabitFlow?\n\nEsto borrará de forma irreparable todos tus hábitos creados, metas, puntos de experiencia ganados y el historial almacenado. La aplicación se reiniciará con los ajustes predeterminados.')) {
      try {
        const uid = user?.uid || 'guest_user';
        
        // Remove caches
        localStorage.removeItem(`goals_fallback_${uid}`);
        localStorage.removeItem(`habits_fallback_${uid}`);
        localStorage.removeItem(`rewards_fallback_${uid}`);
        localStorage.removeItem(`points_fallback_${uid}`);
        localStorage.removeItem(`chat_fallback_${uid}`);
        
        // Reload page to re-initialize with mock defaults
        window.location.reload();
      } catch (e) {
        alert('Error al reiniciar: ' + String(e));
      }
    }
  };

  // Apply custom XP Points
  const handleApplyXP = () => {
    const val = parseInt(xpInput, 10);
    if (!isNaN(val) && val >= 0) {
      setPoints(val);
      const uid = user?.uid || 'guest_user';
      localStorage.setItem(`points_fallback_${uid}`, String(val));
      dbService.updateUserProfile({ points: val });
      setBackupSuccess(`¡XP modificado a ${val} XP con éxito!`);
      setTimeout(() => setBackupSuccess(null), 3000);
    } else {
      alert('Por favor ingresa un número de XP válido.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-[#0d0d0d] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-yellow-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 border border-[#ffcc00]/20 flex items-center justify-center text-[#ffcc00]">
              <Settings size={20} className="animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-black text-white text-base tracking-tight uppercase">Panel de Ajustes Avanzado</h2>
              <p className="text-[11px] text-slate-500 font-medium">Personalización de IA, respaldo de datos y variables de gamificación</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Notifications inside Modal */}
        {backupSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-bold uppercase tracking-wider animate-pulse">
            {backupSuccess}
          </div>
        )}

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex gap-1.5 px-6 pt-4 border-b border-white/5">
          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'ai' 
                ? 'border-[#ffcc00] text-[#ffcc00] bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <BrainCircuit size={14} />
            🤖 Coach IA Personalizada
          </button>
          
          <button
            onClick={() => setActiveSubTab('data')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'data' 
                ? 'border-[#ffcc00] text-[#ffcc00] bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Database size={14} />
            💾 Datos y Respaldos
          </button>

          <button
            onClick={() => setActiveSubTab('xp')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'xp' 
                ? 'border-[#ffcc00] text-[#ffcc00] bg-white/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Star size={14} />
            🌟 Recompensas y XP
          </button>
        </div>

        {/* Scrollable Content Pane */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: AI Coach Config */}
          {activeSubTab === 'ai' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#ffcc00]/5 border border-[#ffcc00]/10 rounded-2xl p-4 flex gap-3 text-left">
                <Lightbulb className="text-[#ffcc00] shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configura a tu medida la <strong className="text-white">Inteligencia Artificial de Gemini</strong>. Puedes personalizar el temperamento, exigir respuestas más exhaustivas o enviarle directrices ocultas para que se adecúe perfectamente a tus hábitos de vida actuales.
                </p>
              </div>

              {/* Persona Select */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                  Perfil de Personalidad de tu Coach
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPersona('sabio')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      persona === 'sabio' 
                        ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white' 
                        : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white uppercase tracking-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Sabio y Compasivo
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Compasivo, sabio, empático y enfocado en consejos armónicos para tu día a día.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('critico')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      persona === 'critico' 
                        ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white' 
                        : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white uppercase tracking-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                      Sarcástico y Crítico
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Irónico y humorístico. Desafía tus excusas de forma ácida para despertar tus ganas de actuar.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('militar')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      persona === 'militar' 
                        ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white' 
                        : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white uppercase tracking-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Sargento Militar Estricto
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Firme, enérgico y directo sin excusas. Exenciones de disciplina militar rigurosa absoluta.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPersona('cientifico')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      persona === 'cientifico' 
                        ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white' 
                        : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs text-white uppercase tracking-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Científico Conductual
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">Basado en datos, psicología médica, neuroplasticidad y el método del hábito atómico.</p>
                  </button>
                </div>
              </div>

              {/* Google Gemini Model Selection - New Google Update! */}
              <div className="space-y-2 text-left border border-white/5 bg-white/[0.02] p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-[#ffcc00] uppercase tracking-widest block flex items-center gap-1.5">
                    <Cpu size={14} className="text-[#ffcc00]" />
                    Modelo de Motor Google Gemini IA
                  </label>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider animate-pulse">
                    NUEVA ACTUALIZACIÓN
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed mb-2.5">
                  Cambia entre los últimos algoritmos de DeepMind de Google para potenciar tus análisis.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gemini-3.5-flash', title: 'Gemini 3.5 Flash', type: 'Óptimo', desc: 'Súper rápido y asertivo' },
                    { id: 'gemini-3.1-flash', title: 'Gemini 3.1 Flash', type: 'Rápido', desc: 'Excelente velocidad y foco' },
                    { id: 'gemini-3.1-pro-preview', title: 'Gemini 3.1 Pro', type: 'Complejo', desc: 'Análisis ultra-profundo' }
                  ].map((mOp) => (
                    <button
                      key={mOp.id}
                      type="button"
                      onClick={() => setModel(mOp.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20 cursor-pointer ${
                        model === mOp.id 
                          ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white shadow-lg shadow-yellow-500/5' 
                          : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[11px] text-white tracking-tight leading-none">{mOp.title}</div>
                        <span className={`inline-block text-[8px] font-black uppercase px-1 py-0.5 mt-1 rounded ${
                          mOp.id === 'gemini-3.1-pro-preview' ? 'bg-purple-500/20 text-purple-400' : 'bg-yellow-500/15 text-yellow-500'
                        }`}>
                          {mOp.type}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-500 line-clamp-1 leading-none mt-1">{mOp.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length constraint */}
              <div className="space-y-2 text-left">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                  Extensión de las Respuestas de la IA
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short', title: 'Corto', desc: 'Máx. 2 Párrafos' },
                    { id: 'medium', title: 'Intermedio', desc: '2 - 3 Párrafos' },
                    { id: 'long', title: 'Exhaustivo', desc: 'Sin Límites' }
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setMaxLengthRule(len.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        maxLengthRule === len.id 
                          ? 'border-[#ffcc00] bg-[#ffcc00]/5 text-white' 
                          : 'border-white/5 bg-black/40 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{len.title}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{len.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Directives */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    Directivas Adicionales del Usuario
                  </label>
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Opcional</span>
                </div>
                <textarea
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="Ej: Llámame 'Cadete', enfócate en el estoicismo, o recuérdame complementar con agua en cada comida."
                  className="w-full bg-[#111] border border-white/5 rounded-2xl p-4 text-xs text-white focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] outline-none transition-all placeholder:text-slate-600 leading-relaxed min-h-[80px]"
                />
              </div>

              {/* Save Button for IA */}
              <button
                onClick={handleSaveAISettings}
                className="w-full bg-[#ffcc00] hover:bg-white text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs uppercase tracking-wider cursor-pointer mt-4"
              >
                <Sparkles size={14} className="fill-black" />
                Guardar Configuración de Coach IA
              </button>
            </div>
          )}

          {/* TAB 2: Respaldos y Datos */}
          {activeSubTab === 'data' && (
            <div className="space-y-5 animate-fade-in text-left">
              <div className="border border-white/5 rounded-2xl p-4 bg-black/40 space-y-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Suministro de Datos Activo</span>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-white block">
                      {isLocalGuest ? '✨ Modo Individual Activo' : '🔒 Autenticado en la Nube'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {isLocalGuest 
                        ? 'Tus datos son almacenados localmente en tu navegador de forma segura.' 
                        : `Sincronizando de forma remota y cifrada para: ${user?.email || 'Tu Cuenta'}`}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isLocalGuest ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {isLocalGuest ? 'LOCAL' : 'CLOUD'}
                  </span>
                </div>
              </div>

              {/* Google Cloud & Services Integration Status - Google Update! */}
              <div className="border border-white/5 bg-gradient-to-br from-blue-500/5 to-emerald-500/5 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black tracking-widest text-[#ffcc00] uppercase block">
                    Ecosistema Cloud (Google Core)
                  </span>
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ACTIVO & VERIFICADO
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Service 1: Firestore */}
                  <div className="flex items-start justify-between text-xs">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Database size={12} className="text-blue-400" />
                        Google Cloud Firestore
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Base de datos no-relacional en la nube para sincronización en tiempo real.
                      </p>
                    </div>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold text-right self-start shrink-0">
                      {isLocalGuest ? 'Caché Local' : 'Conectado'}
                    </span>
                  </div>

                  {/* Service 2: Identity Provider */}
                  <div className="flex items-start justify-between text-xs">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Check size={12} className="text-red-400" />
                        Google Identity Hub
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Inicio de sesión seguro para gestionar hábitos familiares sin fricción.
                      </p>
                    </div>
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md font-bold text-right self-start shrink-0">
                      {isLocalGuest ? 'Invitado' : 'Seguro'}
                    </span>
                  </div>

                  {/* Service 3: Gemini Engines */}
                  <div className="flex items-start justify-between text-xs">
                    <div className="max-w-[70%]">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Cpu size={12} className="text-emerald-400" />
                        Google Gemini Neural Engine
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-snug flex items-center gap-1 flex-wrap">
                        Cognición de hábitos impulsada por <span className="text-slate-300 underline font-mono">{model}</span>.
                      </p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold text-right self-start shrink-0 uppercase">
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* Export Card */}
                <div className="border border-white/5 bg-black/30 rounded-2xl p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Download size={14} className="text-[#ffcc00]" />
                      Exportar Respaldo
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Descarga un archivo JSON portable con todos tus hábitos, metas de progreso y XP para no perderlos jamás.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/5 cursor-pointer"
                  >
                    Descargar JSON
                  </button>
                </div>

                {/* Import Card */}
                <div className="border border-white/5 bg-black/30 rounded-2xl p-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Upload size={14} className="text-emerald-400" />
                      Restaurar Respaldo
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Sube un archivo de respaldo (.json) para sustituir o cargar de manera instantánea tus hábitos y estadísticas.
                    </p>
                  </div>
                  <label className="w-full bg-[#111] hover:bg-white/5 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/5 cursor-pointer text-center">
                    Cargar Archivo
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-500/10 rounded-2xl p-5 bg-red-950/5 space-y-3 mt-6">
                <div className="flex items-center gap-2 text-red-400">
                  <ShieldAlert size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">Zona de Peligro</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Las siguientes acciones son irreversibles y afectarán definitivamente tus registros. Por favor, procede con cautela extrema.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleFactoryReset}
                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    Wipe Total & Reiniciar Aplicación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Points and XP */}
          {activeSubTab === 'xp' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="border border-white/5 rounded-2xl p-5 bg-[#ffcc00]/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">XP Actual Acumulada</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#ffcc00] tracking-tight">{points}</span>
                    <span className="text-xs text-[#ffcc00] uppercase font-black tracking-widest">Puntos XP</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-2 block leading-snug">
                    Tus puntos de experiencia se usan para canjear atractivos premios en nuestro catálogo.
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#ffcc00]/10 flex items-center justify-center border border-[#ffcc00]/20">
                  <Star size={32} className="text-[#ffcc00] fill-[#ffcc00] animate-pulse" />
                </div>
              </div>

              {/* XP Sandbox Form */}
              <div className="border border-white/5 rounded-2xl p-5 bg-black/40 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    Ajustador Directo de XP (Consola de Control)
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    ¿Quieres probar cómo funciona el sistema de reclamos de premios o saltar a un nivel específico? Modifica tu balance de XP manualmente aquí.
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={xpInput}
                      onChange={(e) => setXpInput(e.target.value)}
                      placeholder="Ej: 1500"
                      className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-[#ffcc00] focus:ring-1 focus:ring-[#ffcc00] outline-none transition-all font-mono"
                    />
                    <span className="absolute right-3.5 top-3 text-[10px] font-black text-slate-600 uppercase">XP</span>
                  </div>
                  
                  <button
                    onClick={handleApplyXP}
                    className="bg-[#ffcc00] hover:bg-white text-black font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Check size={14} />
                    Aplicar
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Atajos de XP rápidos:</span>
                  <div className="flex gap-2">
                    {[
                      { label: '+500 XP', value: 500 },
                      { label: '+1,500 XP', value: 1500 },
                      { label: 'Reset (0 XP)', value: 0 }
                    ].map((shortcut) => (
                      <button
                        key={shortcut.label}
                        type="button"
                        onClick={() => {
                          const targetVal = shortcut.value === 0 ? 0 : points + shortcut.value;
                          setXpInput(String(targetVal));
                          setPoints(targetVal);
                          const uid = user?.uid || 'guest_user';
                          localStorage.setItem(`points_fallback_${uid}`, String(targetVal));
                          dbService.updateUserProfile({ points: targetVal });
                        }}
                        className="bg-white/5 hover:bg-white/10 text-slate-300 font-black py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-wide border border-white/5 transition-all text-center cursor-pointer flex-1"
                      >
                        {shortcut.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex flex-col sm:flex-row justify-between gap-3 items-center">
          {/* Sign Out Button inside Settings */}
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white font-black py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            Cerrar Sesión ({isLocalGuest ? 'Invitado' : 'Cuenta'})
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all text-center cursor-pointer border border-white/5"
          >
            Cerrar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
}
