// views/DashboardView.jsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useInventoryStore } from "../store/inventoryStore";
import { 
  Package, 
  FileEdit, 
  Rocket, 
  Clock, 
  Camera, 
  FolderTree, 
  ChevronRight, 
  Store,
  LayoutDashboard,
  Sparkles,
  AlertCircle
} from "lucide-react";

// ─── Componente: Card Estadística ───────────────────────────────────────────
function StatCard({ label, value, icon, color, data }) {
  if (data) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm transition-all hover:shadow-md flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-emerald-500 transition-colors`}>
              {icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${color}`}>
              RECOMENDADO
            </span>
          </div>
          <p className="text-sm font-black text-stone-800 line-clamp-2 leading-tight uppercase tracking-tight">{data.titulo}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase">COP</span>
            <p className="text-xl font-black text-stone-900 tracking-tighter">
              {typeof data.precio === 'number' ? data.precio.toLocaleString() : data.precio}
            </p>
          </div>
        </div>
        <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.2em] mt-4">{label}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm transition-all hover:shadow-md group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
          {icon}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${color}`}>
          ESTADO
        </span>
      </div>
      <p className="text-3xl font-black text-stone-900 tracking-tighter">{value}</p>
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

// ─── Componente: Card Publicación ───────────────────────────────────────────
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
      className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm cursor-pointer hover:border-emerald-200 hover:shadow-md transition-all active:scale-[0.98] group"
    >
      <div className="flex items-center gap-4">
        <img
          src={item.imageUrl || "https://via.placeholder.com/100x100?text=IMG"}
          alt={item.titulo}
          className="w-16 h-16 rounded-xl object-cover bg-stone-50 border border-stone-100"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-black text-stone-800 truncate uppercase text-xs tracking-tight group-hover:text-emerald-700 transition-colors">
              {item.titulo || "Sin título"}
            </h4>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${statusColors[item.status] || "bg-stone-50 text-stone-400 border-stone-100"}`}
            >
              {item.status}
            </span>
          </div>

          <div className="flex items-baseline gap-1 mt-1">
             <span className="text-[9px] font-black text-emerald-600 uppercase">COP</span>
             <p className="text-base font-black text-stone-900 tracking-tighter">
               {typeof item.precio === 'number' ? item.precio.toLocaleString() : (item.precio || "0")}
             </p>
          </div>
        </div>
        <ChevronRight size={16} className="text-stone-200 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
}

// ─── Componente: Acción Rápida ──────────────────────────────────────────────
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
      className={`w-full text-left p-6 rounded-[2rem] border transition-all hover:shadow-xl active:scale-[0.98] group relative overflow-hidden ${highlight
          ? "bg-emerald-600 border-emerald-600 text-white"
          : "bg-white border-stone-100 text-stone-800 hover:border-emerald-200"
        }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:rotate-12 transition-transform">
           <Sparkles size={80} />
        </div>
      )}
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${highlight ? 'bg-stone-100 text-stone-600' : 'bg-stone-50 text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
          {icon}
        </div>

        <div className="flex-1">
          <p className="font-black text-sm uppercase tracking-tight">{label}</p>
          <p className={`text-xs mt-1 font-medium ${highlight ? "text-emerald-50" : "text-stone-400"}`}>{description}</p>
        </div>
        <ChevronRight size={20} className={highlight ? "text-emerald-200" : "text-stone-200"} />
      </div>
    </button>
  );
}

// ─── Componente Principal: DashboardView ────────────────────────────────────
export default function DashboardView() {
  const { user } = useAuthStore();
  const { items, isLoadingItems, itemsError, fetchItems, setView } = useInventoryStore();

  useEffect(() => {
    fetchItems();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  const total = items.length;
  const drafts = items.filter(x => x.status === "DRAFT").length;
  const published = items.filter(x => x.status === "PUBLISHED").length;
  const recentItems = items.slice(0, 3);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <p className="text-stone-400 font-black text-[10px] uppercase tracking-[0.2em]">{greeting}</p>
          </div>
          <h2 className="text-3xl font-black text-stone-900 tracking-tight uppercase">
            {user?.displayName?.split(' ')[0] || "Comerciante"}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-[1.5rem] bg-white border border-stone-100 flex items-center justify-center shadow-sm relative group overflow-hidden">
           <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
           <span className="font-black text-xl text-stone-800 group-hover:text-white relative z-10 transition-colors">
            {(user?.displayName || "C").charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* STATS */}
      {isLoadingItems ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((x) => (
            <div key={x} className="h-32 rounded-3xl bg-stone-50 animate-pulse border border-stone-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Mis Productos"
            value={total}
            icon={<Package size={24} />}
            color="bg-stone-100 text-stone-500"
          />
          <StatCard
            label="En Borrador"
            value={drafts}
            icon={<FileEdit size={24} />}
            color="bg-amber-100 text-amber-600"
          />
          <StatCard
            label="En Vitrina"
            value={published}
            icon={<Rocket size={24} />}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            label="Sincronizado"
            value="100%"
            icon={<Clock size={24} />}
            color="bg-blue-100 text-blue-600"
          />
        </div>
      )}

      {/* ERROR */}
      {itemsError && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4 animate-shake">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
             <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-red-900 font-black text-sm uppercase tracking-tight">Error de conexión</p>
            <p className="text-red-600 text-xs mt-1 font-medium">{itemsError}</p>
          </div>
        </div>
      )}

      {/* ACCIONES RÁPIDAS */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.25em] ml-1">Centro de operaciones</h3>
        <div className="grid grid-cols-1 gap-4">
          <QuickAction
            icon={<Camera size={28} />}
            label="Vender con IA"
            description="Escanea un producto y publícalo en segundos"
            onClick={() => setView("digitizer")}
            highlight
          />
          <QuickAction
            icon={<FolderTree size={28} />}
            label="Mi Inventario"
            description="Gestiona tus productos y borradores"
            onClick={() => setView("catalog")}
          />
        </div>
      </div>

      {/* ÚLTIMAS */}
      {recentItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.25em]">Actividad reciente</h3>
            <button
              onClick={() => setView("catalog")}
              className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              Ver todo
            </button>
          </div>

          <div className="space-y-3">
            {recentItems.map((item) => (
              <PublicationCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!isLoadingItems && items.length === 0 && (
        <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-stone-200 shadow-sm">
            <Store size={48} />
          </div>
          <h4 className="text-xl font-black text-stone-800 tracking-tight uppercase">Tu tienda está vacía</h4>
          <p className="text-stone-400 text-sm mt-2 font-medium">Usa nuestra IA para crear tu primera publicación.</p>
          <button
            onClick={() => setView("digitizer")}
            className="mt-8 px-8 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            Empezar ahora
          </button>
        </div>
      )}
    </div>
  );
}