// components/ui/LoadingScreen.jsx — Pantalla de carga inicial
import { Store } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="text-center animate-in fade-in duration-700">
        {/* Ícono animado */}
        <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-emerald-200 animate-bounce">
          <Store size={40} />
        </div>
        
        <h1 className="text-2xl font-black text-stone-900 tracking-tighter uppercase">Mercado Digital</h1>
        <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] mt-3">Cargando experiencia...</p>

        {/* Indicador de progreso */}
        <div className="mt-8 w-40 h-1 bg-stone-100 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-emerald-500 rounded-full animate-progress-loading" />
        </div>
      </div>
    </div>
  );
}
