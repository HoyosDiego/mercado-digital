// components/ui/LoadingScreen.jsx — Pantalla de carga inicial
// Se muestra mientras Firebase verifica la sesión del usuario

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
      <div className="text-center">
        {/* Ícono animado */}
        <div className="text-5xl mb-4 animate-bounce">🏪</div>
        <h1 className="text-xl font-bold text-stone-800">Mercado Digital</h1>
        <p className="text-stone-400 text-sm mt-2">Cargando tu negocio...</p>

        {/* Indicador de progreso */}
        <div className="mt-6 w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-emerald-500 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
}
