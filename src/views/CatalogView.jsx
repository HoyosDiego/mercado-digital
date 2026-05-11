// views/CatalogView.jsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useInventoryStore } from "../store/inventoryStore";
import { 
  Search, 
  FolderTree, 
  FileText, 
  Rocket, 
  Inbox, 
  PlusCircle, 
  Calendar 
} from "lucide-react";

// ─── Componente: Chip de Filtro ─────────────────────────────────────────────
function FilterChip({
  label,
  active,
  onClick,
  icon,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${active
        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100"
        : "bg-white text-stone-400 border-stone-100 hover:border-emerald-300 hover:text-stone-600"
        }`}
    >
      {icon && <span className={active ? "text-white" : "text-stone-300"}>{icon}</span>}
      {label}
    </button>
  );
}

// ─── Componente: Tarjeta de Publicación ──────────────────────────────────────
function PublicationCard({ item }) {
  const { setView, setSelectedItem } = useInventoryStore();

  const statusColors = {
    DRAFT: "bg-amber-50 text-amber-600 border-amber-100",
    PUBLISHED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div
      onClick={() => {
        setSelectedItem(item);
        setView("publication_detail");
      }}
      className="bg-white border border-stone-100 rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all active:scale-[0.98] group"
    >
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={item.imageUrl || "https://placehold.co/100x100?text=Img"}
            alt={item.titulo}
            className="w-24 h-24 rounded-2xl object-cover bg-stone-50"
          />
          <div className="absolute top-1 right-1">
             <div className={`w-3 h-3 rounded-full border-2 border-white ${item.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          </div>
        </div>

        <div className="flex-1 min-w-0 py-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-black text-stone-800 truncate uppercase text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
              {item.titulo}
            </h4>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${statusColors[item.status] || "bg-stone-50 text-stone-400 border-stone-100"}`}
            >
              {item.status}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-[10px] font-black text-emerald-600 uppercase">COP</span>
            <span className="text-xl font-black text-stone-800 tracking-tighter">
              {typeof item.precio === 'number' ? item.precio.toLocaleString() : item.precio}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 text-stone-300">
            <Calendar size={12} />
            <span className="text-[10px] font-bold uppercase">
              {new Date(item.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal: CatalogView ──────────────────────────────────────
export default function CatalogView() {
  const { user } = useAuthStore();

  const {
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

  useEffect(() => {
    if (user?.uid) {
      fetchItems(user.uid);
    }
  }, [user]);

  const filteredItems = getFilteredItems();

  const categoryFilters = [
    { value: "all", label: "Todos", icon: <FolderTree size={14} /> },
    { value: "DRAFT", label: "Borradores", icon: <FileText size={14} /> },
    { value: "PUBLISHED", label: "Publicados", icon: <Rocket size={14} /> },
  ];

  const locationFilters = [
    { value: "all", label: "Todas" },
    { value: "today", label: "Hoy" },
    { value: "week", label: "Semana" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Mis Publicaciones</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">
               {filteredItems.length} registros encontrados
             </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 transition-colors">
          <Search size={20} />
        </span>
        <input
          type="search"
          placeholder="Buscar por título..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-2xl border border-stone-100 bg-white text-stone-800 font-bold placeholder-stone-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* FILTROS */}
      <div className="space-y-6">
        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-1">Filtrar por estado</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categoryFilters.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                icon={filter.icon}
                active={filterCategory === filter.value}
                onClick={() => setFilterCategory(filter.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 ml-1">Fecha de creación</p>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {locationFilters.map((filter) => (
              <FilterChip
                key={filter.value}
                label={filter.label}
                active={filterLocation === filter.value}
                onClick={() => setFilterLocation(filter.value)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LISTADO */}
      {isLoadingItems ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-stone-50 rounded-[2rem] h-32 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <PublicationCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-stone-50 rounded-[2.5rem] border border-dashed border-stone-200 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-stone-200 shadow-sm">
            <Inbox size={40} />
          </div>
          <h4 className="text-xl font-black text-stone-800 tracking-tight uppercase">Sin resultados</h4>
          <p className="text-stone-400 text-sm mt-2 font-medium">No encontramos publicaciones que coincidan.</p>
          
          <button
            onClick={() => setView("digitizer")}
            className="mt-8 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 mx-auto shadow-lg shadow-stone-100 active:scale-[0.98]"
          >
            <PlusCircle size={18} />
            Crear publicación
          </button>
        </div>
      )}
    </div>
  );
}