import React from 'react';
import { DailyTracking } from '../types';
import { TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

interface WeeklyTrackerProps {
  tracking: DailyTracking[];
}

export default function WeeklyTracker({ tracking }: WeeklyTrackerProps) {
  const weeks = [
    { week: 'Semana 17 (Abril)', avg: '88%', best: 'Lun', worst: 'Dom', streak: '5 días', trend: 'subiendo' },
    { week: 'Semana 18 (Mayo)', avg: '72%', best: 'Mar', worst: 'Vie', streak: '2 días', trend: 'bajando' },
  ];

  return (
    <div className="space-y-6">
       <div className="bg-[#111] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 lg:p-8 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
          <div>
            <h3 className="font-extrabold text-lg lg:text-xl text-white tracking-tight">Evolución Semanal</h3>
            <p className="text-[10px] text-[#ffcc00] font-black uppercase tracking-widest mt-1">KPIs de Consistencia</p>
          </div>
          <BarChart3 className="text-[#ffcc00] opacity-40 hidden sm:block" size={24} />
        </div>
        
        {/* Escritorio */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Semana</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">% Cumplimiento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Peak</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Falla</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Streak</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Evolución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {weeks.map((w, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6 font-bold text-sm text-white">{w.week}</td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2">
                        <span className={`text-base font-black ${parseInt(w.avg) > 80 ? 'text-[#ffcc00]' : 'text-slate-400'}`}>
                          {w.avg}
                        </span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-[#ffcc00] h-full" style={{width: w.avg}} />
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400 bg-white/5">{w.best}</td>
                  <td className="px-8 py-6 text-sm text-slate-600">{w.worst}</td>
                  <td className="px-8 py-6 text-sm font-bold text-[#ffcc00] group-hover:translate-x-1 transition-transform">{w.streak}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {w.trend === 'subiendo' ? (
                        <ArrowUpRight size={18} className="text-[#ffcc00]" />
                      ) : (
                        <ArrowDownRight size={18} className="text-slate-600" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${w.trend === 'subiendo' ? 'text-[#ffcc00]' : 'text-slate-600'}`}>
                        {w.trend}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Móvil */}
        <div className="lg:hidden divide-y divide-white/5">
          {weeks.map((w, idx) => (
            <div key={idx} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <p className="font-black text-white">{w.week}</p>
                <div className="flex items-center gap-1.5">
                   <span className={`text-lg font-black ${parseInt(w.avg) > 80 ? 'text-[#ffcc00]' : 'text-slate-400'}`}>{w.avg}</span>
                   {w.trend === 'subiendo' ? <ArrowUpRight size={16} className="text-[#ffcc00]" /> : <ArrowDownRight size={16} className="text-slate-600" />}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Mejor Día</p>
                    <p className="text-xs font-bold text-[#ffcc00]">{w.best}</p>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Racha</p>
                    <p className="text-xs font-bold text-slate-400">{w.streak}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
