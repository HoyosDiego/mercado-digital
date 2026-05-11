// views/DigitizerView.jsx — Módulo de Digitalización con IA
// Flujo: Cargar imagen → Responder Preguntas IA → Refinar → Publicar

import { useState, useRef, useEffect } from "react";
import { useInventoryStore } from "../store/inventoryStore";

// ─── Componente: Zona de carga de imagen ─────────────────────────────────────
function ImageUploadZone({ onImageSelected, preview, isAnalyzing }) {
  const inputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImageSelected(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-sm">
        <img src={preview} alt="Vista previa" className="w-full h-64 object-cover" />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <div className="w-10 h-10 border-4 border-white border-t-emerald-400 rounded-full animate-spin mb-3" />
            <p className="font-bold">Analizando...</p>
          </div>
        )}
        {!isAnalyzing && (
          <button onClick={() => inputRef.current?.click()} className="absolute top-3 right-3 bg-white/90 text-stone-700 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl">📸 Cambiar</button>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-stone-200 bg-stone-50 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-300 transition-all">
      <div className="text-5xl mb-4">📸</div>
      <h3 className="text-lg font-bold text-stone-800">Sube una foto</h3>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ─── Componente: Formulario de Preguntas ─────────────────────────────────────
function QuestionsForm({ questions, onSubmit, isAnalyzing }) {
  const [answers, setAnswers] = useState({});

  const handleAnswer = (q, val) => {
    setAnswers(prev => ({ ...prev, [q]: val }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-6">
        <h3 className="text-xl font-black text-stone-800 leading-tight">Gemini tiene unas preguntas para mejorar tu publicación:</h3>
        
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{q}</label>
            <input
              type="text"
              placeholder="Tu respuesta..."
              onChange={(e) => handleAnswer(q, e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(answers)}
        disabled={isAnalyzing}
        className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all"
      >
        {isAnalyzing ? "Analizando..." : "Siguiente ✨"}
      </button>
    </div>
  );
}

// ─── Componente: Formulario de Refinamiento ──────────────────────────────────
function RefinementForm({ recommendation, onSubmit, isPublishing }) {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    categoria: "Producto",
    moneda: "COP",
  });

  // Sincronizar cuando llegue la recomendación
  useEffect(() => {
    if (recommendation) {
      setForm({
        titulo: recommendation.titulo || "",
        descripcion: recommendation.descripcion || recommendation.description || "",
        precio: recommendation.precio || "",
        categoria: recommendation.categoria || recommendation.tipo || "Producto",
        moneda: recommendation.moneda || "COP",
      });
    }
  }, [recommendation]);

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Título</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 font-black text-xl text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Precio</label>
            <input
              type="text"
              value={form.precio}
              onChange={(e) => handleChange("precio", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 font-black text-xl text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => handleChange("moneda", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoría</label>
          <input
            type="text"
            value={form.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            rows={8}
            className="w-full px-4 py-4 rounded-xl border border-stone-100 bg-stone-50 text-sm leading-relaxed outline-none resize-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      <button
        onClick={() => onSubmit(form)}
        disabled={isPublishing}
        className="w-full py-5 rounded-2xl bg-stone-900 text-white font-black text-xl shadow-xl hover:bg-black transition-all active:scale-[0.98]"
      >
        {isPublishing ? "Publicando..." : "PUBLICAR AHORA 🚀"}
      </button>
    </div>
  );
}

export default function DigitizerView() {
  const {
    questions,
    draftData,
    isAnalyzing,
    isPublishing,
    flowError,
    startPublication,
    answerQuestions,
    publishFinal,
    resetFlow,
    setView,
  } = useInventoryStore();

  const [step, setStep] = useState("upload"); 
  const [intent, setIntent] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Control de pasos
  useEffect(() => {
    if (!isAnalyzing) {
      if (questions && questions.length > 0) {
        setStep("questions");
      } else if (draftData && draftData.titulo) { // Si ya tenemos recomendación
        setStep("refine");
      }
    }
  }, [isAnalyzing, questions, draftData]);

  const handleStart = async () => {
    if (!selectedFile) return;
    await startPublication(selectedFile, intent);
  };

  const handleAnswers = async (answers) => {
    await answerQuestions(answers);
  };

  const handleFinalPublish = async (finalData) => {
    // Limpiar precio: dejar solo números y punto decimal
    const cleanPrice = String(finalData.precio).replace(/[^0-9.]/g, '');
    await publishFinal({
      ...finalData,
      precio: cleanPrice ? parseFloat(cleanPrice) : 0,
    });
    setStep("success");
  };

  const handleReset = () => {
    resetFlow();
    setPreview(null);
    setSelectedFile(null);
    setIntent("");
    setStep("upload");
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-20 px-4">
      {step !== "success" && (
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">Vender con IA</h2>
          {step !== "upload" && (
            <button onClick={handleReset} className="text-stone-400 font-bold text-xs uppercase tracking-widest">✕ Cancelar</button>
          )}
        </div>
      )}

      {step === "upload" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">¿Qué vendes?</label>
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Ej: Silla de oficina ergonómica..."
                className="w-full px-0 py-2 border-0 bg-transparent text-xl font-bold text-stone-800 outline-none resize-none"
                rows={2}
              />
            </div>
            <ImageUploadZone onImageSelected={(f) => { setSelectedFile(f); setPreview(URL.createObjectURL(f)); }} preview={preview} isAnalyzing={isAnalyzing} />
          </div>
          {preview && !isAnalyzing && (
            <button onClick={handleStart} className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all">ANALIZAR IMAGEN ✨</button>
          )}
          {flowError && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center font-bold text-sm">⚠️ {flowError}</div>}
        </div>
      )}

      {step === "questions" && (
        <QuestionsForm questions={questions} onSubmit={handleAnswers} isAnalyzing={isAnalyzing} />
      )}

      {step === "refine" && (
        <RefinementForm recommendation={draftData} onSubmit={handleFinalPublish} isPublishing={isPublishing} />
      )}

      {step === "success" && (
        <div className="text-center py-16 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl">✨</div>
          <h3 className="text-4xl font-black text-stone-900 tracking-tight">¡Publicado con éxito!</h3>
          <p className="text-stone-500 mt-4 text-lg">Tu producto ya está visible en el catálogo.</p>
          <div className="flex flex-col gap-4 mt-12">
            <button 
              onClick={handleReset} 
              className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              CONTINUAR EN VENDER CON IA 🚀
            </button>
            <button 
              onClick={() => setView("dashboard")} 
              className="w-full py-5 rounded-2xl bg-white border-2 border-stone-100 text-stone-500 font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all active:scale-[0.98]"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
