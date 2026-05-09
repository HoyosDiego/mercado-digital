import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true, // Empezamos en true para la carga inicial
  error: null,

  // ─── Inicialización ────────────────────────────────────────────────
  initAuth: () => {
    set({ isLoading: true });
    // Usamos el listener que definimos en el authService
    const unsubscribe = authService.onAuthStateChanged((user) => {
      set({ user, isLoading: false });
    });
    return unsubscribe;
  },

  // ─── Registro ──────────────────────────────────────────────────────
  register: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      // Aquí llamarías a tu endpoint de registro si existiera, 
      // o podrías simular el éxito para desarrollo:
      console.log("Registrando usuario:", { email, displayName });

      // Simulación de respuesta exitosa
      const mockUser = { uid: "new-user", email, displayName };
      set({ user: mockUser, isLoading: false });
    } catch (err) {
      set({ error: "Error al crear la cuenta", isLoading: false });
    }
  },

  // ─── Login Tradicional ─────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Lógica de login...
      set({ isLoading: false });
    } catch (err) {
      set({ error: "Credenciales incorrectas", isLoading: false });
    }
  },

  // ─── Login con Token Externo (El que usas de la web de Publixia) ───
  loginWithExternalToken: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      localStorage.setItem("mercadoDigitalToken", token);
      const user = await authService.getUserProfile();
      if (user) {
        set({ user, isLoading: false });
      } else {
        throw new Error("Token inválido");
      }
    } catch (err) {
      set({ error: "El token no es válido o expiró", isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
})); 