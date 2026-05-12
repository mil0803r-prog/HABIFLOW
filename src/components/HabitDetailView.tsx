import React from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  MoreHorizontal, 
  Settings, 
  ExternalLink, 
  ChevronDown,
  BarChart2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { Habit } from '../types';

interface HabitDetailViewProps {
  onBack: () => void;
  habit: Habit;
}

const MOCK_CHART_DATA = [
  { name: "'26 S14", value: 0 },
  { name: "'26 S15", value: 0 },
  { name: "'26 S16", value: 0 },
  { name: "'26 S17", value: 0 },
  { name: "'26 S18", value: 0 },
  { name: "'26 S19", value: 0 },
];

export default function HabitDetailView({ habit, onBack }: HabitDetailViewProps) {
  return (
    <div className="bg-[#0a0a0a] min-h-screen -m-8 p-6 text-white font-sans pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Star size={32} className="text-[#ffcc00] fill-[#ffcc00]" />
          <h2 className="text-2xl font-black">{habit.icon} {habit.habit}</h2>
        </div>
        <button className="w-10 h-10 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-slate-400">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Meta semanal</p>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
          <p className="text-2xl font-black">4 <span className="text-sm font-normal text-slate-500">días</span></p>
        </div>

        <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Área de vida:</p>
          <p className="text-sm font-bold text-orange-400">Crecimiento</p>
          <p className="text-[10px] text-slate-500 font-medium">Mayor confianza</p>
        </div>

        <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-none mb-2">Sincronización de calendario</p>
           <button className="bg-[#ffcc00] text-black text-[10px] font-black py-1.5 rounded-lg uppercase tracking-wider">
              Configurar
           </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
         <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Esta semana</p>
            <p className="text-xl font-black mb-2">0%</p>
            <div className="w-full bg-[#0a0a0a] h-2 rounded-full overflow-hidden">
               <div className="bg-slate-700 h-full w-[0%]" />
            </div>
         </div>

         <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 relative">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-1">Objetivos vinculados</p>
            <p className="text-2xl font-black">1</p>
            <ExternalLink size={14} className="absolute top-4 right-4 text-slate-500" />
         </div>

         <div className="col-span-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative">
            <BarChart2 size={24} className="text-[#ffcc00] mb-1" />
            <p className="text-[10px] text-slate-300 font-bold text-center leading-tight">Explorar datos de la actividad</p>
            <ExternalLink size={14} className="absolute top-4 right-4 text-slate-500" />
         </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5 mb-8">
        <h3 className="text-center font-bold text-slate-200 mb-6">Logros de semanas pasadas</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}
                itemStyle={{ color: '#ffcc00' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ffcc00" 
                strokeWidth={2} 
                dot={{ fill: '#ffcc00', r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-200">Revisión del año</h3>
          <div className="bg-[#0a0a0a] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
            <span className="text-sm font-bold">2026</span>
            <ChevronDown size={14} className="text-slate-500" />
          </div>
        </div>
        
        <div className="flex gap-4 mb-2 overflow-x-auto pb-2 no-scrollbar">
          {['abr', 'may', 'jun', 'jul', 'ago'].map(month => (
            <span key={month} className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{month}</span>
          ))}
        </div>

        <div className="grid grid-cols-20 gap-1">
          {Array.from({ length: 140 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-[2px] ${i === 35 ? 'bg-transparent border border-red-500' : 'bg-[#2a2a2a]'}`} 
            />
          ))}
        </div>
      </div>

      {/* Back Button (Floating) */}
      <button 
        onClick={onBack}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#ffcc00] text-black rounded-full shadow-2xl flex items-center justify-center z-50 lg:hidden"
      >
        <ChevronDown size={28} className="rotate-90" />
      </button>
    </div>
  );
}
