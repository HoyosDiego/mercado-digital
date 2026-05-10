// services/authService.ts
// Autenticación REAL leyendo el JWT guardado en localStorage

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

interface AuthListener {
  (user: UserProfile | null): void;
}

interface UnsubscribeFn {
  (): void;
}

export interface AuthService {
  onAuthStateChanged: (
    callback: AuthListener
  ) => UnsubscribeFn;

  signOut: () => Promise<void>;

  getUserProfile: () => Promise<UserProfile | null>;
  register: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
}

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const AUTH_URL = "https://us-central1-publixia-5a733.cloudfunctions.net/api/api/auth";
export const TOKEN_KEY = "mercadoDigitalToken";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getAuthHeaders = (): Record<
  string,
  string
> => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Decodifica JWT sin librerías
const decodeJwt = (
  token: string
): Record<string, any> | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (c) =>
            `%${(
              "00" +
              c.charCodeAt(0).toString(16)
            ).slice(-2)}`
        )
        .join("")
    );

    return JSON.parse(json);
  } catch (error) {
    console.error(
      "Error decodificando token:",
      error
    );
    return null;
  }
};

const isTokenExpired = (
  payload: Record<string, any>
): boolean => {
  if (!payload?.exp) return false;

  const now =
    Math.floor(Date.now() / 1000);

  return now >= payload.exp;
};

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export const authService: AuthService = {
  onAuthStateChanged: (
    callback
  ): UnsubscribeFn => {
    const user =
      authService.getUserProfile();

    user.then(callback).catch(() =>
      callback(null)
    );

    // escuchar cambios del localStorage
    const handleStorage = (
      event: StorageEvent
    ) => {
      if (event.key === TOKEN_KEY) {
        authService
          .getUserProfile()
          .then(callback)
          .catch(() =>
            callback(null)
          );
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  },

  getUserProfile:
    async (): Promise<UserProfile | null> => {
      try {
        const token = getToken();

        if (!token) return null;

        const payload =
          decodeJwt(token);

        if (!payload) return null;

        if (isTokenExpired(payload)) {
          localStorage.removeItem(
            TOKEN_KEY
          );
          return null;
        }

        return {
          uid:
            payload.user_id ||
            payload.sub ||
            "",

          email:
            payload.email || "",

          displayName:
            payload.name ||
            payload.displayName ||
            "Usuario",

          photoURL:
            payload.picture ||
            payload.photoURL ||
            null,
        };
      } catch (error) {
        console.error(
          "Error leyendo usuario:",
          error
        );

        return null;
      }
    },

  signOut: async (): Promise<void> => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  },

  register: async (email, password) => {
    const response = await fetch(`${AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error en registro");
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error en login");
    return data;
  },
};