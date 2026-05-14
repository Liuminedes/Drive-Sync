import { create } from 'zustand';

interface StoreState {
  tenantId: string | null;
  setTenantId: (id: string) => void;
  user: any | null; // Puedes tiparlo más específicamente si conoces la estructura
  setUser: (user: any) => void;
}

export const useStore = create<StoreState>((set) => ({
  tenantId: null, // Por defecto null, se debe obtener al inicializar o por URL
  setTenantId: (id) => set({ tenantId: id }),
  user: null,
  setUser: (user) => set({ user }),
}));
