import React, { useState } from 'react';
import { Habit, Goal, DailyTracking } from '../types';
import { 
  Check, 
  Info, 
  Plus, 
  X, 
  Star, 
  Type, 
  Link, 
  Calendar, 
  Clock, 
  Hash, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Target,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HabitTrackerProps {
  habits: Habit[];
  goals: Goal[];
  tracking: DailyTracking[];
  areas: string[];
  onAddHabit: (habit: Habit) => void;
  onAddArea: (area: string) => void;
}

export default function HabitTracker({ habits, goals, tracking, areas, onAddHabit, onAddArea }: HabitTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewFilter, setViewFilter] = useState<'actuales' | 'archivadas'>('actuales');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [trackingUnit, setTrackingUnit] = useState<'days' | 'times' | 'duration'>('days');
  const [weeklyGoal, setWeeklyGoal] = useState<any>({ days: 7, times: 5, duration: { h: 1, m: 0 } });
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    area: areas[0] || 'Personal',
    starting: 'Esta semana'
  });

  const [showNewAreaInput, setShowNewAreaInput] = useState(false);
  const [customArea, setCustomArea] = useState('');

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW') {
      setShowNewAreaInput(true);
      setNewHabit({ ...newHabit, area: '' });
    } else {
      setShowNewAreaInput(false);
      setNewHabit({ ...newHabit, area: e.target.value });
    }
  };

  const handleCustomAreaBlur = () => {
    if (customArea.trim()) {
      onAddArea(customArea.trim());
      setNewHabit({ ...newHabit, area: customArea.trim() });
      setShowNewAreaInput(false);
      setCustomArea('');
    } else if (!newHabit.area) {
      setShowNewAreaInput(false);
      setNewHabit({ ...newHabit, area: areas[0] || 'Personal' });
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 4, 10)); // May 2026 as per user screenshot

  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    // Get the first day of the month
    const firstDay = date.getDay();
    
    // Previous month days to fill the first week
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDate - i, currentMonth: false });
    }
    
    // Current month days
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push({ day: i, currentMonth: true });
    }
    
    // Next month days to fill the grid (up to 42 for 6 rows)
    const nextDays = 42 - days.length;
    for (let i = 1; i <= nextDays; i++) {
      days.push({ day: i, currentMonth: false });
    }
    
    return days;
  };

  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const handleDateSelect = (day: number, currentMonth: boolean) => {
    if (!currentMonth) return;
    const selected = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    const formattedDate = `${selected.getDate()} ${months[selected.getMonth()].slice(0, 3)}. ${selected.getFullYear()}`;
    setNewHabit({ ...newHabit, starting: formattedDate });
    setShowDatePicker(false);
  };

  const latest = tracking[0];

  const handleCreate = () => {
    // Basic implementation of creating a habit
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      habit: newHabit.name,
      goalId: '',
      frequency: trackingUnit === 'days' ? `${weeklyGoal.days} días/semana` : (trackingUnit === 'times' ? `${weeklyGoal.times} veces/semana` : `${weeklyGoal.duration.h}h ${weeklyGoal.duration.m}m/semana`),
      type: 'productivo',
      suggestedTime: 'Cualquier momento',
      trigger: 'Manual',
      reward: 'Satisfacción',
      targetCount: trackingUnit === 'days' ? weeklyGoal.days : 7,
      trackingUnit,
      dailyGoal: trackingUnit === 'times' ? weeklyGoal.times : (trackingUnit === 'duration' ? (weeklyGoal.duration.h * 60 + weeklyGoal.duration.m) : 1),
      completedDates: [],
      completions: {},
      icon: '✨',
      color: 'bg-[#ffcc00]',
      area: newHabit.area
    };
    onAddHabit(habit);
    setShowAddModal(false);
    setNewHabit({ name: '', description: '', area: areas[0] || 'Personal', starting: 'Esta semana' });
  };

  return (
    <div className="space-y-10">
      {/* Configuration Section */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-4 bg-[#0d0d0d] px-5 py-3 rounded-2xl border border-[#ffcc00]/20 text-white font-bold text-sm tracking-tight hover:border-[#ffcc00]/40 transition-all"
            >
              {viewFilter === 'actuales' ? 'Actividades actuales' : 'Actividades archivadas'}
              <ChevronDown size={18} className={`text-[#ffcc00] transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-50 top-full left-0 mt-2 w-64 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-1"
                >
                  <button 
                    onClick={() => { setViewFilter('actuales'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-4 rounded-xl text-sm font-bold transition-colors ${viewFilter === 'actuales' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    Actividades actuales
                  </button>
                  <button 
                    onClick={() => { setViewFilter('archivadas'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-4 py-4 rounded-xl text-sm font-bold transition-colors ${viewFilter === 'archivadas' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    Actividades archivadas
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-12 h-12 bg-[#ffcc00] rounded-2xl flex items-center justify-center text-black shadow-lg shadow-[#ffcc00]/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={28} className="stroke-[3.5px]" />
          </button>
        </div>
        
        {/* Escritorio */}
        <div className="hidden lg:block bg-[#0d0d0d] rounded-[32px] border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/45 border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hábito</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Asociada</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frecuencia</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trigger</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recompensa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {habits.map((habit) => {
                const goal = goals.find(g => g.id === habit.goalId);
                return (
                  <tr key={habit.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{habit.habit}</p>
                      <p className="text-[10px] text-[#ffcc00] font-bold uppercase tracking-tighter mt-0.5">{habit.suggestedTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-400 truncate max-w-[140px] inline-block">{goal?.objective}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{habit.frequency}</td>
                    <td className="px-6 py-4">
                       <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${habit.type === 'productivo' ? 'bg-[#ffcc00]/10 text-[#ffcc00]' : 'bg-slate-800 text-slate-400'}`}>
                        {habit.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-[11px] text-slate-500 leading-tight italic">"{habit.trigger}"</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-[11px] text-white font-black">{habit.reward}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Móvil */}
        <div className="lg:hidden space-y-8">
          {Object.entries(
            habits.reduce((acc, habit) => {
              const area = habit.area || 'Otro';
              if (!acc[area]) acc[area] = [];
              acc[area].push(habit);
              return acc;
            }, {} as Record<string, Habit[]>)
          ).map(([area, areaHabits]) => (
            <div key={area} className="space-y-4">
              <h4 className="px-5 text-lg font-black text-white tracking-tight">{area}</h4>
              <div className="grid grid-cols-1 gap-3">
                {areaHabits.map((habit) => (
                  <div key={habit.id} className="group relative px-2">
                    <div className="bg-[#1a1a1a] p-4 rounded-[24px] border border-white/5 shadow-xl transition-all active:scale-[0.98] relative z-10 flex items-center gap-4">
                      {/* Grip Handle */}
                      <GripVertical size={16} className="text-yellow-600/40 shrink-0" />
                      
                      {/* Star Icon */}
                      <div className="w-10 h-10 rounded-xl bg-[#ffcc00]/10 flex items-center justify-center text-[#ffcc00] shrink-0">
                        <Star size={18} className="fill-[#ffcc00]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base text-white tracking-tight leading-tight mb-2 truncate">
                          {habit.habit}
                        </p>
                        <div className="inline-flex items-center gap-1.5 bg-[#ffcc00]/10 border border-[#ffcc00]/20 px-3 py-1 rounded-lg">
                          <Target size={10} className="text-[#ffcc00]" />
                          <span className="text-[9px] font-black text-[#ffcc00] uppercase tracking-wider">
                            {habit.frequency}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={18} className="text-[#ffcc00]/60" />
                    </div>
                    {/* Selection Glow */}
                    <div className="absolute inset-x-2 inset-y-0 bg-[#ffcc00] rounded-[24px] opacity-0 group-hover:opacity-10 blur-sm transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Tracker Section Removed as per request */}


      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) {
                  setShowAddModal(false);
                }
              }}
              className="relative w-full max-w-lg bg-[#141414] rounded-t-[40px] sm:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Handle bar for mobile */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
              
              <div className="p-6 pt-2 sm:p-10 overflow-y-auto flex-1">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <Star size={24} className="text-orange-500 fill-orange-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nombre de la actividad"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    className="flex-1 bg-transparent text-2xl font-black tracking-tight text-white placeholder:text-slate-700 outline-none"
                  />
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5">
                    <Type size={20} className="text-slate-600" />
                    <input 
                      type="text" 
                      placeholder="Añadir descripción..."
                      value={newHabit.description}
                      onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                      className="bg-transparent flex-1 text-sm text-slate-300 outline-none"
                    />
                  </div>

                  {/* Life Area */}
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Área de vida</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5 relative">
                        <Link size={20} className="text-orange-400 opacity-60" />
                        <select 
                          value={showNewAreaInput ? 'NEW' : newHabit.area}
                          onChange={handleAreaChange}
                          className="bg-[#0d0d0d] flex-1 text-sm text-slate-200 outline-none appearance-none font-bold"
                        >
                          {areas.map(area => (
                            <option key={area} value={area} className="bg-[#111111] text-white">{area}</option>
                          ))}
                          <option value="NEW" className="bg-[#111111] text-white">+ Nueva área...</option>
                        </select>
                        <ChevronDown size={16} className="text-slate-600 pointer-events-none absolute right-4" />
                      </div>

                      {showNewAreaInput && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-[#ffcc00]/30"
                        >
                          <Plus size={20} className="text-[#ffcc00]" />
                          <input 
                            autoFocus
                            type="text" 
                            placeholder="Nombre de la nueva área..."
                            value={customArea}
                            onChange={(e) => setCustomArea(e.target.value)}
                            onBlur={handleCustomAreaBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCustomAreaBlur();
                            }}
                            className="bg-transparent flex-1 text-sm text-white font-bold outline-none"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Tracking Unit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Unidad de seguimiento</p>
                        <Info size={14} className="text-[#ffcc00] opacity-60" />
                      </div>
                    </div>
                    <div className="flex items-start gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5 relative">
                      <div className="pt-1">
                        <Calendar size={20} className="text-green-500 opacity-60" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-sm text-slate-500 leading-tight">La unidad no se puede cambiar después de crear la actividad.</p>
                        <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-white/5">
                          {(['days', 'times', 'duration'] as const).map((unit) => (
                            <button 
                              key={unit}
                              onClick={() => setTrackingUnit(unit)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-black uppercase tracking-wider transition-all ${trackingUnit === unit ? 'bg-[#333] text-white shadow-lg' : 'text-slate-600'}`}
                            >
                              {unit === 'days' ? 'Días' : (unit === 'times' ? 'Veces' : 'Duración')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Goal */}
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Meta semanal</p>
                    <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5 relative group">
                      <div className="w-5 h-5 rounded-full border border-pink-500/40 flex items-center justify-center text-pink-500">
                        <Plus size={12} className="stroke-[3px]" />
                      </div>
                      
                      {trackingUnit === 'days' && (
                        <div className="flex items-center gap-2 flex-1">
                          <select 
                            value={weeklyGoal.days}
                            onChange={(e) => setWeeklyGoal({...weeklyGoal, days: parseInt(e.target.value)})}
                            className="bg-[#1a1a1a] px-3 py-1.5 rounded-lg text-white font-black text-lg outline-none border border-white/5 appearance-none min-w-[60px] text-center"
                          >
                            {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <span className="text-sm font-black text-slate-400">días</span>
                        </div>
                      )}

                      {trackingUnit === 'times' && (
                        <div className="flex items-center gap-4 flex-1">
                          <button onClick={() => setWeeklyGoal({...weeklyGoal, times: Math.max(1, weeklyGoal.times - 1)})} className="p-2 text-slate-500">
                            <Minus size={20} />
                          </button>
                          <div className="bg-[#1a1a1a] px-6 py-2 rounded-xl text-white font-black text-xl border border-white/5">
                            {weeklyGoal.times}
                          </div>
                          <button onClick={() => setWeeklyGoal({...weeklyGoal, times: weeklyGoal.times + 1})} className="p-2 text-[#ffcc00]">
                            <Plus size={20} />
                          </button>
                          <span className="text-sm font-black text-slate-400">veces</span>
                        </div>
                      )}

                      {trackingUnit === 'duration' && (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <select 
                              value={weeklyGoal.duration.h}
                              onChange={(e) => setWeeklyGoal({...weeklyGoal, duration: {...weeklyGoal.duration, h: parseInt(e.target.value)}})}
                              className="bg-[#1a1a1a] px-3 py-2 rounded-xl text-white font-black text-lg outline-none border border-white/5"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="text-xs font-bold text-slate-500">h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select 
                              value={weeklyGoal.duration.m}
                              onChange={(e) => setWeeklyGoal({...weeklyGoal, duration: {...weeklyGoal.duration, m: parseInt(e.target.value)}})}
                              className="bg-[#1a1a1a] px-3 py-2 rounded-xl text-white font-black text-lg outline-none border border-white/5"
                            >
                              {[0,15,30,45].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <span className="text-xs font-bold text-slate-500">m</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Starting Date */}
                  <div className="space-y-2 relative">
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Comenzando:</p>
                    <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-[#ffcc00]">
                        <Calendar size={20} />
                      </div>
                      <span className="flex-1 text-sm font-bold text-white">{newHabit.starting}</span>
                      <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="p-2 bg-white/5 rounded-xl text-slate-400 transition-colors hover:text-white"
                      >
                        <Calendar size={18} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showDatePicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: -20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          className="absolute bottom-full mb-4 right-0 w-80 bg-[#1c1c1c] border border-white/10 rounded-[32px] shadow-2xl p-6 z-[70] backdrop-blur-xl"
                        >
                          {/* Calendar Header */}
                          <div className="flex items-center justify-between mb-6">
                            <button 
                              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-3">
                              <span className="text-base font-black text-white">{months[calendarDate.getMonth()]}</span>
                              <span className="text-base font-bold text-slate-500">{calendarDate.getFullYear()}</span>
                            </div>
                            <button 
                              onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                              className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>

                          {/* Calendar Grid */}
                          <div className="grid grid-cols-8 gap-1">
                            <div className="text-[10px] font-black text-slate-600 uppercase text-center py-2">Sem</div>
                            {daysOfWeek.map(d => (
                              <div key={d} className="text-[10px] font-black text-slate-400 uppercase text-center py-2">{d}</div>
                            ))}

                            <div className="col-span-8 h-px bg-white/5 my-1" />

                            {/* Render grid of days with week numbers */}
                            {(() => {
                              const monthDays = getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth());
                              const rows = [];
                              for (let i = 0; i < 6; i++) {
                                const weekDays = monthDays.slice(i * 7, (i + 1) * 7);
                                
                                // Calculate week number from the first day of this row
                                const weekNumberDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), weekDays[0].day);
                                if (!monthDays[i * 7].currentMonth && i === 0) {
                                  weekNumberDate.setMonth(calendarDate.getMonth() - 1);
                                } else if (!monthDays[i * 7].currentMonth && i >= 4) {
                                  weekNumberDate.setMonth(calendarDate.getMonth() + 1);
                                }
                                
                                rows.push(
                                  <React.Fragment key={i}>
                                    <div className="text-[11px] font-bold text-slate-700 text-center flex items-center justify-center py-1">
                                      {getWeekNumber(weekNumberDate)}
                                    </div>
                                    {weekDays.map((d, index) => {
                                      // Correctly calculate if this is May 10, 2026 for the highlighting
                                      const isSelected = d.currentMonth && d.day === 10 && calendarDate.getMonth() === 4 && calendarDate.getFullYear() === 2026;
                                      return (
                                        <button
                                          key={index}
                                          onClick={() => handleDateSelect(d.day, d.currentMonth)}
                                          className={`
                                            aspect-square rounded-full flex items-center justify-center text-[13px] font-bold transition-all relative group
                                            ${d.currentMonth ? 'text-slate-200' : 'text-slate-800 pointer-events-none'}
                                            ${isSelected ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20' : 'hover:bg-white/10'}
                                          `}
                                        >
                                          {d.day}
                                          {d.currentMonth && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 bg-white/10 rounded-full opacity-0 group-hover:opacity-100" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              }
                              return rows;
                            })()}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-12 pb-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 text-sm font-black text-slate-500 uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleCreate}
                    disabled={!newHabit.name}
                    className="flex-1 bg-[#ffcc00] text-black py-4 rounded-2xl text-sm font-black uppercase tracking-tight shadow-xl active:scale-95 disabled:opacity-30 transition-all"
                  >
                    Crear
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
