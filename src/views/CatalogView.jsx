// views/CatalogView.jsx
// Catálogo REAL conectado a publicaciones backend

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useInventoryStore } from "../store/inventoryStore";

// ─────────────────────────────────────────────
// CHIP
// ─────────────────────────────────────────────
function FilterChip({
  label,
  active,
  onClick,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${active
        ? "bg-emerald-600 text-white shadow-sm"
        : "bg-white text-stone-600 border border-stone-200 hover:border-emerald-300"
        }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────
// CARD PUBLICATION
// ─────────────────────────────────────────────
function PublicationCard({ item }) {
  const { setView, setSelectedItem } = useInventoryStore();

  const statusColors = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED:
      "bg-emerald-100 text-emerald-700",
  };

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
          src={
            item.imageUrl ||
            "https://placehold.co/100x100?text=Img"
          }
          alt={item.titulo}
          className="w-24 h-24 rounded-xl object-cover bg-stone-100"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2">
            <h4 className="font-semibold text-stone-800 truncate">
              {item.titulo}
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
            {item.precio}
          </p>

          <p className="text-xs text-stone-400 mt-2">
            {new Date(
              item.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function CatalogView() {
  const { user } = useAuthStore();

  const {
    items,
    isLoadingItems,
    filterCategory,
    filterLocation,
    searchQuery,
    fetchItems,
    setFilterCategory,
    setFilterLocation,
    setSearchQuery,
    getFilteredItems,
    setView,
  } = useInventoryStore();

  // cargar publicaciones reales
  useEffect(() => {
    if (user?.uid) {
      fetchItems(user.uid);
    }
  }, [user]);

  const filteredItems =
    getFilteredItems();

  // ─────────────────────────────
  // FILTROS REALES
  // ─────────────────────────────

  const categoryFilters = [
    {
      value: "all",
      label: "Todos",
      icon: "🗂️",
    },
    {
      value: "DRAFT",
      label: "Borradores",
      icon: "📝",
    },
    {
      value: "PUBLISHED",
      label: "Publicados",
      icon: "🚀",
    },
  ];

  const locationFilters = [
    {
      value: "all",
      label: "Todas",
    },
    {
      value: "today",
      label: "Hoy",
    },
    {
      value: "week",
      label: "Semana",
    },
  ];

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-stone-800">
          Mis Publicaciones
        </h2>

        <p className="text-stone-500 text-sm mt-0.5">
          {filteredItems.length} encontradas
        </p>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg">
          🔍
        </span>

        <input
          type="search"
          placeholder="Buscar por título..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(
              e.target.value
            )
          }
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* STATUS */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
          Estado
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map(
            (filter) => (
              <FilterChip
                key={filter.value}
                label={
                  filter.label
                }
                icon={
                  filter.icon
                }
                active={
                  filterCategory ===
                  filter.value
                }
                onClick={() =>
                  setFilterCategory(
                    filter.value
                  )
                }
              />
            )
          )}
        </div>
      </div>

      {/* FECHA */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
          Fecha
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {locationFilters.map(
            (filter) => (
              <FilterChip
                key={filter.value}
                label={
                  filter.label
                }
                active={
                  filterLocation ===
                  filter.value
                }
                onClick={() =>
                  setFilterLocation(
                    filter.value
                  )
                }
              />
            )
          )}
        </div>
      </div>

      {/* LIST */}
      {isLoadingItems ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map(
            (i) => (
              <div
                key={i}
                className="bg-stone-100 rounded-2xl h-28 animate-pulse"
              />
            )
          )}
        </div>
      ) : filteredItems.length >
        0 ? (
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map(
            (item) => (
              <PublicationCard
                key={item.id}
                item={item}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">
            📭
          </p>

          <p className="text-stone-700 font-medium">
            No encontramos
            publicaciones
          </p>

          <p className="text-stone-400 text-sm mt-1">
            Intenta otro
            filtro o crea una
            nueva publicación
          </p>

          <button
            onClick={() =>
              setView(
                "digitizer"
              )
            }
            className="mt-5 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            Crear publicación
          </button>
        </div>
      )}
    </div>
  );
}