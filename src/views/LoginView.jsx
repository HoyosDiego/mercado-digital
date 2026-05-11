// views/LoginView.jsx — Pantalla de autenticación corregida
import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Store, Key, Mail, Lock, User, ShieldCheck } from "lucide-react";

export default function LoginView() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "external"
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  });
  const [manualToken, setManualToken] = useState("");
  const [localError, setLocalError] = useState("");

  const { login, register, loginWithExternalToken, isLoading, error, clearError } = useAuthStore();

  // ── Manejar cambios ────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (localError) setLocalError("");
    if (error) clearError();
  };

  // ── Validaciones ───────────────────────────────────────────────────────────
  const validateForm = () => {
    if (mode === "external") {
      return manualToken.trim() ? null : "Por favor, pega tu token de acceso.";
    }
    if (!form.email || !form.password) {
      return "Por favor completa todos los campos.";
    }
    if (mode === "register") {
      if (!form.displayName.trim()) return "Escribe el nombre de tu negocio.";
      if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden.";
      if (form.password.length < 6) return "La contraseña debe tener mínimo 6 caracteres.";
    }
    return null;
  };

  // ── Enviar ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    if (mode === "external") {
      await loginWithExternalToken(manualToken);
    } else if (mode === "login") {
      await login(form.email, form.password);
    } else {
      await register(form.email, form.password, form.displayName);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Logo y Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2rem] mb-6 shadow-2xl shadow-emerald-200">
            <Store className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tighter uppercase">Mercado Digital</h1>
          <p className="text-stone-400 text-xs font-black uppercase tracking-widest mt-2">Tu negocio inteligente</p>
        </div>

        {/* Selector de modo */}
        <div className="flex bg-stone-50 rounded-2xl p-1.5 mb-8 border border-stone-100">
          {["login", "register", "external"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setLocalError(""); clearError(); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                mode === m ? "bg-white text-stone-900 shadow-md" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {m === "login" ? "Entrar" : m === "register" ? "Registro" : "Acceso Directo"}
            </button>
          ))}
        </div>

        {/* Formulario Principal */}
        <div className="space-y-6">
          
          {mode === "external" ? (
            <div className="space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Si ya tienes una sesión activa en el portal principal, obtén tu token para ingresar instantáneamente.
                </p>
              </div>
              <a 
                href="https://publixia-5a733.web.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-full bg-white border-2 border-stone-100 py-4 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm"
              >
                <Key className="mr-3 text-stone-300 group-hover:text-emerald-500 transition-colors" size={18} />
                <span className="text-stone-700 font-black text-[10px] uppercase tracking-widest group-hover:text-emerald-700">Obtener Token de Acceso</span>
              </a>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                  Pega tu Código (Bearer Token)
                </label>
                <textarea
                  rows={4}
                  placeholder="Bearer eyJhbGciOiJIUzI1..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 text-[10px] font-mono focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nombre de tu negocio</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="text"
                      placeholder="Ej: Tienda Virtual Pro"
                      value={form.displayName}
                      onChange={(e) => handleChange("displayName", e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="email"
                    placeholder="usuario@comercio.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Confirmar seguridad</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-100 bg-stone-50 font-bold text-stone-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {displayError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3 animate-shake">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-red-700 text-xs font-black uppercase tracking-tight leading-tight">{displayError}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full py-5 rounded-2xl bg-stone-900 text-white font-black text-sm uppercase tracking-[0.15em] shadow-2xl shadow-stone-200 hover:bg-black disabled:bg-stone-200 disabled:text-stone-400 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              mode === "login" ? "Entrar a mi Negocio" : mode === "register" ? "Crear mi Cuenta" : "Validar y Entrar"
            )}
          </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
           <p className="text-[9px] font-black text-stone-300 uppercase tracking-[0.3em]">Mercado Digital 2026</p>
           <div className="flex gap-1.5">
              <div className="w-4 h-1 bg-yellow-400 rounded-full" />
              <div className="w-4 h-1 bg-blue-600 rounded-full" />
              <div className="w-4 h-1 bg-red-600 rounded-full" />
           </div>
        </div>
      </div>
    </div>
  );
}

// Sub-componente para errores visuales
function AlertCircle({ className, size }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}