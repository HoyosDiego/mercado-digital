// views/PublicationDetailView.jsx
import { useInventoryStore } from "../store/inventoryStore";
import { useState } from "react";

export default function PublicationDetailView() {
  const { selectedItem, setView, publishExistingDraft, isPublishing, flowError } = useInventoryStore();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!selectedItem) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">No se ha seleccionado ninguna publicación.</p>
        <button
          onClick={() => setView("catalog")}
          className="mt-4 text-emerald-600 font-medium hover:underline"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const handlePublish = async () => {
    const finalData = {
      titulo: selectedItem.titulo,
      precio: selectedItem.precio,
      imageUrl: selectedItem.imageUrl,
    };

    await publishExistingDraft(selectedItem.id, finalData);
  };

  const statusColors = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER / BACK */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView("catalog")}
          className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-bold text-stone-800">Detalles de Publicación</h2>
      </div>

      {/* CONTENT CARD */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm">
        <img
          src={selectedItem.imageUrl || "https://via.placeholder.com/600x400?text=Sin+Imagen"}
          alt={selectedItem.titulo}
          className="w-full h-64 object-cover"
        />

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${statusColors[selectedItem.status] || "bg-stone-100 text-stone-700"}`}>
                {selectedItem.status}
              </span>
              <h1 className="text-2xl font-bold text-stone-800 mt-2">{selectedItem.titulo || "Sin título"}</h1>
            </div>
            <p className="text-2xl font-black text-emerald-600">
              {typeof selectedItem.precio === 'number'
                ? `$${selectedItem.precio.toLocaleString()}`
                : selectedItem.precio || "A convenir"}
            </p>
          </div>

          <div className="pt-4 border-t border-stone-50">
            <p className="text-stone-500 text-sm leading-relaxed">
              {selectedItem.descripcion || "Esta publicación no tiene una descripción detallada todavía."}
            </p>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-xs mt-4">
            <span>📅 Creado el: {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {selectedItem.status === "DRAFT" && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-amber-900 text-sm">Esta publicación es un borrador</p>
              <p className="text-amber-700 text-xs mt-0.5">Debes publicarla para que otros puedan verla en el mercado.</p>
            </div>
          </div>

          {flowError && (
            <p className="text-red-500 text-sm bg-white p-3 rounded-lg border border-red-100">{flowError}</p>
          )}

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              disabled={isPublishing}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              {isPublishing ? "Publicando..." : "Publicar Ahora 🚀"}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsConfirming(false)}
                className="py-3.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
      )}

      {selectedItem.status === "PUBLISHED" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-emerald-900 text-sm">¡Publicación Activa!</p>
            <p className="text-emerald-700 text-xs mt-0.5">Este producto ya está visible para todos los clientes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
