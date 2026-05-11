// views/PublicationDetailView.jsx
import { useInventoryStore } from "../store/inventoryStore";
import { useState, useEffect } from "react";

export default function PublicationDetailView() {
  const { selectedItem, setView, publishExistingDraft, isPublishing, flowError } = useInventoryStore();
  const [isConfirming, setIsConfirming] = useState(false);

  // Estado local para edición
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    moneda: "COP",
    categoria: "Producto",
    imageUrl: ""
  });

  // Inicializar formulario con los datos del item seleccionado
  useEffect(() => {
    if (selectedItem) {
      setForm({
        titulo: selectedItem.titulo || "",
        descripcion: selectedItem.descripcion || selectedItem.description || "",
        precio: selectedItem.precio || "",
        moneda: selectedItem.moneda || "COP",
        categoria: selectedItem.categoria || selectedItem.tipo || "Producto",
        imageUrl: selectedItem.imageUrl || ""
      });
    }
  }, [selectedItem]);

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

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handlePublish = async () => {
    // Limpiar precio: dejar solo números y punto decimal
    const cleanPrice = String(form.precio).replace(/[^0-9.]/g, '');
    const finalData = {
      ...form,
      precio: cleanPrice ? parseFloat(cleanPrice) : 0,
    };

    await publishExistingDraft(selectedItem.id, finalData);
  };

  const statusColors = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
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

      {/* CONTENT CARD (EDITABLE) */}
      <div className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm">
        <div className="relative">
          <img
            src={form.imageUrl || "https://via.placeholder.com/600x400?text=Sin+Imagen"}
            alt={form.titulo}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${statusColors[selectedItem.status] || "bg-stone-100 text-stone-700"}`}>
              {selectedItem.status}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Título</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="w-full px-0 py-1 bg-transparent border-b border-stone-100 focus:border-emerald-500 outline-none text-2xl font-bold text-stone-800 transition-colors"
              placeholder="Título de la publicación"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Precio</label>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-xl">$</span>
                <input
                  type="text"
                  value={form.precio}
                  onChange={(e) => handleChange("precio", e.target.value)}
                  className="w-full px-0 py-1 bg-transparent border-b border-stone-100 focus:border-emerald-500 outline-none text-xl font-black text-emerald-600 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Moneda</label>
              <select
                value={form.moneda}
                onChange={(e) => handleChange("moneda", e.target.value)}
                className="w-full px-0 py-2 bg-transparent border-b border-stone-100 focus:border-emerald-500 outline-none font-bold text-stone-700 transition-colors"
              >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoría</label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full px-0 py-1 bg-transparent border-b border-stone-100 focus:border-emerald-500 outline-none font-bold text-stone-600 transition-colors"
              placeholder="Ej: Electrónica, Hogar..."
            />
          </div>

          <div className="pt-4 border-t border-stone-50 space-y-1">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              rows={6}
              className="w-full px-0 py-2 bg-transparent border-0 text-stone-500 text-sm leading-relaxed outline-none resize-none"
              placeholder="Escribe una descripción detallada..."
            />
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-tighter mt-4">
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
              <p className="text-amber-700 text-xs mt-0.5">Puedes editar los campos arriba y publicarla cuando estés listo.</p>
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
