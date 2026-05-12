import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, Calendar, Info, TrendingUp, MoreHorizontal, ChevronLeft, Pencil, Check, Plus } from 'lucide-react';

import { Habit } from '../types';

interface TodayViewProps {
  activeDate: Date;
  setActiveDate: (date: Date) => void;
  habits: Habit[];
  onToggleDate: (habitId: string, date: Date, increment?: number) => void;
  onCompleteToday: (habitId: string, date: Date) => void;
  onHabitClick: (habit: Habit) => void;
}

export default function TodayView({ 
  activeDate, 
  setActiveDate, 
  habits, 
  onToggleDate, 
  onCompleteToday, 
  onHabitClick 
}: TodayViewProps) {
  const [activeSegment, setActiveSegment] = useState<'actividades' | 'perspectivas'>('actividades');
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate the 7 days strip starting from Sunday of the week containing centerDate
  const getDatesStrip = (centerDate: Date) => {
    const dates = [];
    const dayOfWeek = centerDate.getDay(); // 0 is Sunday
    const startOfWeek = new Date(centerDate);
    startOfWeek.setDate(centerDate.getDate() - dayOfWeek);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const datesStrip = getDatesStrip(activeDate);

  const calculateRemaining = (date: Date) => {
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - date.getDay()));
    const weekDiff = Math.ceil((endOfWeek.getTime() - date.getTime()) / 86400000) + 1;

    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const monthDiff = Math.ceil((endOfMonth.getTime() - date.getTime()) / 86400000) + 1;

    const currentTrimesterEndMonth = Math.floor(date.getMonth() / 3) * 3 + 2;
    const endOfTrimester = new Date(date.getFullYear(), currentTrimesterEndMonth + 1, 0);
    const trimDiff = Math.ceil((endOfTrimester.getTime() - date.getTime()) / 86400000) + 1;

    const endOfYear = new Date(date.getFullYear(), 11, 31);
    const yearDiff = Math.ceil((endOfYear.getTime() - date.getTime()) / 86400000) + 1;

    return { week: weekDiff, month: monthDiff, trimester: trimDiff, year: yearDiff };
  };

  const stats = calculateRemaining(activeDate);

  const formatDate = (date: Date) => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const fullMonths = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    return `${fullMonths[date.getMonth()]} ${date.getDate()}, ${days[date.getDay()]} (hoy)`;
  };

  return (
    <div className="bg-[#0a0a0a] min-h-[calc(100vh-5rem)] p-6 text-white font-sans relative">
      {/* Date Header */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex justify-between flex-1 mr-4">
          {datesStrip.map((date, idx) => {
            const isSelected = date.toDateString() === activeDate.toDateString();
            return (
              <button
                key={idx}
                onClick={() => setActiveDate(new Date(date))}
                className={`
                  w-11 h-11 flex flex-col items-center justify-center rounded-xl transition-all
                  ${isSelected ? 'bg-[#ffcc00] text-black scale-105 shadow-lg shadow-yellow-500/30' : 'bg-[#1a1a1a] text-slate-400'}
                `}
              >
                <span className="text-sm font-black uppercase tracking-tighter mb-0.5 leading-none">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]}
                </span>
                <span className="text-sm font-black leading-none">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button 
          onClick={() => setShowCalendar(true)}
          className="w-11 h-11 flex items-center justify-center bg-[#1a1a1a] rounded-xl text-[#ffcc00] shadow-lg border border-white/5 active:scale-95 transition-all"
        >
          <Calendar size={20} />
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="text-2xl font-black text-[#ffcc00] tracking-tighter capitalize drop-shadow-sm">{formatDate(activeDate).replace('(hoy)', '')}</p>
        <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Hoy</p>
      </div>

      {/* Segmented Control */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#1a1a1a] p-1 rounded-2xl flex border border-white/5 shadow-inner">
          <button 
            onClick={() => setActiveSegment('actividades')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSegment === 'actividades' ? 'bg-[#ffcc00] text-black shadow-lg scale-105' : 'text-slate-400'}`}
          >
            Actividades
          </button>
          <button 
            onClick={() => setActiveSegment('perspectivas')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSegment === 'perspectivas' ? 'bg-[#ffcc00] text-black shadow-lg scale-105' : 'text-slate-400'}`}
          >
            Perspectivas
          </button>
        </div>
      </div>

      {/* Activities Section - ONLY in Actividades tab */}
      {activeSegment === 'actividades' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-slate-300">Crecimiento</h3>
            <button className="text-[#ffcc00] text-sm font-black uppercase tracking-widest bg-[#ffcc00]/10 px-3 py-1.5 rounded-lg border border-[#ffcc00]/20 flex items-center gap-1.5 hover:bg-[#ffcc00]/20 transition-all">
              <Pencil size={10} />
              Editar
            </button>
          </div>
          
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                datesStrip={datesStrip}
                activeDate={activeDate}
                onClick={() => onHabitClick(habit)} 
                onToggleDate={(date, inc) => onToggleDate(habit.id, date, inc)}
                onComplete={() => onCompleteToday(habit.id, activeDate)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stats and Weekly Score - ONLY in Perspectivas tab */}
      {activeSegment === 'perspectivas' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Semana: Quedan" value={`${stats.week} días`} />
            <StatCard label="Mes: Quedan" value={`${stats.month} días`} />
            <StatCard label="Trimestre: Quedan" value={`${stats.trimester} días`} />
            <StatCard label="Año: Quedan" value={`${stats.year} días`} />
          </div>

          {/* Weekly Score Card */}
          <div className="bg-[#1a1a1a] p-6 rounded-3xl text-center border border-white/5 shadow-xl">
            <p className="text-xl font-bold mb-2 tracking-tight text-white">Semana '26 S20</p>
            <p className="text-slate-400 text-sm mb-6">may 10 - may 16</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-[#ffcc00] text-2xl font-black">g</span>
              <p className="text-[#ffcc00] font-black text-lg tracking-tight uppercase">Puntuación semanal</p>
            </div>
            
            <div className="w-full bg-[#0a0a0a] h-11 rounded-xl relative overflow-hidden border border-white/5 shadow-inner">
               <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-black text-sm z-10">0%</div>
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '0%' }}
                className="h-full bg-[#ffcc00]/30"
               />
            </div>
          </div>
        </motion.div>
      )}

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <CalendarPopup 
            onClose={() => setShowCalendar(false)} 
            selectedDate={activeDate} 
            onSelectDate={setActiveDate} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarPopup({ onClose, selectedDate, onSelectDate }: { onClose: () => void, selectedDate: Date, onSelectDate: (d: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const prevMonthDaysStrip = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      prevMonthDaysStrip.push({ day: prevMonthLastDay - i, currentMonth: false, date: new Date(year, month - 1, prevMonthLastDay - i) });
    }
    
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
    }
    
    const totalDays = [...prevMonthDaysStrip, ...currentMonthDays];
    const remaining = 42 - totalDays.length;
    for (let i = 1; i <= remaining; i++) {
      totalDays.push({ day: i, currentMonth: false, date: new Date(year, month + 1, i) });
    }
    
    const weeks = [];
    for (let i = 0; i < totalDays.length; i += 7) {
      weeks.push(totalDays.slice(i, i + 7));
    }
    return weeks;
  };

  const calendarWeeks = generateCalendar();

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#000]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#1a1a1a] w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white">{months[viewDate.getMonth()]}</span>
              <span className="text-xl font-bold text-white">{viewDate.getFullYear()}</span>
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-8 gap-1 mb-4">
            <div className="text-center text-sm font-black text-slate-500 uppercase tracking-tighter">Sem</div>
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
              <div key={d} className="text-center text-sm font-black text-slate-300 uppercase tracking-tighter">{d}</div>
            ))}
          </div>

          {/* Grid Days */}
          <div className="space-y-2">
            {calendarWeeks.map((week, widx) => (
              <div key={widx} className="grid grid-cols-8 gap-1 items-center">
                <div className="text-center text-sm font-bold text-slate-600">
                  {getWeekNumber(week[0].date)}
                </div>
                {week.map((dayObj, didx) => {
                  const isSelected = dayObj.date.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <button
                      key={didx}
                      onClick={() => {
                        if (dayObj.currentMonth) {
                          onSelectDate(dayObj.date);
                          onClose();
                        }
                      }}
                      className={`
                        aspect-square flex items-center justify-center text-sm font-bold rounded-full transition-all
                        ${isSelected ? 'bg-[#ffcc00] text-black shadow-lg shadow-yellow-500/20 scale-110' : ''}
                        ${!dayObj.currentMonth ? 'text-slate-700 pointer-events-none' : isSelected ? '' : 'text-slate-200 hover:bg-white/5'}
                      `}
                    >
                      {dayObj.day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
      <p className="text-sm text-slate-400 font-medium leading-tight mb-1">{label}</p>
      <p className="text-base font-bold text-slate-200">{value}</p>
    </div>
  );
}

interface HabitCardProps {
  habit: Habit;
  datesStrip: Date[];
  activeDate: Date;
  onClick: () => void;
  onToggleDate: (date: Date, increment?: number) => void;
  onComplete: () => void;
  key?: string;
}

function HabitCard({ habit, datesStrip, activeDate, onClick, onToggleDate, onComplete }: HabitCardProps) {
  const isTodayCompleted = habit.completedDates.includes(activeDate.toDateString());
  const completedCountForWeek = datesStrip.filter(d => habit.completedDates.includes(d.toDateString())).length;
  const currentDailyCount = habit.completions?.[activeDate.toDateString()] || 0;
  const dailyGoal = habit.dailyGoal || 1;
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(customVal);
    if (!isNaN(val) && val > 0) {
      onToggleDate(activeDate, val);
    }
    setCustomVal('');
    setShowCustom(false);
  };

  return (
    <div 
      className="bg-[#1a1a1a] p-5 rounded-3xl border border-white/5 flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-all"
    >
      {/* Icon Area - Click to open detail */}
      <div 
        onClick={onClick}
        className="w-14 h-14 bg-[#2a2a2a] rounded-2xl flex items-center justify-center relative cursor-pointer"
      >
        <Star size={24} className="text-[#ffcc00] fill-[#ffcc00]" />
        <span className="absolute -top-1 -right-1 text-base">{habit.icon}</span>
      </div>

      {/* Info Area */}
      <div className="flex-1">
        <div onClick={onClick} className="flex items-center gap-2 mb-0.5 cursor-pointer group/title">
          <h4 className="font-bold text-lg text-slate-200 group-hover/title:text-white transition-colors">{habit.habit}</h4>
          <Pencil size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-slate-400 text-sm font-medium mb-2">
          {habit.trackingUnit === 'times' 
            ? `${currentDailyCount} / ${dailyGoal} hoy` 
            : habit.trackingUnit === 'duration'
              ? `${currentDailyCount} / ${dailyGoal} min hoy`
              : `${completedCountForWeek} / ${habit.targetCount} días por semana`}
        </p>
        
        {/* Progress Dots - Interactive */}
        <div className="flex gap-2">
          {datesStrip.map((date, i) => {
            const isCompleted = habit.completedDates.includes(date.toDateString());
            const isCurrentInStrip = date.toDateString() === activeDate.toDateString();
            
            return (
              <button 
                key={i} 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDate(date);
                }}
                className={`w-4 h-4 rounded-md ring-1 transition-all
                  ${isCompleted ? 'bg-[#ffcc00] shadow-[0_0_12px_rgba(255,204,0,0.3)] scale-110 ring-[#ffcc00]' : 'bg-transparent ring-[#3a3a3a] hover:bg-white/5'}
                  ${isCurrentInStrip && !isCompleted ? 'ring-[#ffcc00]/50' : ''}
                `} 
              />
            );
          })}
        </div>
      </div>

      {/* Action Area - Checkbox or Multi-Buttons */}
      <div className="flex items-center gap-2">
         {habit.trackingUnit === 'times' || habit.trackingUnit === 'duration' ? (
           <div className="flex items-center gap-1.5">
             <AnimatePresence mode="wait">
               {!showCustom ? (
                 <motion.div 
                   key="buttons"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex items-center gap-1.5"
                 >
                   {habit.trackingUnit === 'times' 
                     ? Array.from({ length: Math.min(dailyGoal, 3) }).map((_, i) => (
                         <button
                           key={i}
                           onClick={(e) => {
                             e.stopPropagation();
                             onToggleDate(activeDate, 1);
                           }}
                           className={`w-8 h-8 rounded-xl text-sm font-black transition-all flex items-center justify-center
                             ${currentDailyCount > i ? 'bg-[#ffcc00] text-black shadow-lg shadow-yellow-500/20 scale-105' : 'bg-[#2a2a2a] text-slate-500 border border-white/5'}
                           `}
                         >
                           {i + 1}
                         </button>
                       ))
                     : [30].map((mins) => (
                         <button
                           key={mins}
                           onClick={(e) => {
                             e.stopPropagation();
                             onToggleDate(activeDate, mins);
                           }}
                           className={`px-3 py-1.5 rounded-lg text-sm font-black transition-all border border-white/5
                             ${currentDailyCount >= mins ? 'bg-[#ffcc00]/20 text-[#ffcc00]' : 'bg-[#1a1a1a] text-slate-500'}
                           `}
                         >
                           +{mins}m
                         </button>
                       ))
                   }
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowCustom(true);
                     }}
                     className="w-8 h-8 rounded-xl bg-[#2a2a2a] text-[#ffcc00] flex items-center justify-center border border-white/5 hover:border-[#ffcc00]/30 transition-all"
                   >
                     <Plus size={14} />
                   </button>
                 </motion.div>
               ) : (
                 <motion.form 
                   key="input"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   onSubmit={handleCustomSubmit}
                   className="flex items-center gap-1"
                   onClick={(e) => e.stopPropagation()}
                 >
                   <input 
                     autoFocus
                     type="number"
                     value={customVal}
                     onChange={(e) => setCustomVal(e.target.value)}
                     onBlur={() => handleCustomSubmit()}
                     className="w-20 bg-[#0a0a0a] border border-[#ffcc00]/30 rounded-lg py-1 px-2 text-sm font-bold focus:outline-none focus:border-[#ffcc00] text-[#ffcc00]"
                     placeholder={habit.trackingUnit === 'times' ? 'Cant.' : 'Mins...'}
                   />
                   <button 
                     type="button"
                     onClick={() => setShowCustom(false)}
                     className="p-1 text-slate-500"
                   >
                     <ChevronLeft size={16} />
                   </button>
                 </motion.form>
               )}
             </AnimatePresence>
           </div>
         ) : (
           <button 
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isTodayCompleted ? 'bg-[#ffcc00] scale-110' : 'bg-[#2a2a2a] border border-white/10 hover:border-[#ffcc00]/50'}`}
            >
              {isTodayCompleted ? (
                <Check size={22} className="text-black stroke-[4px]" />
              ) : (
                <div className="w-5 h-5 rounded-lg bg-[#3a3a3a] group-hover:bg-[#4a4a4a]" />
              )}
           </button>
         )}
      </div>
    </div>
  );
}
