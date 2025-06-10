
import { create } from 'zustand';

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  data: any[];
  columns: string[];
  rows: number;
  domain: string;
  confidence: number;
  uploadDate: Date;
  dataQuality: number;
  detectedFeatures: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  charts?: any[];
}

interface AppState {
  // Dataset Management
  datasets: Dataset[];
  currentDataset: Dataset | null;
  
  // Navigation
  currentView: 'upload' | 'datasets' | 'dashboard' | 'insights' | 'chat';
  
  // Chat
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  
  // UI State
  sidebarExpanded: boolean;
  isLoading: boolean;
  
  // Actions
  addDataset: (dataset: Dataset) => void;
  setCurrentDataset: (dataset: Dataset | null) => void;
  setCurrentView: (view: 'upload' | 'datasets' | 'dashboard' | 'insights' | 'chat') => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  datasets: [],
  currentDataset: null,
  currentView: 'upload',
  chatMessages: [],
  isChatLoading: false,
  sidebarExpanded: true,
  isLoading: false,
  
  // Actions
  addDataset: (dataset) => set((state) => ({ 
    datasets: [...state.datasets, dataset],
    currentDataset: dataset
  })),
  
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  
  setCurrentView: (view) => set({ currentView: view }),
  
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  setChatLoading: (loading) => set({ isChatLoading: loading }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarExpanded: !state.sidebarExpanded 
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));
