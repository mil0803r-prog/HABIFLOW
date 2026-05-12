import React, { useState } from 'react';
import { Reward, Habit } from '../types';
import { 
  Gift, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Trophy, 
  Star, 
  ChevronRight, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  ChevronDown,
  Calendar,
  Hash,
  Type,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RewardsModuleProps {
  rewards: Reward[];
  points: number;
  areas: string[];
  habits: Habit[];
  onClaim: (id: string) => void;
  onAddReward: (reward: Reward) => void;
  onEditReward: (reward: Reward) => void;
  onDeleteReward: (id: string) => void;
}

export default function RewardsModule({ 
  rewards, 
  points, 
  areas,
  habits,
  onClaim, 
  onAddReward, 
  onEditReward, 
  onDeleteReward 
}: RewardsModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    reward: '',
    condition: '',
    type: 'pequeña',
    costXP: 200,
    triggerType: 'diario',
    category: areas[0] || 'Personal'
  });

  const level = Math.floor(points / 1000) + 1;
  const nextLevelPoints = level * 1000;
  const currentLevelProgress = ((points % 1000) / 1000) * 100;

  const handleOpenAdd = () => {
    setEditingReward(null);
    setSelectedHabitId('');
    setNewReward({
      reward: '',
      condition: '',
      type: 'pequeña',
      costXP: 200,
      triggerType: 'diario',
      category: areas[0] || 'Personal'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (reward: Reward) => {
    setEditingReward(reward);
    setNewReward(reward);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReward) {
      onEditReward({ ...editingReward, ...newReward } as Reward);
    } else {
      onAddReward({
        id: Math.random().toString(36).substr(2, 9),
        status: 'pendiente',
        ...newReward
      } as Reward);
    }
    setShowModal(false);
  };

  const updateConditionTemplate = (trigger: string, cat: string, habitName?: string) => {
    if (!newReward.reward || newReward.condition === '') {
      const freq = trigger === 'diario' ? '1 día' : 
                   trigger === 'semanal' ? '7 días' : 
                   trigger === 'trimestral' ? 'el trimestre' : 'el año';
      
      const target = habitName ? `la actividad "${habitName}"` : `todas las actividades de "${cat}"`;
      const template = `Completar ${target} durante ${freq}`;
      setNewReward(prev => ({ ...prev, triggerType: trigger as any, category: cat, condition: template }));
    } else {
      setNewReward(prev => ({ ...prev, triggerType: trigger as any, category: cat }));
    }
  };

  const handleHabitSelect = (id: string) => {
    setSelectedHabitId(id);
    const habit = habits.find(h => h.id === id);
    if (habit) {
      updateConditionTemplate(newReward.triggerType || 'diario', habit.area || 'General', habit.habit);
    }
  };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Level Header */}
      <div className="bg-[#0a0a0a] rounded-[40px] border border-white/5 p-8 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-700">
           <Trophy size={140} className="text-[#ffcc00]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-[#ffcc00]/10 text-[#ffcc00] text-sm font-black uppercase tracking-widest border border-[#ffcc00]/20">
                BALANCE TOTAL
              </span>
              <Sparkles size={16} className="text-[#ffcc00] animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-white tracking-tighter">{points.toLocaleString()}</h2>
              <span className="text-xl font-bold text-[#ffcc00] opacity-80 italic">XP</span>
            </div>
            <p className="text-slate-500 font-medium tracking-tight mt-1 text-sm">Arquitectura de Hábitos de Alto Rendimiento • Nivel {level}</p>
          </div>

          <div className="flex-1 max-w-sm w-full">
            <div className="flex justify-between items-end mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span>Progreso Nivel {level}</span>
              <span>{Math.round(currentLevelProgress)}%</span>
            </div>
            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelProgress}%` }}
                className="h-full bg-gradient-to-r from-[#ffcc00] via-[#ffcc00] to-orange-400 rounded-full shadow-[0_0_15px_rgba(255,204,0,0.3)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="bg-[#0d0d0d] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 sm:p-10 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-[#0d0d0d] to-[#151515] gap-6">
          <div>
            <h3 className="font-black text-2xl text-white tracking-tight">Market de Recompensas</h3>
            <p className="text-sm text-[#ffcc00] font-black uppercase tracking-[0.2em] mt-1 italic">Dopamina estratégica por cumplimiento</p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-3 bg-[#ffcc00] text-black px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#ffcc00]/20"
          >
            <Plus size={20} />
            <span>Agregar Premio</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-8">
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                pointsAvailable={points}
                onClaim={() => onClaim(reward.id)}
                onEdit={() => handleOpenEdit(reward)}
                onDelete={() => setRewardToDelete(reward)}
              />
            ))
          ) : (
            <div className="col-span-full p-20 text-center space-y-4">
              <Gift size={48} className="mx-auto text-slate-800" />
              <p className="text-slate-500 font-bold tracking-tight">No hay recompensas configuradas aún.</p>
            </div>
          )}
        </div>
      </div>

      {/* Rules Footer */}
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 px-8 py-6 opacity-40">
        <RuleSummary icon={Star} label="Hábito: +50 XP" />
        <RuleSummary icon={Trophy} label="Objetivo: +500 XP" />
        <RuleSummary icon={Zap} label="Racha: +200 XP" />
      </div>

      <AnimatePresence>
        {rewardToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRewardToDelete(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-[32px] p-8 relative z-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">¿Estás seguro de eliminar este premio?</h3>
              <p className="text-slate-400 mb-8">Esta acción no se puede deshacer. Se perderá el premio "{rewardToDelete.reward}".</p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    onDeleteReward(rewardToDelete.id);
                    setRewardToDelete(null);
                  }}
                  className="flex-1 bg-red-500 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  Confirmar
                </button>
                <button 
                  onClick={() => setRewardToDelete(null)}
                  className="flex-1 bg-white/5 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0f0f0f] border border-white/10 w-full max-w-xl rounded-[40px] overflow-hidden relative shadow-2xl z-10"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#0f0f0f] to-[#151515]">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {editingReward ? 'Editar Premio' : 'Nuevo Premio'}
                    </h3>
                    <p className="text-xs text-[#ffcc00] font-bold uppercase tracking-widest mt-1">Configuración de incentivo</p>
                  </div>
                  <button type="button" onClick={() => setShowModal(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Name */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">¿Cuál es el premio?</p>
                    <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 focus-within:border-[#ffcc00]/50 transition-all">
                      <Gift size={20} className="text-[#ffcc00] opacity-60" />
                      <input 
                        required
                        type="text" 
                        placeholder="Ej: Cena especial, Viaje, Nueva laptop..."
                        value={newReward.reward}
                        onChange={(e) => setNewReward({ ...newReward, reward: e.target.value })}
                        className="bg-transparent flex-1 text-white font-bold outline-none placeholder:text-slate-700"
                      />
                    </div>
                  </div>

                  {/* XP Cost & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Costo (XP)</p>
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5">
                        <Hash size={18} className="text-slate-500" />
                        <input 
                          required
                          type="number"
                          value={newReward.costXP}
                          onChange={(e) => setNewReward({ ...newReward, costXP: parseInt(e.target.value) })}
                          className="bg-transparent flex-1 text-white font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tipo</p>
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 relative">
                        <Type size={18} className="text-slate-500" />
                        <select 
                          value={newReward.type}
                          onChange={(e) => setNewReward({ ...newReward, type: e.target.value as any })}
                          className="bg-transparent flex-1 text-white font-bold outline-none appearance-none cursor-pointer"
                        >
                          <option value="pequeña">Lite</option>
                          <option value="grande">Elite</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Trigger & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Actividad Relacionada</p>
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 relative">
                        <Star size={18} className="text-slate-500" />
                        <select 
                          value={selectedHabitId}
                          onChange={(e) => handleHabitSelect(e.target.value)}
                          className="bg-transparent flex-1 text-white font-bold outline-none appearance-none cursor-pointer text-sm"
                        >
                          <option value="">Seleccionar actividad...</option>
                          {habits.map(h => (
                            <option key={h.id} value={h.id}>{h.habit}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-5 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Categoría</p>
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 relative">
                        <Target size={18} className="text-slate-500" />
                        <select 
                          value={newReward.category}
                          onChange={(e) => updateConditionTemplate(newReward.triggerType || 'diario', e.target.value)}
                          className="bg-transparent flex-1 text-white font-bold outline-none appearance-none cursor-pointer"
                        >
                          {areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-5 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Frecuencia</p>
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 relative">
                        <Calendar size={18} className="text-slate-500" />
                        <select 
                          value={newReward.triggerType}
                          onChange={(e) => updateConditionTemplate(e.target.value, newReward.category || areas[0])}
                          className="bg-transparent flex-1 text-white font-bold outline-none appearance-none cursor-pointer"
                        >
                          <option value="diario">Diario</option>
                          <option value="semanal">Semanal</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="anual">Anual</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-5 text-slate-600 pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {/* Placeholder to keep grid balanced if needed, or we can just use 1 col above */}
                    </div>
                  </div>

                   {/* Condition */}
                   <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Condición de desbloqueo</p>
                    <div className="bg-[#0d0d0d] p-5 rounded-2xl border border-white/5 focus-within:border-[#ffcc00]/50 transition-all">
                      <textarea 
                        required
                        placeholder="Ej: Completar racha de 7 días, Lograr objetivo de ventas..."
                        value={newReward.condition}
                        onChange={(e) => setNewReward({ ...newReward, condition: e.target.value })}
                        className="bg-transparent w-full text-sm text-slate-300 font-medium outline-none placeholder:text-slate-800 min-h-[80px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-black/20 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit"
                    className="flex-1 bg-[#ffcc00] text-black h-16 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ffcc00]/10"
                  >
                    {editingReward ? 'Guardar Cambios' : 'Crear Premio'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/5 text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleSummary({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#ffcc00]" />
      <span className="text-sm font-bold text-white uppercase tracking-widest">{label}</span>
    </div>
  );
}

interface RewardCardProps {
  reward: Reward;
  pointsAvailable: number;
  onClaim: () => void;
  onEdit: () => void;
  onDelete: () => void;
  key?: string;
}

function RewardCard({ reward, pointsAvailable, onClaim, onEdit, onDelete }: RewardCardProps) {
  const cost = reward.costXP || (reward.type === 'pequeña' ? 200 : 1000);
  const canAfford = pointsAvailable >= cost;
  const isClaimed = reward.status === 'reclamada';

  return (
    <div className={`p-6 rounded-[32px] flex flex-col h-full bg-white/[0.02] border border-white/5 transition-all relative group ${isClaimed ? 'opacity-40 grayscale-[0.5]' : 'hover:bg-white/[0.04] hover:border-white/10 hover:translate-y-[-4px]'}`}>
      {/* Top right action buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isClaimed && (
          <>
            <button 
              onClick={onEdit} 
              className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-slate-400 hover:text-white transition-all border border-white/5 backdrop-blur-md"
              title="Editar"
            >
              <Edit2 size={10} />
            </button>
            <button 
              onClick={onDelete} 
              className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-white/5 backdrop-blur-md"
              title="Eliminar"
            >
              <Trash2 size={10} />
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-5 flex-1">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-xl transition-transform ${isClaimed ? 'bg-slate-900 text-slate-700' : 'bg-gradient-to-br from-[#222] to-[#111] text-[#ffcc00] border border-white/5'}`}>
          <Gift size={28} className={`${!isClaimed && 'animate-pulse'}`} />
          {!isClaimed && canAfford && (
             <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ffcc00] rounded-full shadow-[0_0_10px_rgba(255,204,0,0.8)] border-2 border-[#111]" />
          )}
        </div>

        <div className="space-y-3">
           <div className="flex flex-wrap items-center gap-2">
             <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded ${reward.type === 'grande' ? 'bg-pink-500/10 text-pink-500' : 'bg-[#ffcc00]/10 text-[#ffcc00]'}`}>
               {reward.type === 'grande' ? '💎 Elite' : '🌟 Lite'}
             </span>
             {reward.category && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-lg">
                  {reward.category}
                </span>
             )}
           </div>
           
           <div>
             <h4 className="text-xl font-black text-white leading-tight tracking-tight mb-2 uppercase">{reward.reward}</h4>
             <p className="text-sm text-slate-400 font-medium italic leading-relaxed line-clamp-3">"{reward.condition}"</p>
           </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-white/5">
        <button 
          disabled={!canAfford || isClaimed}
          onClick={onClaim}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
            isClaimed 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
            : canAfford 
              ? 'bg-[#ffcc00] text-black hover:shadow-[0_10px_20px_rgba(255,204,0,0.15)]'
              : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
          }`}
        >
          {isClaimed ? (
            <>
              <CheckCircle2 size={14} />
              <span>Adquirido</span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span>{canAfford ? 'Reclamar' : 'XP Insuficiente'}</span>
              <span className="opacity-40 text-[9px]">• {cost} XP</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
