// components/inventory/ItemCard.jsx — Tarjeta de ítem reutilizable
import { Package, Wrench, Home, MapPin } from "lucide-react";

// Mapeo de categorías a íconos y colores
const CATEGORY_STYLE = {
  producto: { icon: <Package size={24} />, color: "bg-blue-50 text-blue-700" },
  servicio: { icon: <Wrench size={24} />, color: "bg-purple-50 text-purple-700" },
  arriendo: { icon: <Home size={24} />, color: "bg-amber-50 text-amber-700" },
};

// Formatear precio en pesos colombianos
function formatPrice(price) {
  if (!price && price !== 0) { return "Precio a convenir"; }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ItemCard({ item, compact = false }) {
  const style = CATEGORY_STYLE[item.categoria] || CATEGORY_STYLE.producto;

  // ── Versión compacta (dashboard: últimos publicados) ──────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100 hover:border-emerald-200 transition-all">
        <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400 flex-shrink-0 border border-stone-100">
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-stone-800 text-xs truncate uppercase tracking-tight">{item.nombre}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-stone-300" />
            <p className="text-stone-400 text-[10px] font-bold truncate uppercase">{item.ubicacion}</p>
          </div>
        </div>
        <p className="text-emerald-700 font-black text-sm flex-shrink-0">
          {formatPrice(item.precio)}
        </p>
      </div>
    );
  }

  // ── Versión completa (catálogo) ────────────────────────────────────────────
  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        {/* Ícono de categoría */}
        <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 flex-shrink-0 border border-stone-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:text-emerald-600 transition-all">
          {style.icon}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-black text-stone-800 leading-tight text-lg tracking-tight uppercase">{item.nombre}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest flex-shrink-0 ${style.color}`}>
              {item.categoria}
            </span>
          </div>

          <p className="text-stone-500 text-sm mt-2 leading-relaxed line-clamp-2">
            {item.descripcion}
          </p>

          {/* Footer: precio y ubicación */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-50">
            <span className="text-emerald-700 font-black text-xl tracking-tighter">
              {formatPrice(item.precio)}
            </span>
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-full">
              <MapPin size={12} className="text-emerald-500" />
              <span className="text-stone-500 font-black text-[10px] uppercase tracking-wider">{item.ubicacion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags opcionales */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-emerald-50 text-emerald-700 font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
