// views/DigitizerView.jsx — Módulo de Digitalización con IA
// Flujo: Cargar imagen → Analizar con Gemini → Validar datos → Publicar
// Diseñado para usuarios con baja alfabetización digital

import { useState, useRef, useCallback, useEffect } from "react";
import { useInventoryStore, CATEGORIES, LOCATIONS } from "../store/inventoryStore";
import { useAuthStore } from "../store/authStore";

// ─── Paso 1: Zona de carga de imagen (Drag & Drop) ────────────────────────────
function ImageUploadZone({ onImageSelected, preview, isAnalyzing }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  // Prevenir comportamiento por defecto del navegador en drag
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onImageSelected(file);
      }
    },
    [onImageSelected]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
  };

  // Si hay previsualización, mostrar la imagen
  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200">
        <img
          src={preview}
          alt="Producto a digitalizar"
          className="w-full h-56 object-cover"
        />
        {/* Overlay de análisis IA */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-3 border-white border-t-emerald-400 rounded-full animate-spin mb-3" />
            <p className="text-white font-medium text-sm">Analizando con IA...</p>
            <p className="text-white/70 text-xs mt-1">Esto tarda unos segundos</p>
          </div>
        )}
        {/* Botón para cambiar imagen */}
        {!isAnalyzing && (
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute top-3 right-3 bg-white/90 text-stone-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white"
          >
            Cambiar foto
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // Zona de arrastrar y soltar (estado vacío)
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging
        ? "border-emerald-500 bg-emerald-50"
        : "border-stone-300 bg-stone-50 hover:border-emerald-400 hover:bg-emerald-50/50"
        }`}
    >
      <div className="text-5xl mb-3">📸</div>
      <p className="font-semibold text-stone-700 text-base">
        Sube la foto de tu producto
      </p>
      <p className="text-stone-400 text-sm mt-1">
        Toca aquí o arrastra la imagen
      </p>
      <div className="mt-4 inline-block bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl">
        Elegir foto
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"  // En móvil, abrir cámara trasera
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}


// ─── Pantalla de éxito ────────────────────────────────────────────────────────
function SuccessScreen({ onNew, onDashboard }) {
  return (
    <div className="text-center py-10">
      <div className="text-6xl mb-4">✨</div>
      <h3 className="text-xl font-bold text-stone-800">¡Analizado exitosamente!</h3>
      <p className="text-stone-500 mt-2">
        La IA ha procesado tu producto y lo ha guardado como borrador.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onNew}
          className="flex-1 py-3 rounded-xl border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-50"
        >
          Analizar otro
        </button>
        <button
          onClick={onDashboard}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

// ─── Vista principal del Digitalizador ───────────────────────────────────────
export default function DigitizerView() {
  const { user } = useAuthStore();
  const {
    draftData,
    isAnalyzing,
    flowError,
    startPublication,
    resetFlow,
    publishFinal,
    setView,
  } = useInventoryStore();

  // Pasos del flujo: "upload" → "validate" → "success"
  const [step, setStep] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedItemName, setPublishedItemName] = useState("");
  const [intent, setIntent] = useState("Quiero publicar esto");
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ── Paso 1: Usuario selecciona imagen ───────────────────────────────────────
  const handleImageSelected = (file) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    await startPublication(selectedFile, intent);
    setPublishedItemName(intent || "Producto");
    setStep("success");
  };

  // El useEffect que cambiaba a validate ya no es necesario


  // ── Resetear para agregar otro ──────────────────────────────────────────────
  const handleNewItem = () => {
    resetFlow();
    setPreview(null);
    setStep("upload");
  };

  return (
    <div className="space-y-5">
      {/* ── Encabezado ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-stone-800">Digitalizador con IA</h2>
        <p className="text-stone-500 text-sm mt-0.5">
          Toma una foto y la IA completa los datos por ti
        </p>
      </div>

      {/* ── Indicador de pasos ────────────────────────────────────────── */}
      {step !== "success" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <span className="text-xs text-stone-700 font-medium">
              Digitalizar
            </span>
          </div>
        </div>
      )}

      {/* ── Contenido por paso ────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm space-y-3">
            <label className="block text-sm font-semibold text-stone-700">
              ¿Qué quieres publicar? (Opcional)
            </label>
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Ej: Quiero publicar estos zapatos rojos usados en buen estado..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm resize-none"
            />
            <p className="text-[10px] text-stone-400">
              Describe brevemente tu producto para que la IA sea más precisa.
            </p>
          </div>

          <ImageUploadZone
            onImageSelected={handleImageSelected}
            preview={preview}
            isAnalyzing={isAnalyzing}
          />

          {preview && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              ✨ Analizar con IA
            </button>
          )}

          {/* Error de análisis */}
          {flowError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">⚠️ {flowError}</p>
            </div>
          )}

          {/* Instrucciones de uso */}
          {!preview && (
            <div className="bg-stone-100 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-medium text-stone-700">
                💡 Consejos para mejores resultados:
              </p>
              <ul className="space-y-1.5">
                {[
                  "Usa buena iluminación natural",
                  "Centra el producto en la foto",
                  "Fondo limpio y sin distracciones",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-xs text-stone-500">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === "success" && (
        <SuccessScreen
          onNew={handleNewItem}
          onDashboard={() => {
            resetFlow();
            setView("dashboard");
          }}
        />
      )}
    </div>
  );
}
