// views/DigitizerView.jsx — Módulo de Digitalización con IA
import { useState, useRef, useEffect } from "react";
import { useInventoryStore } from "../store/inventoryStore";
import { 
  Camera, 
  Sparkles, 
  X, 
  ChevronRight, 
  Rocket, 
  CheckCircle2, 
  ArrowLeft 
} from "lucide-react";

// ─── Componente: Zona de carga de imagen ─────────────────────────────────────
function ImageUploadZone({ onImageSelected, preview, isAnalyzing }) {
  const inputRef = useRef(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onImageSelected(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-100 shadow-xl shadow-emerald-50">
        <img src={preview} alt="Vista previa" className="w-full h-72 object-cover" />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">Analizando con IA...</p>
          </div>
        )}
        {!isAnalyzing && (
          <button 
            onClick={() => inputRef.current?.click()} 
            className="absolute top-4 right-4 bg-white shadow-lg text-stone-700 text-[10px] font-black uppercase px-4 py-2 rounded-2xl flex items-center gap-2 hover:bg-stone-50 transition-all"
          >
            <Camera size={14} />
            Cambiar
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div 
      onClick={() => inputRef.current?.click()} 
      className="border-2 border-dashed border-stone-200 bg-stone-50 rounded-3xl p-16 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
    >
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all text-stone-300 group-hover:text-emerald-500">
        <Camera size={40} />
      </div>
      <h3 className="text-xl font-black text-stone-800 tracking-tight">Sube una foto del producto</h3>
      <p className="text-stone-400 text-sm mt-2 font-medium">Gemini extraerá toda la información por ti</p>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <Sparkles size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Optimización IA</span>
          </div>
          <h3 className="text-2xl font-black text-stone-800 leading-tight">Gemini necesita estos detalles para mejorar tu publicación:</h3>
        </div>
        
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{q}</label>
              <input
                type="text"
                placeholder="Escribe tu respuesta aquí..."
                onChange={(e) => handleAnswer(q, e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-stone-300"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSubmit(answers)}
        disabled={isAnalyzing}
        className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {isAnalyzing ? (
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>PROCESANDO...</span>
          </div>
        ) : (
          <>
            <span>SIGUIENTE</span>
            <ChevronRight size={24} />
          </>
        )}
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Título de la publicación</label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-black text-2xl text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Precio sugerido</label>
            <input
              type="text"
              value={form.precio}
              onChange={(e) => handleChange("precio", e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-black text-2xl text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Moneda</label>
            <select
              value={form.moneda}
              onChange={(e) => handleChange("moneda", e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-black text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
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
            className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-black text-stone-700 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all uppercase tracking-tight"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descripción optimizada</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            rows={8}
            className="w-full px-5 py-5 rounded-2xl border border-stone-100 bg-stone-50 text-stone-600 font-medium text-sm leading-relaxed outline-none resize-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <button
        onClick={() => onSubmit(form)}
        disabled={isPublishing}
        className="w-full py-6 rounded-3xl bg-stone-900 text-white font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {isPublishing ? (
           <div className="flex items-center gap-3">
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             <span>PUBLICANDO...</span>
           </div>
        ) : (
          <>
            <span>PUBLICAR AHORA</span>
            <Rocket size={24} />
          </>
        )}
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
    <div className="max-w-xl mx-auto space-y-8 pb-24 px-6 pt-4">
      {step !== "success" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
               <Sparkles size={20} />
            </div>
            <h2 className="text-3xl font-black text-stone-900 tracking-tight">Vender con IA</h2>
          </div>
          {step !== "upload" && (
            <button 
              onClick={handleReset} 
              className="w-10 h-10 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center hover:bg-stone-200 hover:text-stone-600 transition-all"
              title="Cancelar"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      {step === "upload" && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="bg-white rounded-[2rem] p-8 border border-stone-100 shadow-sm space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">¿Qué quieres vender hoy?</label>
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Ej: Silla de oficina ergonómica en excelente estado..."
                className="w-full px-0 py-2 border-0 bg-transparent text-2xl font-bold text-stone-800 outline-none resize-none placeholder:text-stone-200"
                rows={2}
              />
            </div>
            <ImageUploadZone onImageSelected={(f) => { setSelectedFile(f); setPreview(URL.createObjectURL(f)); }} preview={preview} isAnalyzing={isAnalyzing} />
          </div>
          {preview && !isAnalyzing && (
            <button 
              onClick={handleStart} 
              className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-xl shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
            >
              <span>ANALIZAR IMAGEN</span>
              <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            </button>
          )}
          {flowError && (
            <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-3 font-bold text-sm border border-red-100 animate-shake">
              <X className="flex-shrink-0" size={18} />
              <p>{flowError}</p>
            </div>
          )}
        </div>
      )}

      {step === "questions" && (
        <QuestionsForm questions={questions} onSubmit={handleAnswers} isAnalyzing={isAnalyzing} />
      )}

      {step === "refine" && (
        <RefinementForm recommendation={draftData} onSubmit={handleFinalPublish} isPublishing={isPublishing} />
      )}

      {step === "success" && (
        <div className="text-center py-20 animate-in zoom-in-95 duration-500">
          <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner relative">
             <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
             <CheckCircle2 size={64} className="relative z-10" />
          </div>
          <h3 className="text-4xl font-black text-stone-900 tracking-tight">¡Publicado con éxito!</h3>
          <p className="text-stone-500 mt-4 text-lg font-medium leading-relaxed">Tu producto ya está visible y listo para encontrar un comprador.</p>
          
          <div className="flex flex-col gap-4 mt-16 max-w-sm mx-auto">
            <button 
              onClick={handleReset} 
              className="w-full py-6 rounded-3xl bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span>VENDER OTRO PRODUCTO</span>
              <Camera size={20} />
            </button>
            <button 
              onClick={() => setView("dashboard")} 
              className="w-full py-5 rounded-2xl bg-white border-2 border-stone-100 text-stone-500 font-black text-xs uppercase tracking-widest hover:bg-stone-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <ArrowLeft size={14} />
              <span>Volver al inicio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
