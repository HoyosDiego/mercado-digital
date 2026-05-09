// views/DigitizerView.jsx — Módulo de Digitalización con IA
// Flujo: Cargar imagen → Analizar con Gemini → Validar datos → Publicar
// Diseñado para usuarios con baja alfabetización digital

import { useState, useRef, useCallback } from "react";
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
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragging
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

// ─── Paso 2: Formulario de validación de datos sugeridos por IA ───────────────
function ValidationForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  // Pre-cargar el formulario con los datos que sugirió Gemini
  const [form, setForm] = useState({
    nombre: initialData?.nombre || "",
    precio: initialData?.precio?.toString() || "",
    categoria: initialData?.categoria || CATEGORIES.PRODUCTO,
    descripcion: initialData?.descripcion || "",
    ubicacion: LOCATIONS.CALI,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al corregirlo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validar antes de enviar
  const validate = () => {
    const newErrors = {};
    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) < 0) {
      newErrors.precio = "Ingresa un precio válido";
    }
    if (!form.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...form,
      precio: Number(form.precio),
    });
  };

  return (
    <div className="space-y-4">
      {/* Aviso: datos sugeridos por IA */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-2">
        <span className="text-lg">✨</span>
        <p className="text-emerald-800 text-sm">
          La IA completó los datos. Revisa y corrige si es necesario antes de publicar.
        </p>
      </div>

      {/* Campo: Nombre del producto */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Nombre del producto o servicio
        </label>
        <input
          type="text"
          value={form.nombre}
          onChange={(e) => handleChange("nombre", e.target.value)}
          maxLength={60}
          className={`w-full px-4 py-3 rounded-xl border text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base ${
            errors.nombre ? "border-red-300 bg-red-50" : "border-stone-200"
          }`}
        />
        {errors.nombre && (
          <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
        )}
      </div>

      {/* Campos: Precio y Categoría en fila */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Precio (COP $)
          </label>
          <input
            type="number"
            value={form.precio}
            onChange={(e) => handleChange("precio", e.target.value)}
            placeholder="0"
            min="0"
            className={`w-full px-4 py-3 rounded-xl border text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base ${
              errors.precio ? "border-red-300 bg-red-50" : "border-stone-200"
            }`}
          />
          {errors.precio && (
            <p className="text-red-500 text-xs mt-1">{errors.precio}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Tipo
          </label>
          <select
            value={form.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base bg-white"
          >
            <option value={CATEGORIES.PRODUCTO}>Producto</option>
            <option value={CATEGORIES.SERVICIO}>Servicio</option>
            <option value={CATEGORIES.ARRIENDO}>Arriendo</option>
          </select>
        </div>
      </div>

      {/* Campo: Descripción */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Descripción
        </label>
        <textarea
          value={form.descripcion}
          onChange={(e) => handleChange("descripcion", e.target.value)}
          rows={3}
          maxLength={150}
          placeholder="¿Qué ofreces? ¿Qué lo hace especial?"
          className={`w-full px-4 py-3 rounded-xl border text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base resize-none ${
            errors.descripcion ? "border-red-300 bg-red-50" : "border-stone-200"
          }`}
        />
        <p className="text-stone-400 text-xs mt-1 text-right">
          {form.descripcion.length}/150
        </p>
        {errors.descripcion && (
          <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>
        )}
      </div>

      {/* Campo: Ubicación */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          ¿Dónde está tu negocio?
        </label>
        <div className="flex gap-2">
          {Object.values(LOCATIONS).map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange("ubicacion", loc)}
              className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${
                form.ubicacion === loc
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-stone-200 text-stone-600 hover:border-emerald-300"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold transition-colors"
        >
          {isSubmitting ? "Publicando..." : "Publicar ahora"}
        </button>
      </div>
    </div>
  );
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────
function SuccessScreen({ itemName, onNew, onDashboard }) {
  return (
    <div className="text-center py-10">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-stone-800">¡Listo!</h3>
      <p className="text-stone-500 mt-2">
        <span className="font-medium text-stone-700">"{itemName}"</span>{" "}
        ya está en tu catálogo digital.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onNew}
          className="flex-1 py-3 rounded-xl border border-emerald-600 text-emerald-600 font-medium hover:bg-emerald-50"
        >
          Agregar otro
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
    digitizerImage,
    digitizerPreview,
    aiSuggestedData,
    isAnalyzing,
    analyzeError,
    setDigitizerImage,
    analyzeImageWithAI,
    resetDigitizer,
    addItem,
    setView,
  } = useInventoryStore();

  // Pasos del flujo: "upload" → "validate" → "success"
  const [step, setStep] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedItemName, setPublishedItemName] = useState("");

  // ── Paso 1: Usuario selecciona imagen ───────────────────────────────────────
  const handleImageSelected = async (file) => {
    setDigitizerImage(file);
    // Automáticamente lanzar análisis de IA
    const result = await analyzeImageWithAI(file);
    if (result.success) {
      setStep("validate");
    }
    // Si falla, el error se muestra desde el store
  };

  // ── Paso 2: Usuario confirma y publica ──────────────────────────────────────
  const handlePublish = async (formData) => {
    setIsSubmitting(true);
    const result = await addItem(user.uid, formData);
    setIsSubmitting(false);

    if (result.success) {
      setPublishedItemName(formData.nombre);
      setStep("success");
    }
  };

  // ── Resetear para agregar otro ──────────────────────────────────────────────
  const handleNewItem = () => {
    resetDigitizer();
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
          {["upload", "validate"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  step === s
                    ? "bg-emerald-600 text-white"
                    : i < ["upload", "validate"].indexOf(step)
                    ? "bg-emerald-200 text-emerald-700"
                    : "bg-stone-200 text-stone-400"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs ${
                  step === s ? "text-stone-700 font-medium" : "text-stone-400"
                }`}
              >
                {s === "upload" ? "Foto" : "Verificar"}
              </span>
              {i < 1 && <div className="flex-1 h-px bg-stone-200 w-4" />}
            </div>
          ))}
        </div>
      )}

      {/* ── Contenido por paso ────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="space-y-4">
          <ImageUploadZone
            onImageSelected={handleImageSelected}
            preview={digitizerPreview}
            isAnalyzing={isAnalyzing}
          />

          {/* Error de análisis */}
          {analyzeError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">⚠️ {analyzeError}</p>
              <p className="text-red-500 text-xs mt-1">
                Prueba con una foto más clara o con mejor luz.
              </p>
            </div>
          )}

          {/* Instrucciones de uso */}
          {!digitizerPreview && (
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

      {step === "validate" && (
        <ValidationForm
          initialData={aiSuggestedData}
          onSubmit={handlePublish}
          onCancel={handleNewItem}
          isSubmitting={isSubmitting}
        />
      )}

      {step === "success" && (
        <SuccessScreen
          itemName={publishedItemName}
          onNew={handleNewItem}
          onDashboard={() => {
            resetDigitizer();
            setView("dashboard");
          }}
        />
      )}
    </div>
  );
}
