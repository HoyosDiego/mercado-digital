// services/inventoryService.ts
// Servicio corregido REAL backend Publixia
// Inventory + Publications + Token Auth

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  userId?: string;
  nombre?: string;
  precio?: number | string;
  descripcion?: string;
  categoria?: string;
  ubicacion?: string;
  status: string;
  tags?: string[];
  imageUrl?: string | null;
  createdAt: string;
}

export interface PublicationItem {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "PENDING";
  imageUrl: string;
  titulo: string;
  precio: string | number;
  createdAt: string;
}

export interface GetPublicationsResponse {
  success: boolean;
  count: number;
  publications: PublicationItem[];
}

export interface InitPublicationResponse {
  success?: boolean;
  publicationId: string;
  questions?: string[];
  draftData?: Record<string, unknown>;
  message?: string;
}

export interface AnswerPublicationResponse {
  success?: boolean;
  publicationId: string;
  questions?: string[];
  draftData?: Record<string, unknown>;
  completed?: boolean;
}

export interface PublishPublicationResponse {
  success: boolean;
  item?: PublicationItem;
  message?: string;
}

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

const API_URL =
  ((import.meta.env.VITE_GEMINI_API_URL as string | undefined)?.trim()) ||
  "https://us-central1-publixia-5a733.cloudfunctions.net/api/api";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const getToken = (): string | null => {
  return localStorage.getItem("mercadoDigitalToken");
};

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const getAuthHeadersWithoutJson = (): Record<string, string> => {
  const token = getToken();

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseJson = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      "Error inesperado"
    );
  }

  return data;
};

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export const inventoryService = {
  // ─────────────────────────────────────────
  // PUBLICATIONS LIST REAL
  // GET /publications
  // ─────────────────────────────────────────
  async getPublications(): Promise<PublicationItem[]> {
    const response = await fetch(
      `${API_URL}/publications`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    console.log("Respuesta de getPublications:", response);

    const data: GetPublicationsResponse =
      await parseJson(response);

    console.log("Respuesta de getPublications:", data);

    return data.publications || [];
  },

  // ─────────────────────────────────────────
  // LEGACY SUPPORT
  // ─────────────────────────────────────────
  async getItemsByUser(): Promise<PublicationItem[]> {
    return await this.getPublications();
  },

  // ─────────────────────────────────────────
  // CREATE MANUAL ITEM (legacy)
  // ─────────────────────────────────────────
  async createItem(
    userId: string,
    itemData: Record<string, unknown>
  ) {
    const response = await fetch(
      `${API_URL}/inventory`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...itemData,
          userId,
        }),
      }
    );

    return await parseJson(response);
  },

  async updateItem(
    itemId: string,
    updates: Record<string, unknown>
  ) {
    const response = await fetch(
      `${API_URL}/inventory/${itemId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    return await parseJson(response);
  },

  async deleteItem(itemId: string) {
    const response = await fetch(
      `${API_URL}/inventory/${itemId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    return await parseJson(response);
  },

  // ─────────────────────────────────────────
  // IA FLOW
  // ─────────────────────────────────────────

  // STEP 1
  async initPublication(
    file: File,
    intent = "Quiero publicar esto"
  ): Promise<InitPublicationResponse> {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("intent", intent);

    const response = await fetch(
      `${API_URL}/publications/init`,
      {
        method: "POST",
        headers:
          getAuthHeadersWithoutJson(),
        body: formData,
      }
    );

    return await parseJson(response);
  },

  // STEP 2
  async answerPublication(
    publicationId: string,
    answers: Record<string, string>
  ): Promise<AnswerPublicationResponse> {
    const response = await fetch(
      `${API_URL}/publications/${publicationId}/answer`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          answers,
        }),
      }
    );

    return await parseJson(response);
  },

  // STEP 3
  async publishPublication(
    publicationId: string,
    finalData: Record<string, unknown>
  ): Promise<PublishPublicationResponse> {
    const response = await fetch(
      `${API_URL}/publications/${publicationId}/publish`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          finalData,
        }),
      }
    );

    return await parseJson(response);
  },
};