// store/inventoryStore.ts
// Zustand Store adaptado a Publications (REAL BACKEND)

import { create } from "zustand";
import {
  inventoryService,
  PublicationItem,
} from "../services/inventoryService";

// ─────────────────────────────────────────────
// CONSTANTS (NO BORRAR)
// ─────────────────────────────────────────────

export const CATEGORIES = {
  PRODUCTO: "PRODUCTO",
  SERVICIO: "SERVICIO",
  ARRIENDO: "ARRIENDO",

  // filtros de estado
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export const LOCATIONS = {
  CALI: "CALI",
  CANDELARIA: "CANDELARIA",
  PALMIRA: "PALMIRA",
  YUMBO: "YUMBO",
  JAMUNDI: "JAMUNDI",
  VILLA_DEL_ROSA: "VILLA_DEL_ROSA",

  // filtros de fecha
  TODAY: "today",
  WEEK: "week",
} as const;

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type ViewType =
  | "dashboard"
  | "digitizer"
  | "catalog"
  | "publication_detail";

type CategoryFilter =
  | "all"
  | "DRAFT"
  | "PUBLISHED";

type LocationFilter =
  | "all"
  | "today"
  | "week";

interface InventoryStoreState {
  currentView: ViewType;

  items: PublicationItem[];
  isLoadingItems: boolean;
  itemsError: string | null;

  filterCategory: CategoryFilter;
  filterLocation: LocationFilter;
  searchQuery: string;

  publicationId: string | null;
  questions: string[];
  draftData: Record<string, unknown> | null;
  isAnalyzing: boolean;
  isPublishing: boolean;
  flowError: string | null;

  selectedItem: PublicationItem | null;

  setView: (
    view: ViewType
  ) => void;

  setSelectedItem: (
    item: PublicationItem | null
  ) => void;

  fetchItems: () => Promise<void>;

  setFilterCategory: (
    value: CategoryFilter
  ) => void;

  setFilterLocation: (
    value: LocationFilter
  ) => void;

  setSearchQuery: (
    value: string
  ) => void;

  getFilteredItems: () => PublicationItem[];

  startPublication: (
    file: File,
    intent?: string
  ) => Promise<void>;

  answerQuestions: (
    answers: Record<string, string>
  ) => Promise<void>;

  publishFinal: (
    finalData: Record<string, unknown>
  ) => Promise<void>;

  publishExistingDraft: (
    publicationId: string,
    finalData: Record<string, unknown>
  ) => Promise<void>;

  resetFlow: () => void;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const isToday = (
  date: Date
) => {
  const now = new Date();

  return (
    date.getDate() ===
    now.getDate() &&
    date.getMonth() ===
    now.getMonth() &&
    date.getFullYear() ===
    now.getFullYear()
  );
};

const isThisWeek = (
  date: Date
) => {
  const now = new Date();
  const lastWeek =
    new Date();

  lastWeek.setDate(
    now.getDate() - 7
  );

  return date >= lastWeek;
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useInventoryStore =
  create<InventoryStoreState>(
    (set, get) => ({
      currentView:
        "dashboard",

      items: [],
      isLoadingItems: false,
      itemsError: null,

      filterCategory:
        "all",
      filterLocation:
        "all",
      searchQuery: "",

      publicationId: null,
      questions: [],
      draftData: null,
      isAnalyzing: false,
      isPublishing: false,
      flowError: null,

      selectedItem: null,

      setView: (
        view
      ) =>
        set({
          currentView:
            view,
        }),

      setSelectedItem: (item) =>
        set({
          selectedItem: item,
        }),

      setFilterCategory:
        (value) =>
          set({
            filterCategory:
              value,
          }),

      setFilterLocation:
        (value) =>
          set({
            filterLocation:
              value,
          }),

      setSearchQuery:
        (value) =>
          set({
            searchQuery:
              value,
          }),

      // ─────────────────────
      // FETCH
      // ─────────────────────
      fetchItems:
        async () => {
          try {
            set({
              isLoadingItems: true,
              itemsError: null,
            });

            const data =
              await inventoryService.getPublications();

            // Mapeamos PENDING_PUBLISH a DRAFT para simplificar los estados
            const mappedItems = data.map((item: any) => ({
              ...item,
              status: item.status === "PENDING_PUBLISH" ? "DRAFT" : item.status
            }));

            set({
              items: mappedItems,
              isLoadingItems: false,
            });
          } catch (
          error: any
          ) {
            set({
              isLoadingItems: false,
              itemsError:
                error.message ||
                "Error cargando publicaciones",
            });
          }
        },

      // ─────────────────────
      // FILTER
      // ─────────────────────
      getFilteredItems:
        () => {
          const {
            items,
            filterCategory,
            filterLocation,
            searchQuery,
          } = get();

          return items.filter(
            (item) => {
              const title =
                (
                  item.titulo ||
                  ""
                ).toLowerCase();

              const query =
                searchQuery.toLowerCase();

              const bySearch =
                !query ||
                title.includes(
                  query
                );

              const byCategory =
                filterCategory ===
                "all" ||
                item.status ===
                filterCategory;

              let byDate =
                true;

              const createdAt =
                new Date(
                  item.createdAt
                );

              if (
                filterLocation ===
                "today"
              ) {
                byDate =
                  isToday(
                    createdAt
                  );
              }

              if (
                filterLocation ===
                "week"
              ) {
                byDate =
                  isThisWeek(
                    createdAt
                  );
              }

              return (
                bySearch &&
                byCategory &&
                byDate
              );
            }
          );
        },

      // ─────────────────────
      // IA FLOW
      // ─────────────────────
      startPublication: async (file, intent = "Quiero publicar esto") => {
        try {
          set({ isAnalyzing: true, flowError: null });

          // PASO 1: Iniciar (Subir foto e intent)
          const initData: any = await inventoryService.initPublication(file, intent);
          
          const publicationId = initData.publicationId;
          // Las preguntas vienen en la raíz del objeto, no en analysis
          const initialQuestions = initData.questions || initData.analysis?.questions || [];

          // PASO 2 AUTOMÁTICO: Enviar las preguntas sugeridas inmediatamente para obtener la descripción final
          const answers = initialQuestions.reduce((acc: any, q: string) => {
            acc[q] = "";
            return acc;
          }, {});

          const answerData: any = await inventoryService.answerPublication(publicationId, answers);
          
          set({
            publicationId,
            questions: [], 
            draftData: answerData.finalData || answerData.recommendation || answerData.draftData || initData.draftData || initData.analysis || null,
            isAnalyzing: false,
          });
        } catch (error: any) {
          let friendlyMessage = "Error analizando imagen";
          const errorStr = String(error.message || "");
          if (errorStr.includes("429") || errorStr.includes("quota")) {
            friendlyMessage = "La IA está muy ocupada. Intenta de nuevo en unos segundos.";
          }
          set({
            isAnalyzing: false,
            flowError: friendlyMessage,
          });
        }
      },

      answerQuestions: async (answers) => {
        const { publicationId } = get();
        if (!publicationId) return;

        try {
          set({ isAnalyzing: true, flowError: null });

          const data: any = await inventoryService.answerPublication(publicationId, answers);

          set({
            questions: [],
            draftData: data.finalData || data.recommendation || data.draftData || null,
            isAnalyzing: false,
          });
        } catch (error: any) {
          let friendlyMessage = "Error respondiendo";
          const errorStr = String(error.message || "");
          if (errorStr.includes("429") || errorStr.includes("quota")) {
            friendlyMessage = "La IA está procesando muchas solicitudes. Intenta en un momento.";
          }
          set({
            isAnalyzing: false,
            flowError: friendlyMessage,
          });
        }
      },

      publishFinal:
        async (
          finalData
        ) => {
          const {
            publicationId,
          } = get();

          if (
            !publicationId
          )
            return;

          try {
            set({
              isPublishing: true,
              flowError: null,
            });

            await inventoryService.publishPublication(
              publicationId,
              finalData
            );

            await get().fetchItems();

            set({
              publicationId: null,
              questions: [],
              draftData: null,
              isPublishing: false,
            });
          } finally {
            set({
              isPublishing: false,
            });
          }
        },

      publishExistingDraft:
        async (
          publicationId,
          finalData
        ) => {
          try {
            set({
              isPublishing: true,
              flowError: null,
            });

            await inventoryService.publishPublication(
              publicationId,
              finalData
            );

            await get().fetchItems();

            set({
              selectedItem: null,
              isPublishing: false,
              currentView: "catalog",
            });
          } catch (error: any) {
            let friendlyMessage = "Error publicando";
            const errorStr = String(error.message || "");
            if (errorStr.includes("429") || errorStr.includes("quota")) {
              friendlyMessage = "Estamos experimentando alta demanda. Por favor, intenta de nuevo en unos segundos.";
            }
            set({
              isPublishing: false,
              flowError: friendlyMessage,
            });
          }
        },

      resetFlow:
        () =>
          set({
            publicationId: null,
            questions: [],
            draftData: null,
            isAnalyzing: false,
            isPublishing: false,
            flowError: null,
          }),
    })
  );