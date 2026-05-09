// components/layout/Navbar.jsx — Barra de navegación principal
// Menú sidebar que se abre de izquierda a derecha

import { useState } from "react";
import { useAuthStore } from "../../store/authStore";

const NAV_ITEMS = [
  { view: "dashboard", icon: "🏠", label: "Inicio" },
  { view: "digitizer", icon: "📸", label: "Digitalizar" },
  { view: "catalog", icon: "🗂️", label: "Catálogo" },
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
              className="text-stone-600 hover:text-stone-800 text-2xl leading-none transition-colors"
              title="Abrir menú"
            >
              ☰
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <span className="font-bold text-stone-800 text-sm">Mercado Digital</span>
            </div>
          </div>

          {/* Avatar + Salir */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-xs">
                {(user?.displayName || "C").charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={logout}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay oscuro ────────────────────────────────────────── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Menú sidebar desde la izquierda ────────────────────────── */}
      <nav
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Encabezado del menú */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 h-14">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏪</span>
            <span className="font-bold text-stone-800 text-sm">Menú</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-stone-400 hover:text-stone-600 text-2xl leading-none"
            title="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Ítems de navegación */}
        <div className="px-2 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavigate(item.view)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all ${
                currentView === item.view
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
