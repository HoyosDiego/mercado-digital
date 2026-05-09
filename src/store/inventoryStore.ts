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
  PENDING: "PENDING",
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
  | "catalog";

type CategoryFilter =
  | "all"
  | "DRAFT"
  | "PUBLISHED"
  | "PENDING";

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

  setView: (
    view: ViewType
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

      setView: (
        view
      ) =>
        set({
          currentView:
            view,
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

            set({
              items: data,
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
      startPublication:
        async (
          file,
          intent
        ) => {
          try {
            set({
              isAnalyzing: true,
              flowError: null,
            });

            const data =
              await inventoryService.initPublication(
                file,
                intent
              );

            set({
              publicationId:
                data.publicationId,
              questions:
                data.questions ||
                [],
              draftData:
                data.draftData ||
                null,
              isAnalyzing: false,
            });
          } catch (
            error: any
          ) {
            set({
              isAnalyzing: false,
              flowError:
                error.message ||
                "Error analizando imagen",
            });
          }
        },

      answerQuestions:
        async (
          answers
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
              isAnalyzing: true,
              flowError: null,
            });

            const data =
              await inventoryService.answerPublication(
                publicationId,
                answers
              );

            set({
              questions:
                data.questions ||
                [],
              draftData:
                data.draftData ||
                null,
              isAnalyzing: false,
            });
          } catch (
            error: any
          ) {
            set({
              isAnalyzing: false,
              flowError:
                error.message ||
                "Error respondiendo",
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
          } catch (
            error: any
          ) {
            set({
              isPublishing: false,
              flowError:
                error.message ||
                "Error publicando",
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