import React from 'react';
import { ActionPlan, Goal } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ActionPlanModuleProps {
  actions: ActionPlan[];
  goals: Goal[];
}

export default function ActionPlanModule({ actions, goals }: ActionPlanModuleProps) {
  return (
    <div className="space-y-6">
      <div className="px-2">
        <h3 className="font-black text-xl text-white tracking-tight">Ejecución Táctica</h3>
        <p className="text-xs text-[#ffcc00] font-bold uppercase tracking-widest mt-1">Plan de Acción Directa</p>
      </div>

      {/* Escritorio */}
      <div className="hidden lg:block bg-[#111] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-white/5">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Objetivo Meta</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Acción Crítica</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ciclo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Impacto</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tiempo</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Expectativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {actions.map((action) => {
                const goal = goals.find(g => g.id === action.goalId);
                return (
                  <tr key={action.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter max-w-[150px] truncate">{goal?.objective}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-[#ffcc00]/10 rounded-lg group-hover:bg-[#ffcc00]/20 transition-colors">
                            <Circle size={14} className="text-[#ffcc00]" />
                         </div>
                         <p className="text-sm font-bold text-white">{action.action}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{action.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${action.impact === 'Alto' ? 'bg-[#ffcc00] text-black' : 'bg-slate-800 text-slate-400'}`}>
                        {action.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-400">{action.timeRequired}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-[#ffcc00] font-bold italic tracking-tight">"{action.expectedResult}"</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Móvil */}
      <div className="lg:hidden space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="bg-[#1a1a1a] p-5 rounded-[24px] border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1">
               <span className={`text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase ${action.impact === 'Alto' ? 'bg-[#ffcc00] text-black' : 'bg-slate-800 text-slate-500'}`}>
                 {action.impact} Impacto
               </span>
            </div>
            <p className="text-[8px] font-black text-[#ffcc00] uppercase tracking-widest mb-1">{action.type}</p>
            <h4 className="font-bold text-white text-sm leading-snug mb-3">{action.action}</h4>
            <div className="flex justify-between items-center text-[10px] pt-3 border-t border-white/5">
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-[#ffcc00] rounded-full" />
                  <span className="text-slate-400 font-bold">{action.timeRequired}</span>
               </div>
               <span className="text-[#ffcc00] font-black italic">"{action.expectedResult}"</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
