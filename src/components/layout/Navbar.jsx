// components/layout/Navbar.jsx — Barra de navegación principal
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Camera, 
  FolderTree, 
  Store, 
  LogOut 
} from "lucide-react";

const NAV_ITEMS = [
  { view: "dashboard", icon: <LayoutDashboard size={20} />, label: "Inicio" },
  { view: "digitizer", icon: <Camera size={20} />, label: "Digitalizar" },
  { view: "catalog", icon: <FolderTree size={20} />, label: "Catálogo" },
];

export default function Navbar({ currentView, onNavigate }) {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (view) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* ── Barra superior ────────────────────────────────────────── */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Botón menú + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-stone-600 hover:text-stone-800 p-1 rounded-lg hover:bg-stone-50 transition-all"
              title="Abrir menú"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                <Store size={18} />
              </div>
              <span className="font-bold text-stone-800 text-sm tracking-tight">Mercado Digital</span>
            </div>
          </div>

          {/* Avatar + Salir */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200">
                <span className="text-stone-600 font-bold text-xs">
                  {(user?.displayName || "C").charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay oscuro ────────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Menú sidebar desde la izquierda ────────────────────────── */}
      <nav
        className={`fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Encabezado del menú */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 h-14 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-emerald-600" />
            <span className="font-black text-stone-800 text-sm uppercase tracking-widest">Navegación</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-stone-400 hover:text-stone-800 p-1 transition-colors"
            title="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Ítems de navegación */}
        <div className="px-3 py-6 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavigate(item.view)}
              className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 text-sm font-bold transition-all ${
                currentView === item.view
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 translate-x-1"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span className={currentView === item.view ? "text-white" : "text-stone-400"}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
             <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Usuario</p>
             <p className="text-sm font-bold text-stone-800 truncate">{user?.displayName || user?.email || "Usuario Local"}</p>
          </div>
        </div>
      </nav>
    </>
  );
}
