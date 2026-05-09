// views/LoginView.jsx — Pantalla de autenticación corregida
import { useState } from "react";
import { useAuthStore } from "../store/authStore";

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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-200">
            <span className="text-white text-2xl">🏪</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Mercado Digital</h1>
          <p className="text-stone-500 text-sm mt-1">Tu negocio en internet hoy mismo</p>
        </div>

        {/* Selector de modo */}
        <div className="flex bg-stone-200 rounded-xl p-1 mb-6">
          {["login", "register", "external"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setLocalError(""); clearError(); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                mode === m ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
              }`}
            >
              {m === "login" ? "Entrar" : m === "register" ? "Crear Cuenta" : "Google/Token"}
            </button>
          ))}
        </div>

        {/* Formulario Principal */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4">
          
          {mode === "external" ? (
            <div className="space-y-4">
              <p className="text-sm text-stone-600 text-center">
                Para ingresar rápido, usa el botón de abajo y pega el código que te entregue la página.
              </p>
              <a 
                href="https://publixia-5a733.web.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-white border-2 border-emerald-100 py-3 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <span className="mr-2">🔑</span>
                <span className="text-emerald-700 font-bold text-sm">OBTENER MI TOKEN AQUÍ</span>
              </a>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5 ml-1">
                  Pega tu Token (Bearer)
                </label>
                <textarea
                  rows={3}
                  placeholder="Pega el código largo aquí..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre de tu negocio</label>
                  <input
                    type="text"
                    placeholder="Ej: Café La Finca"
                    value={form.displayName}
                    onChange={(e) => handleChange("displayName", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tucorreo@gmail.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Repetir contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              )}
            </>
          )}

          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-pulse">
              <p className="text-red-600 text-xs font-medium">{displayError}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isLoading ? "PROCESANDO..." : mode === "login" ? "ENTRAR A MI NEGOCIO" : mode === "register" ? "CREAR CUENTA GRATIS" : "VALIDAR TOKEN E INGRESAR"}
          </button>
        </div>

        <p className="text-center text-[10px] text-stone-400 mt-8 uppercase tracking-widest">
          Orgullosamente hecho en Cali 🇨🇴
        </p>
      </div>
    </div>
  );
}