/**
 * @fileoverview Create Chain state management store
 *
 * This store manages the multi-step chain creation process, maintaining
 * form data across different steps.
 *
 * @author Canopy Development Team
 * @version 1.0.0
 */

import { create } from "zustand";
import {
  devtools,
  persist,
  createJSONStorage,
  StateStorage,
} from "zustand/middleware";
import { Template } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateChainFormData {
  // Step 1: Template/Language
  template: Template | null;

  // Step 2: Connect Repo
  githubRepo: string;
  githubValidated: boolean;
  githubRepoData: {
    name: string;
    fullName: string;
    htmlUrl: string;
    defaultBranch: string;
    owner: string;
    language?: string;
    description?: string | null;
    cloneUrl: string;
  } | null;

  // Step 3: Main Info
  chainName: string;
  tokenName: string;
  ticker: string;
  tokenSupply: string;
  decimals: string;
  description: string;
  halvingDays: string;
  blockTime: string;

  // Step 4: Branding & Media
  logo: File | null;
  chainDescription: string;
  gallery: File[];
  brandColor: string;

  // Step 5: Links & Documentation
  socialLinks: Array<{
    id: number;
    platform: string;
    url: string;
  }>;
  resources: Array<{
    id: number;
    type: "file" | "url";
    file?: File;
    name: string;
    size?: number;
    url?: string;
    title?: string;
    description?: string;
  }>;

  // Step 6: Launch Settings
  launchDate: string;
  launchTime: string;
  timezone: string;
  launchImmediately: boolean;
  initialPurchaseAmount: string;
  graduationThreshold: number;
}

interface CreateChainState {
  // Form data
  formData: CreateChainFormData;

  // Current step tracking
  currentStep: number;
  completedSteps: number[];

  // Actions
  setFormData: (updates: Partial<CreateChainFormData>) => void;
  resetFormData: () => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
  canNavigateToStep: (step: number) => boolean;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialFormData: CreateChainFormData = {
  // Step 1
  template: null,

  // Step 2
  githubRepo: "",
  githubValidated: false,
  githubRepoData: null,

  // Step 3
  chainName: "",
  tokenName: "",
  ticker: "",
  tokenSupply: "1000000000",
  decimals: "18",
  description: "",
  halvingDays: "365",
  blockTime: "10",

  // Step 4
  logo: null,
  chainDescription: "",
  gallery: [],
  brandColor: "",

  // Step 5
  socialLinks: [],
  resources: [],

  // Step 6
  launchDate: "",
  launchTime: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  launchImmediately: true,
  initialPurchaseAmount: "",
  graduationThreshold: 50000,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

// Custom storage that properly implements Zustand's StateStorage interface
const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

export const useCreateChainStore = create<CreateChainState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        formData: initialFormData,
        currentStep: 1,
        completedSteps: [],

        // Actions
        setFormData: (updates) => {
          set((state) => ({
            formData: { ...state.formData, ...updates },
          }));
        },

        resetFormData: () => {
          set({
            formData: initialFormData,
            currentStep: 1,
            completedSteps: [],
          });
        },

        setCurrentStep: (step) => {
          set({ currentStep: step });
        },

        markStepCompleted: (step) => {
          set((state) => ({
            completedSteps: state.completedSteps.includes(step)
              ? state.completedSteps
              : [...state.completedSteps, step].sort((a, b) => a - b),
          }));
        },

        isStepCompleted: (step) => {
          return get().completedSteps.includes(step);
        },

        canNavigateToStep: (step) => {
          const { completedSteps } = get();
          // Can navigate to step 1 always
          if (step === 1) return true;
          // Can navigate if previous step is completed
          return completedSteps.includes(step - 1);
        },
      }),
      {
        name: "create-chain-store",
        storage: createJSONStorage(() => zustandStorage),
        partialize: (state) => ({
          // Persist form data but not Files
          formData: {
            ...state.formData,
            logo: null,
            gallery: [],
            resources: [], // Don't persist file resources
          },
          currentStep: state.currentStep,
          completedSteps: state.completedSteps,
        }),
        onRehydrateStorage: () => {
          return (state, error) => {
            if (error) {
              console.error("Failed to rehydrate create-chain store:", error);
            } else if (state) {
              console.log("✅ Create-chain store rehydrated:", {
                currentStep: state.currentStep,
                hasTemplate: !!state.formData.template,
                githubConnected: state.formData.githubValidated,
              });
            }
          };
        },
      }
    ),
    { name: "CreateChainStore" }
  )
);
