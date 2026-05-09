// components/inventory/ItemCard.jsx — Tarjeta de ítem reutilizable
// Versión compacta para dashboard y versión normal para catálogo

// Mapeo de categorías a íconos y colores
const CATEGORY_STYLE = {
  producto: { icon: "🛍️", color: "bg-blue-50 text-blue-700" },
  servicio: { icon: "⚙️", color: "bg-purple-50 text-purple-700" },
  arriendo: { icon: "🏠", color: "bg-amber-50 text-amber-700" },
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
      <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100">
        <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800 text-sm truncate">{item.nombre}</p>
          <p className="text-stone-500 text-xs mt-0.5">{item.ubicacion}</p>
        </div>
        <p className="text-emerald-700 font-semibold text-sm flex-shrink-0">
          {formatPrice(item.precio)}
        </p>
      </div>
    );
  }

  // ── Versión completa (catálogo) ────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Ícono de categoría */}
        <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-stone-100">
          {style.icon}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-stone-800 leading-tight">{item.nombre}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${style.color}`}>
              {item.categoria}
            </span>
          </div>

          <p className="text-stone-500 text-sm mt-1 leading-relaxed line-clamp-2">
            {item.descripcion}
          </p>

          {/* Footer: precio y ubicación */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-emerald-700 font-bold text-base">
              {formatPrice(item.precio)}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs">📍</span>
              <span className="text-stone-400 text-xs">{item.ubicacion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags opcionales */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
