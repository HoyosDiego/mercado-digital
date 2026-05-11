// views/PublicationDetailView.jsx
import { useInventoryStore } from "../store/inventoryStore";
import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  FileEdit, 
  CheckCircle2, 
  Calendar, 
  Rocket, 
  AlertCircle 
} from "lucide-react";

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
      <div className="text-center py-20 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertCircle size={40} />
        </div>
        <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">No se encontró la publicación</p>
        <button
          onClick={() => setView("catalog")}
          className="mt-6 text-emerald-600 font-black uppercase text-xs tracking-widest hover:underline flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={14} />
          Volver al catálogo
        </button>
      </div>
    );
  }

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handlePublish = async () => {
    const cleanPrice = String(form.precio).replace(/[^0-9.]/g, '');
    const finalData = {
      ...form,
      precio: cleanPrice ? parseFloat(cleanPrice) : 0,
    };

    await publishExistingDraft(selectedItem.id, finalData);
  };

  const statusColors = {
    DRAFT: "bg-amber-50 text-amber-600 border-amber-100",
    PUBLISHED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      {/* HEADER / BACK */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setView("catalog")}
          className="w-12 h-12 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-800 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
           <h2 className="text-2xl font-black text-stone-900 tracking-tight uppercase">Editar Publicación</h2>
           <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.2em]">{selectedItem.id}</p>
        </div>
      </div>

      {/* CONTENT CARD (EDITABLE) */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-xl shadow-stone-100/50">
        <div className="relative group">
          <img
            src={form.imageUrl || "https://via.placeholder.com/600x400?text=Sin+Imagen"}
            alt={form.titulo}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-6 left-6">
            <span className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-[0.15em] border backdrop-blur-md ${statusColors[selectedItem.status] || "bg-stone-50 text-stone-400 border-stone-100"}`}>
              {selectedItem.status}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Título de la publicación</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b-2 border-stone-50 focus:border-emerald-500 outline-none text-3xl font-black text-stone-900 tracking-tight transition-all placeholder:text-stone-100"
              placeholder="¿Qué estás vendiendo?"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Precio de venta</label>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-black text-2xl uppercase">COP</span>
                <input
                  type="text"
                  value={form.precio}
                  onChange={(e) => handleChange("precio", e.target.value)}
                  className="w-full px-0 py-2 bg-transparent border-b-2 border-stone-50 focus:border-emerald-500 outline-none text-3xl font-black text-emerald-600 tracking-tighter transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Moneda</label>
              <div className="relative">
                <select
                  value={form.moneda}
                  onChange={(e) => handleChange("moneda", e.target.value)}
                  className="w-full px-0 py-3 bg-transparent border-b-2 border-stone-50 focus:border-emerald-500 outline-none font-black text-stone-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="COP">PESOS (COP)</option>
                  <option value="USD">DÓLARES (USD)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoría</label>
            <input
              type="text"
              value={form.categoria}
              onChange={(e) => handleChange("categoria", e.target.value)}
              className="w-full px-0 py-2 bg-transparent border-b-2 border-stone-50 focus:border-emerald-500 outline-none font-black text-stone-600 tracking-wide uppercase transition-all"
              placeholder="Ej: Electrónica, Hogar..."
            />
          </div>

          <div className="pt-6 border-t border-stone-50 space-y-3">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descripción detallada</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              rows={6}
              className="w-full px-0 py-4 bg-transparent border-0 text-stone-500 font-medium text-sm leading-relaxed outline-none resize-none focus:ring-0 transition-all"
              placeholder="Describe tu producto..."
            />
          </div>

          <div className="flex items-center gap-2 text-stone-300 font-bold text-[10px] uppercase tracking-widest pt-4 border-t border-stone-50">
            <Calendar size={12} />
            <span>Creado el: {new Date(selectedItem.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      {selectedItem.status === "DRAFT" && (
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500 shadow-lg shadow-amber-900/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 flex-shrink-0">
               <FileEdit size={24} />
            </div>
            <div>
              <p className="font-black text-amber-900 text-sm uppercase tracking-tight">Publicación en modo borrador</p>
              <p className="text-amber-700/70 text-xs mt-1 font-medium leading-relaxed">Personaliza los campos arriba y haz clic en publicar para que sea visible en el catálogo oficial.</p>
            </div>
          </div>

          {flowError && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-bold">
               <AlertCircle size={18} />
               <p>{flowError}</p>
            </div>
          )}

          {!isConfirming ? (
            <button
              onClick={() => setIsConfirming(true)}
              disabled={isPublishing}
              className="group w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isPublishing ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>PUBLICAR AHORA</span>
                  <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsConfirming(false)}
                className="py-5 rounded-2xl border-2 border-stone-200 text-stone-400 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-stone-800 transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="py-5 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
      )}

      {selectedItem.status === "PUBLISHED" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-start gap-5 animate-in slide-in-from-bottom-4 duration-500 shadow-lg shadow-emerald-900/5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 flex-shrink-0">
             <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="font-black text-emerald-900 text-sm uppercase tracking-tight">Publicación Activa</p>
            <p className="text-emerald-700/70 text-xs mt-1 font-medium leading-relaxed">Este producto ya está visible para todos los clientes y compradores potenciales.</p>
          </div>
        </div>
      )}
    </div>
  );
}
