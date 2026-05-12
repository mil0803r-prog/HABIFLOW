import React from 'react';
import { DailyTracking, Goal } from '../types';
import { AlertCircle, ShieldAlert, History } from 'lucide-react';

interface AlertsModuleProps {
  tracking: DailyTracking[];
  goals: Goal[];
}

export default function AlertsModule({ tracking, goals }: AlertsModuleProps) {
  const alerts = [
    { 
      type: 'Crítica', 
      msg: 'Menos del 60% semanal detectado', 
      action: 'Ajuste obligatorio de horarios mañana', 
      icon: <ShieldAlert className="text-black" />,
      color: 'bg-[#ffcc00] text-black'
    },
    { 
      type: 'Atención', 
      msg: '2 días seguidos sin "Grabar Clips"', 
      action: 'Priorizar primera hora del día', 
      icon: <AlertCircle className="text-[#ffcc00]" />,
      color: 'bg-[#111] border-white/5 text-white'
    },
    { 
      type: 'Inactividad', 
      msg: 'Meta "Expandir Showroom" sin avance', 
      action: 'Dividir en 3 mini-pasos hoy', 
      icon: <History className="text-slate-400" />,
      color: 'bg-[#1a1a1a] border-white/5 text-slate-300'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`p-8 rounded-[32px] border shadow-2xl ${alert.color} flex flex-col md:flex-row justify-between items-start md:items-center gap-8 transition-all hover:scale-[1.01]`}>
             <div className="flex gap-6 items-center">
               <div className={`p-4 rounded-2xl ${alert.type === 'Crítica' ? 'bg-black/10' : 'bg-[#ffcc00]/10'}`}>{alert.icon}</div>
               <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${alert.type === 'Crítica' ? 'text-black/60' : 'text-[#ffcc00]'}`}>{alert.type}</p>
                  <p className="text-xl font-black leading-tight tracking-tight">{alert.msg}</p>
               </div>
             </div>
             <div className={`${alert.type === 'Crítica' ? 'bg-black/10' : 'bg-[#0d0d0d] shadow-inner'} px-6 py-4 rounded-2xl border border-white/5 min-w-[280px]`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${alert.type === 'Crítica' ? 'text-black/50' : 'text-slate-500'}`}>Táctica Correctiva</p>
                <p className="text-sm font-bold italic">"{alert.action}"</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
