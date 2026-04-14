import { create } from "zustand";

export type ProjectStatus = "idle" | "analyzing" | "generating" | "rendering" | "complete" | "error";

export interface Scene {
  id: string;
  title: string;
  script: string;
  duration: number;
  visualDescription: string;
}

export interface BrandData {
  name: string;
  tagline: string;
  colors: string[];
  tone: string;
  audience: string;
  cta: string;
  features: string[];
  logoUrl?: string;
  screenshots: string[];
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  status: "pending" | "parsed" | "error";
  context: string;
}

export interface GeneratedAsset {
  id: string;
  format: "reel" | "story" | "square" | "landscape" | "linkedin";
  label: string;
  width: number;
  height: number;
  previewUrl?: string;
  downloadUrl?: string;
  status: "pending" | "rendering" | "done" | "error";
}

export interface AppState {
  // Input
  url: string;
  documents: File[];
  setUrl: (url: string) => void;
  setDocuments: (docs: File[]) => void;

  // Project
  projectId: string | null;
  status: ProjectStatus;
  error: string | null;
  setProjectId: (id: string | null) => void;
  setStatus: (s: ProjectStatus) => void;
  setError: (e: string | null) => void;

  // Brand
  brand: BrandData | null;
  setBrand: (b: BrandData | null) => void;

  // Scenes
  scenes: Scene[];
  setScenes: (s: Scene[]) => void;

  // Assets
  assets: GeneratedAsset[];
  setAssets: (a: GeneratedAsset[]) => void;
  updateAsset: (id: string, patch: Partial<GeneratedAsset>) => void;

  // Uploads
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (f: UploadedFile[]) => void;
  fileContext: string;
  setFileContext: (c: string) => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Demo
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  url: "",
  documents: [] as File[],
  projectId: null as string | null,
  status: "idle" as ProjectStatus,
  error: null as string | null,
  brand: null as BrandData | null,
  scenes: [] as Scene[],
  assets: [] as GeneratedAsset[],
  uploadedFiles: [] as UploadedFile[],
  fileContext: "",
  darkMode: true,
  demoMode: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setUrl: (url) => set({ url }),
  setDocuments: (documents) => set({ documents }),
  setProjectId: (projectId) => set({ projectId }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setBrand: (brand) => set({ brand }),
  setScenes: (scenes) => set({ scenes }),
  setAssets: (assets) => set({ assets }),
  updateAsset: (id, patch) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    })),
  setUploadedFiles: (uploadedFiles) => set({ uploadedFiles }),
  setFileContext: (fileContext) => set({ fileContext }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDemoMode: (demoMode) => set({ demoMode }),
  reset: () => set(initialState),
}));
