// App.jsx — Punto de entrada corregido
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useInventoryStore } from "./store/inventoryStore";

import LoginView from "./views/LoginView";
import DashboardView from "./views/DashboardView";
import DigitizerView from "./views/DigitizerView";
import CatalogView from "./views/CatalogView";
import Navbar from "./components/layout/Navbar";
import LoadingScreen from "./components/ui/LoadingScreen";

export default function App() {
  // Asegúrate de que initAuth esté definido en tu useAuthStore
  const { user, isLoading, initAuth } = useAuthStore();
  const { currentView, setView } = useInventoryStore();

  useEffect(() => {
    // Verificación de seguridad antes de ejecutar
    if (typeof initAuth === "function") {
      const unsubscribe = initAuth();
      return () => {
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      };
    } else {
      console.error("Error: initAuth no está definido en el authStore.");
    }
  }, [initAuth]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView />;
      case "digitizer": return <DigitizerView />;
      case "catalog": return <CatalogView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar currentView={currentView} onNavigate={setView} />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderView()}
      </main>
    </div>
  );
}