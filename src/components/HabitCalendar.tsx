import React from 'react';
import { DailyTracking, Habit } from '../types';

interface HabitCalendarProps {
  tracking: DailyTracking[];
  habits: Habit[];
}

export default function HabitCalendar({ tracking, habits }: HabitCalendarProps) {
  // Generate mock calendar for May 2026
  const daysInMonth = 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-05-${dayNum.toString().padStart(2, '0')}`;
    const dayData = tracking.find(t => t.date === dateStr);
    const completionRate = dayData ? (dayData.completedHabits.length / habits.length) * 100 : 0;
    
    // Manual overrides for visualization of the color rules
    let mockRate = completionRate;
    if (dayNum === 1) mockRate = 66; // Amarillo
    if (dayNum === 2) mockRate = 100; // Verde
    if (dayNum === 3) mockRate = 33; // Rojo
    if (dayNum === 4) mockRate = 100; // Verde

    return { 
      day: dayNum, 
      rate: mockRate,
      isPerfect: mockRate === 100
    };
  });

  const getColorClass = (rate: number) => {
    if (rate >= 80) return 'bg-[#ffcc00] text-black shadow-[0_0_15px_rgba(255,204,0,0.3)] scale-105 z-10'; 
    if (rate >= 50) return 'bg-[#ffcc00]/30 text-[#ffcc00]';
    if (rate > 0) return 'bg-[#1a1a1a] text-slate-400 border border-white/5';
    return 'bg-transparent text-slate-700 border border-white/5';
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] p-8 rounded-[40px] border border-white/5 shadow-2xl transition-all">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter">Mayo 2026</h3>
            <p className="text-[#ffcc00] text-xs font-black uppercase tracking-[0.2em] mt-2 opacity-60">Mapa de Consistencia HabitFlow</p>
          </div>
          <div className="flex gap-4 p-3 bg-[#111] rounded-2xl border border-white/5">
            <LegendItem color="bg-[#ffcc00]" label="80-100%" />
            <LegendItem color="bg-[#ffcc00]/30" label="50-79%" />
            <LegendItem color="bg-[#1a1a1a]" label="0-49%" />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4">
              {d}
            </div>
          ))}
          
          {/* Calendar Grid */}
          {days.map(day => (
            <div 
              key={day.day}
              className={`
                aspect-square rounded-2xl p-2 relative overflow-hidden flex flex-col items-center justify-center transition-all hover:-translate-y-1 cursor-default
                ${getColorClass(day.rate)}
              `}
            >
              <span className="text-sm font-black">{day.day}</span>
              {day.rate > 0 && <span className="text-[9px] font-bold opacity-70 mt-1">{Math.round(day.rate)}%</span>}
              {day.isPerfect && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-[#1a1a1a] rounded-[32px] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#ffcc00]/10 via-transparent to-transparent opacity-50" />
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-[#ffcc00] text-black rounded-2xl flex items-center justify-center font-black text-3xl shadow-2xl rotate-3 shadow-[#ffcc00]/20">7</div>
              <div>
                <p className="font-black text-xl tracking-tight">Racha de Fuego</p>
                <p className="text-xs text-slate-400 font-medium mt-1">Días dominando el mercado</p>
              </div>
           </div>
           
           <div className="flex flex-col items-center md:items-end gap-3 relative z-10">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-9 h-9 border-2 border-[#1a1a1a] rounded-full bg-[#ffcc00] flex items-center justify-center text-black font-black text-sm">
                    ★
                  </div>
                ))}
              </div>
              <p className="text-xs font-black text-[#ffcc00] uppercase tracking-widest opacity-80">4 Días de Ejecución Perfecta (100%)</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2 px-2">
       <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
    </div>
  );
}
