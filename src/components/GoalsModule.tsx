import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronLeft, ChevronRight, X, Info, Type, Calendar, CheckSquare, BarChart2, Briefcase, Star, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Goal, GoalCategory, Priority, GoalHorizon, GoalStatus, Habit } from '../types';

interface GoalsModuleProps {
  goals: Goal[];
  habits: Habit[];
  activeDate: Date;
  areas: string[];
  onAddArea: (area: string) => void;
  onAddGoal: (goal: Goal) => void;
}

export default function GoalsModule({ goals, habits, activeDate, areas, onAddArea, onAddGoal }: GoalsModuleProps) {
  const [activePeriod, setActivePeriod] = useState<'trimestre' | 'año'>('trimestre');
  const [viewYear, setViewYear] = useState(2026);
  const [viewQuarter, setViewQuarter] = useState(2);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  
  // Modal form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    period: "'26 Q2",
    type: 'completable' as 'completable' | 'progreso',
    area: areas[0] || 'Trabajo',
    activityId: '',
    startValue: '0',
    targetValue: '100'
  });

  const [showNewAreaInput, setShowNewAreaInput] = useState(false);
  const [customArea, setCustomArea] = useState('');

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'NEW') {
      setShowNewAreaInput(true);
      setNewGoal({ ...newGoal, area: '' });
    } else {
      setShowNewAreaInput(false);
      setNewGoal({ ...newGoal, area: e.target.value });
    }
  };

  const handleCustomAreaBlur = () => {
    if (customArea.trim()) {
      onAddArea(customArea.trim());
      setNewGoal({ ...newGoal, area: customArea.trim() });
      setShowNewAreaInput(false);
      setCustomArea('');
    } else if (!newGoal.area) {
      setShowNewAreaInput(false);
      setNewGoal({ ...newGoal, area: areas[0] || 'Trabajo' });
    }
  };

  const [pickerState, setPickerState] = useState({
    type: 'trimestre' as 'trimestre' | 'año',
    year: 2026,
    quarter: 2
  });

  const getPeriodLabel = () => {
    const shortYear = viewYear.toString().slice(-2);
    if (activePeriod === 'trimestre') {
      return `Año '${shortYear} Q${viewQuarter}`;
    }
    return `Año '${shortYear}`;
  };

  const handlePrevPeriod = () => {
    if (activePeriod === 'trimestre') {
      if (viewQuarter === 1) {
        setViewQuarter(4);
        setViewYear(viewYear - 1);
      } else {
        setViewQuarter(viewQuarter - 1);
      }
    } else {
      setViewYear(viewYear - 1);
    }
  };

  const handleNextPeriod = () => {
    if (activePeriod === 'trimestre') {
      if (viewQuarter === 4) {
        setViewQuarter(1);
        setViewYear(viewYear + 1);
      } else {
        setViewQuarter(viewQuarter + 1);
      }
    } else {
      setViewYear(viewYear + 1);
    }
  };

  const handleAddGoal = () => {
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      objective: newGoal.name,
      category: newGoal.area,
      horizon: activePeriod === 'trimestre' ? GoalHorizon.ONE_QUARTER : GoalHorizon.ONE_YEAR,
      metric: newGoal.type === 'completable' ? 'Completitud' : 'Progreso',
      targetValue: '100%',
      deadline: activePeriod === 'trimestre' ? '2026-06-30' : '2026-12-31',
      progress: 0,
      priority: Priority.MEDIA,
      status: GoalStatus.EN_PROGRESO,
      impactOnBusiness: newGoal.activityId, // habit ID
      description: newGoal.description,
      period: newGoal.period
    };
    onAddGoal(goal);
    setShowAddModal(false);
    setNewGoal({ 
      name: '', 
      description: '', 
      period: getPeriodLabel().replace('Trimestre ', '').replace('Año ', ''), 
      type: 'completable', 
      area: areas[0] || 'Trabajo', 
      activityId: '',
      startValue: '0',
      targetValue: '100'
    });
  };

  const getGoalProgress = (goal: Goal) => {
    if (goal.impactOnBusiness) { // Linked habit ID
      const habit = habits.find(h => h.id === goal.impactOnBusiness);
      if (habit) {
        const today = activeDate;
        let completions = 0;
        let target = 0;

        if (activePeriod === 'trimestre') {
          // Current week progress for quarter goals
          const day = today.getDay() || 7;
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - day + 1);
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          
          completions = habit.completedDates.filter(d => {
            const dDate = new Date(d);
            return dDate >= startOfWeek && dDate <= endOfWeek;
          }).length;
          target = habit.targetCount;
        } else {
          // Annual progress (all completions in the year / total target for the year)
          const yearStart = new Date(viewYear, 0, 1);
          const yearEnd = new Date(viewYear, 11, 31);
          
          completions = habit.completedDates.filter(d => {
            const dDate = new Date(d);
            return dDate >= yearStart && dDate <= yearEnd;
          }).length;
          
          // Estimate target: weekly target * weeks elapsed or weeks in year
          const weeksInYear = 52;
          target = habit.targetCount * weeksInYear; 
        }
        
        return target > 0 ? Math.min(Math.round((completions / target) * 100), 100) : 0;
      }
    }
    return goal.progress;
  };

  const currentPeriodKey = getPeriodLabel().replace('Trimestre ', '').replace('Año ', '');
  const filteredGoals = goals.filter(g => {
    // If goal has a period property, use it. Otherwise, match by horizon
    const gPeriod = (g as any).period || (g.horizon === GoalHorizon.ONE_YEAR ? `'${viewYear.toString().slice(-2)}` : `'${viewYear.toString().slice(-2)} Q${viewQuarter}`);
    return gPeriod === currentPeriodKey;
  });

  return (
    <div className="bg-[#0a0a0a] min-h-[calc(100vh-5rem)] p-4 sm:p-6 text-white font-sans relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-3xl font-black tracking-tighter">Objetivos</h2>
        <button 
          onClick={() => {
            const label = getPeriodLabel();
            setNewGoal({
              ...newGoal,
              period: label.replace('Trimestre ', '').replace('Año ', '')
            });
            setShowAddModal(true);
          }}
          className="w-12 h-12 bg-[#ffcc00] rounded-2xl flex items-center justify-center text-black hover:scale-105 transition-all shadow-[0_8px_20px_rgba(255,204,0,0.3)] group active:scale-95"
        >
          <Plus size={28} className="stroke-[3px] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <button 
          onClick={handlePrevPeriod}
          className="text-[#ffcc00] hover:scale-110 transition-transform p-1"
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-2xl font-black tracking-tighter text-white min-w-[140px] text-center">
          {activePeriod === 'trimestre' ? `Año '${viewYear.toString().slice(-2)} Q${viewQuarter}` : `Año '${viewYear.toString().slice(-2)}`}
        </h3>
        <button 
          onClick={handleNextPeriod}
          className="text-[#ffcc00] hover:scale-110 transition-transform p-1"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div className="w-full max-w-xl mx-auto bg-[#1a1310]/40 rounded-[40px] p-2 border border-white/5 backdrop-blur-sm shadow-2xl">
        {filteredGoals.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-lg font-bold tracking-tight mb-8">No hay objetivos activos</p>
            <button 
              onClick={() => {
                const label = getPeriodLabel();
                setNewGoal({
                  ...newGoal,
                  period: label.replace('Trimestre ', '').replace('Año ', '')
                });
                setShowAddModal(true);
              }}
              className="flex items-center gap-3 text-[#ffcc00] text-lg font-black tracking-tighter hover:scale-105 transition-all"
            >
              <Plus size={24} className="stroke-[3px]" />
              Añadir objetivo
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredGoals.map(goal => {
              const progress = getGoalProgress(goal);
              const habit = habits.find(h => h.id === goal.impactOnBusiness);
              return (
                <div key={goal.id} className="bg-[#1a1a1a]/40 p-4 sm:p-5 rounded-[32px] flex items-start gap-4 group transition-all relative">
                  {/* Progress Box */}
                  <div className="w-14 h-12 rounded-xl bg-[#2a2a2a]/80 border border-white/5 flex items-center justify-center shrink-0 mt-1 shadow-inner">
                    <span className="text-sm font-black text-slate-100">{progress}%</span>
                  </div>

                  {/* Goal Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-start gap-2 mb-2 pr-8">
                      <span className="text-xl shrink-0 mt-0.5">{habit?.icon || '🎯'}</span>
                      <h4 className="font-bold text-base text-slate-100 uppercase tracking-tight leading-tight line-clamp-2">
                        {goal.objective}
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[#ff9566] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-[#ff9566]/20 bg-[#ff9566]/5">
                        Crecimiento
                      </span>
                      {goal.impactOnBusiness && (
                        <span className="text-[#ffcc00] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-[#ffcc00]/20 bg-[#ffcc00]/5">
                          1 actividad
                        </span>
                      )}
                    </div>

                    {goal.description && (
                      <p className="text-slate-500 text-[11px] font-medium leading-relaxed mt-2 border-t border-white/5 pt-2 italic">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  {/* Options */}
                  <button className="absolute top-4 right-4 p-2 text-slate-700 hover:text-[#ffcc00] transition-colors rounded-xl">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              );
            })}
            
            {/* Add Goal Button at bottom of list */}
            <button 
              onClick={() => {
                const label = getPeriodLabel();
                setNewGoal({
                  ...newGoal,
                  period: label.replace('Trimestre ', '').replace('Año ', '')
                });
                setShowAddModal(true);
              }}
              className="w-full flex items-center gap-4 p-6 text-[#ffcc00] text-lg font-black tracking-tighter hover:bg-[#ffcc00]/5 transition-all rounded-[32px] group"
            >
              <div className="p-1 rounded-lg border-2 border-[#ffcc00]/20 group-hover:border-[#ffcc00]/40">
                <Plus size={20} className="stroke-[3px]" />
              </div>
              Añadir objetivo
            </button>
          </div>
        )}
      </div>

      {/* Bottom Toggle */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center lg:left-64 z-30">
        <div className="bg-[#141414] p-1 rounded-2xl flex border border-white/10 shadow-2xl">
          <button 
            onClick={() => setActivePeriod('trimestre')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activePeriod === 'trimestre' ? 'bg-[#ffcc00] text-black shadow-lg scale-105' : 'text-slate-400'}`}
          >
            Trimestre
          </button>
          <button 
            onClick={() => setActivePeriod('año')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activePeriod === 'año' ? 'bg-[#ffcc00] text-black shadow-lg scale-105' : 'text-slate-400'}`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setShowHabitPicker(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) {
                  setShowAddModal(false);
                  setShowHabitPicker(false);
                }
              }}
              className="relative w-full max-w-lg bg-[#141414] rounded-t-[40px] sm:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Handle bar for mobile */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
              
              <div className="p-6 pt-2 sm:p-10 overflow-y-auto flex-1">
                <div className="mb-8">
                  <p className="text-[#ffcc00] text-sm font-black uppercase tracking-[0.2em] mb-2 px-1">Nuevo Objetivo</p>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Nombre del objetivo"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="w-full bg-transparent text-3xl font-black tracking-tighter placeholder:text-slate-800 outline-none"
                  />
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5">
                    <Type size={20} className="text-slate-600" />
                    <input 
                      type="text"
                      placeholder="Añadir descripción..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      className="bg-transparent flex-1 text-sm outline-none placeholder:text-slate-600 font-bold"
                    />
                  </div>

                  {/* Period */}
                  <div className="relative">
                    <button 
                      onClick={() => {
                        // Initialize picker state from current goal period or default
                        setPickerState({
                          type: activePeriod,
                          year: viewYear,
                          quarter: viewQuarter
                        });
                        setShowPeriodPicker(!showPeriodPicker);
                      }}
                      className="w-full flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5"
                    >
                      <Calendar size={20} className="text-[#ffcc00] opacity-60" />
                      <span className="text-sm font-black text-slate-100 tracking-tight">{newGoal.period}</span>
                    </button>

                    <AnimatePresence>
                      {showPeriodPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute z-50 top-full left-0 mt-2 w-64 bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl p-4"
                        >
                          <div className="flex bg-[#0f0f0f] rounded-xl p-1 mb-4">
                            <button 
                              onClick={() => setPickerState({ ...pickerState, type: 'trimestre' })}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${pickerState.type === 'trimestre' ? 'bg-[#ffcc00] text-black shadow-lg' : 'text-slate-500'}`}
                            >
                              Trimestre
                            </button>
                            <button 
                              onClick={() => setPickerState({ ...pickerState, type: 'año' })}
                              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${pickerState.type === 'año' ? 'bg-[#ffcc00] text-black shadow-lg' : 'text-slate-500'}`}
                            >
                              Año
                            </button>
                          </div>

                          <div className="flex items-center justify-between px-2 mb-6">
                            <button 
                              onClick={() => {
                                if (pickerState.type === 'trimestre') {
                                  if (pickerState.quarter === 1) {
                                    setPickerState({ ...pickerState, quarter: 4, year: pickerState.year - 1 });
                                  } else {
                                    setPickerState({ ...pickerState, quarter: pickerState.quarter - 1 });
                                  }
                                } else {
                                  setPickerState({ ...pickerState, year: pickerState.year - 1 });
                                }
                              }}
                              className="text-[#ffcc00] p-1 bg-white/5 rounded-lg"
                            >
                              <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-black text-white">
                              {pickerState.type === 'trimestre' ? `'${pickerState.year.toString().slice(-2)} Q${pickerState.quarter}` : `'${pickerState.year.toString().slice(-2)}`}
                            </span>
                            <button 
                              onClick={() => {
                                if (pickerState.type === 'trimestre') {
                                  if (pickerState.quarter === 4) {
                                    setPickerState({ ...pickerState, quarter: 1, year: pickerState.year + 1 });
                                  } else {
                                    setPickerState({ ...pickerState, quarter: pickerState.quarter + 1 });
                                  }
                                } else {
                                  setPickerState({ ...pickerState, year: pickerState.year + 1 });
                                }
                              }}
                              className="text-[#ffcc00] p-1 bg-white/5 rounded-lg"
                            >
                              <ChevronRight size={20} />
                            </button>
                          </div>

                          <button 
                            onClick={() => {
                              const label = pickerState.type === 'trimestre' 
                                ? `'${pickerState.year.toString().slice(-2)} Q${pickerState.quarter}`
                                : `'${pickerState.year.toString().slice(-2)}`;
                              setNewGoal({ ...newGoal, period: label });
                              setShowPeriodPicker(false);
                            }}
                            className="w-full bg-[#ffcc00] text-black py-3 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-[#ffcc00]/20"
                          >
                            Establecer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Type Selector */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-[#0d0d0d] p-1.5 rounded-2xl border border-white/5">
                      <div className="p-2.5">
                        <CheckSquare size={20} className="text-green-500 opacity-60" />
                      </div>
                      <div className="flex flex-1 p-1 gap-1">
                        <button 
                          onClick={() => setNewGoal({...newGoal, type: 'completable'})}
                          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${newGoal.type === 'completable' ? 'bg-[#222] text-white shadow-inner' : 'text-slate-600'}`}
                        >
                          Completable
                        </button>
                        <button 
                          onClick={() => setNewGoal({...newGoal, type: 'progreso'})}
                          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${newGoal.type === 'progreso' ? 'bg-[#222] text-white shadow-inner' : 'text-slate-600'}`}
                        >
                          Progreso
                        </button>
                      </div>
                      <button className="px-3 py-1 text-slate-500 hover:text-white transition-colors">
                        <Info size={16} />
                      </button>
                    </div>

                    {/* Progress Ranges */}
                    {newGoal.type === 'progreso' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-1"
                      >
                        <div className="flex-1 flex bg-[#0d0d0d] rounded-xl border border-white/5 overflow-hidden">
                          <div className="bg-white/5 px-3 py-3 text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">Inicio</div>
                          <input 
                            type="number"
                            value={newGoal.startValue}
                            onChange={(e) => setNewGoal({...newGoal, startValue: e.target.value})}
                            className="bg-transparent flex-1 py-3 px-3 outline-none text-white font-bold text-sm text-right"
                          />
                        </div>
                        <ChevronRight size={16} className="text-slate-600" />
                        <div className="flex-1 flex bg-[#0d0d0d] rounded-xl border border-white/5 overflow-hidden">
                          <div className="bg-white/5 px-3 py-3 text-sm font-black text-slate-500 uppercase tracking-widest flex items-center">Objetivo</div>
                          <input 
                            type="number"
                            value={newGoal.targetValue}
                            onChange={(e) => setNewGoal({...newGoal, targetValue: e.target.value})}
                            className="bg-transparent flex-1 py-3 px-3 outline-none text-white font-bold text-sm text-right"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Life Area */}
                  <div className="space-y-2">
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest px-2">Área de vida</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border border-white/5 relative">
                        <Briefcase size={20} className="text-orange-500 opacity-60" />
                        <select 
                          value={showNewAreaInput ? 'NEW' : newGoal.area}
                          onChange={handleAreaChange}
                          className="bg-[#0d0d0d] flex-1 text-sm outline-none font-bold appearance-none cursor-pointer"
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

                  {/* Link Activity */}
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowHabitPicker(!showHabitPicker)}
                      className={`w-full flex items-center gap-4 bg-[#0d0d0d] p-4 rounded-2xl border transition-all ${newGoal.activityId ? 'border-[#ffcc00]/40 text-[#ffcc00]' : 'border-white/5 text-slate-600'}`}
                    >
                      <Star size={20} className={newGoal.activityId ? 'fill-[#ffcc00]/20' : ''} />
                      <span className="text-sm font-bold">
                        {newGoal.activityId ? habits.find(h => h.id === newGoal.activityId)?.habit : 'Vincular actividad'}
                      </span>
                    </button>
                    
                    <AnimatePresence>
                      {showHabitPicker && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-[#0d0d0d] rounded-2xl border border-white/5"
                        >
                          <div className="p-2 space-y-1">
                            {habits.map(habit => (
                              <button
                                key={habit.id}
                                onClick={() => {
                                  setNewGoal({...newGoal, activityId: habit.id});
                                  setShowHabitPicker(false);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${newGoal.activityId === habit.id ? 'bg-[#ffcc00] text-black' : 'text-slate-400 hover:bg-white/5'}`}
                              >
                                <span>{habit.icon}</span>
                                <span>{habit.habit}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => {
                                setNewGoal({...newGoal, activityId: ''});
                                setShowHabitPicker(false);
                              }}
                              className="w-full text-left p-3 text-sm text-slate-600 font-bold uppercase tracking-widest hover:text-white"
                            >
                              Ninguna
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-4 mt-10 pb-4">
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setShowHabitPicker(false);
                    }}
                    className="flex-1 py-5 text-sm font-black text-slate-400 tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleAddGoal}
                    disabled={!newGoal.name}
                    className="flex-1 bg-[#ffcc00] text-black py-5 rounded-[24px] text-sm font-black uppercase tracking-tighter shadow-xl active:scale-95 disabled:opacity-30 transition-all"
                  >
                    Guardar
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
