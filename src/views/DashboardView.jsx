// views/DashboardView.jsx
// Dashboard REAL conectado al store Zustand + Publications

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useInventoryStore } from "../store/inventoryStore";

// ─────────────────────────────────────────────
// CARD ESTADÍSTICA
// ─────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
        >
          hoy
        </span>
      </div>

      <p className="text-3xl font-bold text-stone-800">{value}</p>
      <p className="text-sm text-stone-500 mt-1">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// CARD PUBLICACIÓN
// ─────────────────────────────────────────────
function PublicationCard({ item }) {
  const { setView, setSelectedItem } = useInventoryStore();

  const statusColors = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-blue-100 text-blue-700",
  };

  const image =
    item.imageUrl ||
    "https://via.placeholder.com/100x100?text=IMG";

  return (
    <div 
      onClick={() => {
        setSelectedItem(item);
        setView("publication_detail");
      }}
      className="bg-white border border-stone-100 rounded-2xl p-3 shadow-sm cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.98]"
    >
      <div className="flex gap-3">
        <img
          src={image}
          alt={item.titulo}
          className="w-20 h-20 rounded-xl object-cover bg-stone-100"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <h4 className="font-semibold text-stone-800 truncate">
              {item.titulo || "Sin título"}
            </h4>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[item.status] ||
                "bg-stone-100 text-stone-700"
                }`}
            >
              {item.status}
            </span>
          </div>

          <p className="text-emerald-600 font-bold mt-1">
            {item.precio || "A convenir"}
          </p>

          <p className="text-xs text-stone-400 mt-2">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QUICK ACTION
// ─────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  description,
  onClick,
  highlight,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md ${highlight
          ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
          : "bg-white border-stone-100 text-stone-800 hover:border-emerald-200"
        }`}
    >
      <div className="flex gap-3">
        <span className="text-2xl">{icon}</span>

        <div>
          <p className="font-semibold text-sm">{label}</p>

          <p
            className={`text-xs mt-1 ${highlight
                ? "text-emerald-100"
                : "text-stone-500"
              }`}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────
// MAIN VIEW
// ─────────────────────────────────────────────
export default function DashboardView() {
  const { user } = useAuthStore();

  const {
    items,
    isLoadingItems,
    itemsError,
    fetchItems,
    setView,
  } = useInventoryStore();

  // 🔥 cargar publicaciones reales
  useEffect(() => {
    fetchItems();
  }, []);

  // saludo dinámico
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Buenos días"
      : hour < 18
        ? "Buenas tardes"
        : "Buenas noches";

  // stats reales
  const total = items.length;

  const drafts = items.filter(
    (x) => x.status === "DRAFT"
  ).length;

  const published = items.filter(
    (x) => x.status === "PUBLISHED"
  ).length;

  const pending = items.filter(
    (x) => x.status === "PENDING"
  ).length;

  const recentItems = items.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-stone-500 text-sm">
            {greeting} 👋
          </p>

          <h2 className="text-xl font-bold text-stone-800">
            {user?.displayName || "Comerciante"}
          </h2>
        </div>

        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="font-bold text-emerald-700">
            {(user?.displayName || "C")
              .charAt(0)
              .toUpperCase()}
          </span>
        </div>
      </div>

      {/* STATS */}
      {isLoadingItems ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((x) => (
            <div
              key={x}
              className="h-28 rounded-2xl bg-stone-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total"
            value={total}
            icon="📦"
            color="bg-stone-100 text-stone-700"
          />

          <StatCard
            label="Borradores"
            value={drafts}
            icon="📝"
            color="bg-amber-100 text-amber-700"
          />

          <StatCard
            label="Publicados"
            value={published}
            icon="🚀"
            color="bg-emerald-100 text-emerald-700"
          />

          <StatCard
            label="Pendientes"
            value={pending}
            icon="⏳"
            color="bg-blue-100 text-blue-700"
          />
        </div>
      )}

      {/* ERROR */}
      {itemsError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700 font-medium">Error cargando publicaciones</p>
          <p className="text-red-600 text-sm mt-1">{itemsError}</p>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide mb-3">
          ¿Qué quieres hacer?
        </h3>

        <div className="space-y-2">
          <QuickAction
            icon="📸"
            label="Crear publicación con IA"
            description="Sube una foto y Publixia hace el resto"
            onClick={() => setView("digitizer")}
            highlight
          />

          <QuickAction
            icon="🗂️"
            label="Ver publicaciones"
            description="Administra tus productos publicados"
            onClick={() => setView("catalog")}
          />
        </div>
      </div>

      {/* ÚLTIMAS */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
              Últimas publicaciones
            </h3>

            <button
              onClick={() => setView("catalog")}
              className="text-emerald-600 text-sm font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {recentItems.map((item) => (
              <PublicationCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!isLoadingItems && items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-5xl mb-4">🏪</p>

          <p className="font-semibold text-stone-700">
            Aún no tienes publicaciones
          </p>

          <p className="text-sm text-stone-400 mt-1">
            Sube una foto y empieza hoy
          </p>

          <button
            onClick={() => setView("digitizer")}
            className="mt-5 px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
          >
            Crear primera publicación
          </button>
        </div>
      )}
    </div>
  );
}