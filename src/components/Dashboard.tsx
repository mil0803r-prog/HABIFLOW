import React from 'react';
import { motion } from 'motion/react';
import { Star, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Habit } from '../types';

interface DashboardProps {
  activeDate: Date;
  habits: Habit[];
  goals?: any;
  tracking?: any;
}

export default function Dashboard({ activeDate, habits }: DashboardProps) {
  // Calculate remaining days in week (Sunday to Saturday week)
  const dayOfWeek = activeDate.getDay();
  const daysRemaining = 7 - dayOfWeek;
  
  // Weekly range (start of week is Sunday)
  const startOfWeek = new Date(activeDate);
  startOfWeek.setDate(activeDate.getDate() - dayOfWeek);
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);
  
  const formatDateRange = (start: Date, end: Date) => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
  };

  // Helper to count completions in the current week for a habit
  const getWeeklyCompletions = (habit: Habit) => {
    const startTime = startOfWeek.getTime();
    const endTime = endOfWeek.getTime();
    return habit.completedDates.filter(d => {
      const dateString = new Date(d).toDateString(); // Use toDateString for consistency
      const dDate = new Date(dateString).getTime();
      return dDate >= startTime && dDate <= endTime;
    }).length;
  };

  const totalWeeklyCompletions = habits.reduce((acc, h) => acc + getWeeklyCompletions(h), 0);
  const totalTarget = habits.reduce((acc, h) => acc + h.targetCount, 0);
  const weeklyScore = totalTarget > 0 ? Math.round((totalWeeklyCompletions / totalTarget) * 100) : 0;

  const chartData = [
    { name: "'26 S16", score: 0 },
    { name: "'26 S17", score: 0 },
    { name: "'26 S18", score: 0 },
    { name: "'26 S19", score: 0 },
    { name: "'26 S20", score: weeklyScore },
  ];

  return (
    <div className="bg-[#0a0a0a] min-h-[calc(100vh-5rem)] p-4 sm:p-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            Esta semana <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">(Quedan {daysRemaining} días)</span>
          </h2>
          <p className="text-slate-400 font-bold text-sm tracking-tight">
            '26 S20: {formatDateRange(startOfWeek, endOfWeek)}
          </p>
        </div>
        <button className="w-full sm:w-auto bg-[#ffcc00] text-black font-black px-6 py-3 rounded-2xl text-sm uppercase tracking-tighter shadow-lg active:scale-95 hover:scale-105 transition-all">
          Iniciar Revisión
        </button>
      </div>

      {/* Weekly Score */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[#ffcc00] text-xl font-black">g</span>
          <h3 className="text-[#ffcc00] font-black tracking-tighter uppercase text-sm">Puntuación semanal</h3>
        </div>
        <div className="bg-[#141414] h-10 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner">
          <span className="text-slate-500 font-black text-sm relative z-10">{weeklyScore}%</span>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${weeklyScore}%` }}
            className="absolute left-0 top-0 bottom-0 bg-[#ffcc00]/10" 
          />
        </div>
      </div>

      {/* Activities Summary */}
      <div className="mb-10">
        <h3 className="text-xl font-black mb-4 tracking-tighter px-1">Actividades</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => {
             const weeklyCompleted = getWeeklyCompletions(habit);
             return (
               <div key={habit.id} className="bg-[#141414] p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-md group hover:border-[#ffcc00]/30 transition-all">
                 <div className="w-12 h-12 bg-[#ffcc00]/10 rounded-xl flex items-center justify-center relative shadow-inner">
                   <Star size={20} className="text-[#ffcc00] fill-[#ffcc00]" />
                   <span className="absolute -top-1 -right-1 text-sm">{habit.icon}</span>
                 </div>
                 <div>
                    <h4 className="font-bold text-base text-slate-100 tracking-tight">{habit.habit}</h4>
                    <p className="text-slate-400 text-sm font-bold tracking-tight">{weeklyCompleted} / {habit.targetCount} días por semana</p>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      {/* Past Weeks Section */}
      <div className="bg-[#141414]/50 -mx-4 sm:-mx-6 p-6 rounded-t-[32px] border-t border-white/5 shadow-2xl mt-4">
        <h3 className="text-xl font-black mb-6 tracking-tighter text-white">Semanas pasadas</h3>
        
        {/* Chart */}
        <div className="mb-10">
          <h4 className="text-sm font-black mb-4 text-slate-400 tracking-tighter uppercase px-1">Tendencia semanal</h4>
          <div className="h-64 w-full bg-[#0d0d0d] rounded-3xl p-4 border border-white/5 shadow-2xl relative">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#444" 
                    fontSize={14} 
                    fontWeight="900" 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={14} 
                    fontWeight="900" 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    dx={-5}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)', padding: '12px' }}
                    itemStyle={{ color: '#ffcc00', fontWeight: '900', textTransform: 'uppercase', fontSize: '14px' }}
                    cursor={{ stroke: '#ffcc00', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ffcc00" 
                    strokeWidth={4} 
                    dot={{ fill: '#ffcc00', r: 5, strokeWidth: 2, stroke: '#0a0a0a' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#ffcc00' }}
                  />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Previous Weeks List - Single Line Rows */}
        <div className="space-y-3">
           {[...chartData].reverse().map((week, idx) => {
             const weekDate = new Date(activeDate);
             weekDate.setDate(activeDate.getDate() - (idx * 7));
             const wStart = new Date(weekDate);
             wStart.setDate(weekDate.getDate() - weekDate.getDay());
             const wEnd = new Date(wStart);
             wEnd.setDate(wStart.getDate() + 6);

             return (
               <div key={idx} className="bg-[#0d0d0d] p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4 group hover:border-[#ffcc00]/20 transition-all shadow-xl">
                 <div className="flex-1 flex items-center gap-4">
                   <div className="min-w-[120px]">
                     <h5 className="text-sm font-bold text-white tracking-tighter">{week.name}</h5>
                     <p className="text-sm text-slate-500 font-bold uppercase tracking-tight">{formatDateRange(wStart, wEnd)}</p>
                   </div>
                   
                   <div className="flex-1 max-w-[180px] bg-[#0a0a0a] h-4 rounded-lg relative overflow-hidden border border-white/10 shadow-inner hidden sm:block">
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-black text-sm z-10 tracking-widest">{week.score}%</div>
                      <div className="h-full bg-[#ffcc00]/30 transition-all duration-700" style={{ width: `${week.score}%` }} />
                   </div>

                   <div className="sm:hidden text-sm font-black text-[#ffcc00]">{week.score}%</div>
                 </div>
                 
                 <button className="bg-[#ffcc00] text-black font-black px-4 py-2 rounded-xl text-sm uppercase tracking-widest active:scale-95 hover:scale-105 shadow-md transition-all whitespace-nowrap">
                   Evaluar
                 </button>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}
