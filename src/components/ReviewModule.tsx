import React from 'react';

export default function ReviewModule() {
  return (
    <div className="space-y-12">
      {/* Weekly Review */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Análisis Semanal</h3>
            <p className="text-sm text-[#ffcc00] font-bold uppercase tracking-widest">Optimización de Estrategia</p>
          </div>
          <span className="text-sm font-bold text-slate-500 border border-white/10 px-2 py-1 rounded-md uppercase">Vía Ejecutiva</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReviewBox title="Qué funcionó" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Qué falló" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Por qué" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Ajuste" color="bg-[#ffcc00] border-[#ffcc00]" textColor="text-black" highlight />
        </div>
      </section>

      {/* Monthly Review */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Revisión Mensual</h3>
            <p className="text-sm text-slate-500 font-medium">Arquitectura de Largo Plazo</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ReviewBox title="Progreso de Metas" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Qué Eliminar" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Qué Mejorar" color="bg-[#111] border-white/5" textColor="text-white" />
          <ReviewBox title="Qué Escalar" color="bg-[#ffcc00] border-[#ffcc00]" textColor="text-black" />
        </div>
      </section>
    </div>
  );
}

function ReviewBox({ title, color, textColor = "text-slate-300", highlight }: any) {
  return (
    <div className={`${color} p-6 rounded-[32px] border shadow-2xl min-h-[170px] flex flex-col justify-between transition-all hover:scale-[1.02]`}>
       <h4 className={`font-black text-sm uppercase tracking-[0.2em] mb-4 ${color.includes('ffcc00') ? 'text-black/70' : 'text-slate-500'}`}>
         {title}
       </h4>
       <textarea 
        className={`w-full bg-transparent border-none p-0 text-sm font-medium resize-none focus:ring-0 ${textColor} placeholder:opacity-30`}
        placeholder="Insights..."
        rows={3}
       />
       {highlight && <div className="mt-3 text-sm font-black uppercase text-black tracking-widest bg-black/20 inline-block px-2 py-1 rounded w-fit">Acción Obligatoria</div>}
    </div>
  );
}
