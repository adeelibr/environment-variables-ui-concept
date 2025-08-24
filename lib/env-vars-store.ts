import { create } from "zustand"
import type { EnvVar, Environment } from "@/types/env-vars"

interface EnvVarsState {
  variables: EnvVar[]
  selectedVarIds: string[]
  bulkMode: boolean
  revealedVars: Set<string>
  revealTimers: Map<string, NodeJS.Timeout>
  searchQuery: string
  selectedEnvironment: Environment | "all"

  // Actions
  setVariables: (variables: EnvVar[]) => void
  addVariable: (variable: EnvVar) => void
  updateVariable: (id: string, updates: Partial<EnvVar>) => void
  deleteVariable: (id: string) => void
  deleteVariables: (ids: string[]) => void

  // Selection
  selectVariable: (id: string, multi?: boolean) => void
  selectAll: () => void
  clearSelection: () => void
  toggleBulkMode: () => void

  // Reveal/Hide
  revealVariable: (id: string) => void
  hideVariable: (id: string) => void
  hideAllVariables: () => void

  // Search & Filter
  setSearchQuery: (query: string) => void
  setSelectedEnvironment: (env: Environment | "all") => void

  // Drag & Drop
  moveVariables: (varIds: string[], sourceEnv: Environment, targetEnv: Environment, operation: "copy" | "move") => void
}

// Mock data for development
const mockVariables: EnvVar[] = [
  {
    id: "1",
    name: "DATABASE_URL",
    values: {
      development: "postgresql://localhost:5432/myapp_dev",
      preview: "postgresql://preview.db.com/myapp",
      production: "postgresql://prod.db.com/myapp",
    },
    isSecret: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    description: "Main database connection string",
  },
  {
    id: "2",
    name: "API_KEY",
    values: {
      development: "dev_key_123",
      preview: "preview_key_456",
      production: "prod_key_789",
    },
    isSecret: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    description: "Third-party API key",
  },
  {
    id: "3",
    name: "APP_URL",
    values: {
      development: "http://localhost:3000",
      preview: "https://preview.myapp.com",
      production: "https://myapp.com",
    },
    isSecret: false,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-15"),
    description: "Application base URL",
  },
  {
    id: "4",
    name: "REDIS_URL",
    values: {
      development: "redis://localhost:6379",
      production: "redis://prod.redis.com:6379",
    },
    isSecret: true,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-22"),
    description: "Redis cache connection",
  },
]

export const useEnvVarsStore = create<EnvVarsState>((set, get) => ({
  variables: mockVariables,
  selectedVarIds: [],
  bulkMode: false,
  revealedVars: new Set(),
  revealTimers: new Map(),
  searchQuery: "",
  selectedEnvironment: "all",

  setVariables: (variables) => set({ variables }),

  addVariable: (variable) =>
    set((state) => ({
      variables: [...state.variables, variable],
    })),

  updateVariable: (id, updates) =>
    set((state) => ({
      variables: state.variables.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date() } : v)),
    })),

  deleteVariable: (id) =>
    set((state) => ({
      variables: state.variables.filter((v) => v.id !== id),
      selectedVarIds: state.selectedVarIds.filter((vid) => vid !== id),
    })),

  deleteVariables: (ids) =>
    set((state) => ({
      variables: state.variables.filter((v) => !ids.includes(v.id)),
      selectedVarIds: state.selectedVarIds.filter((vid) => !ids.includes(vid)),
    })),

  selectVariable: (id, multi = false) =>
    set((state) => {
      if (!multi) {
        return { selectedVarIds: [id], bulkMode: true }
      }

      const isSelected = state.selectedVarIds.includes(id)
      const newSelection = isSelected ? state.selectedVarIds.filter((vid) => vid !== id) : [...state.selectedVarIds, id]

      return {
        selectedVarIds: newSelection,
        bulkMode: newSelection.length > 0,
      }
    }),

  selectAll: () =>
    set((state) => {
      const filteredVars = state.variables.filter((v) => {
        const matchesSearch = v.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        const matchesEnv = state.selectedEnvironment === "all" || v.values[state.selectedEnvironment] !== undefined
        return matchesSearch && matchesEnv
      })

      return {
        selectedVarIds: filteredVars.map((v) => v.id),
        bulkMode: filteredVars.length > 0,
      }
    }),

  clearSelection: () => set({ selectedVarIds: [], bulkMode: false }),

  toggleBulkMode: () =>
    set((state) => ({
      bulkMode: !state.bulkMode,
      selectedVarIds: state.bulkMode ? [] : state.selectedVarIds,
    })),

  revealVariable: (id) =>
    set((state) => {
      const newRevealed = new Set(state.revealedVars)
      newRevealed.add(id)

      // Clear existing timer
      const existingTimer = state.revealTimers.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set 30-second auto-hide timer
      const newTimers = new Map(state.revealTimers)
      const timer = setTimeout(() => {
        set((currentState) => {
          const updatedRevealed = new Set(currentState.revealedVars)
          updatedRevealed.delete(id)
          const updatedTimers = new Map(currentState.revealTimers)
          updatedTimers.delete(id)
          return { revealedVars: updatedRevealed, revealTimers: updatedTimers }
        })
      }, 30000)

      newTimers.set(id, timer)

      return { revealedVars: newRevealed, revealTimers: newTimers }
    }),

  hideVariable: (id) =>
    set((state) => {
      const newRevealed = new Set(state.revealedVars)
      newRevealed.delete(id)

      const existingTimer = state.revealTimers.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const newTimers = new Map(state.revealTimers)
      newTimers.delete(id)

      return { revealedVars: newRevealed, revealTimers: newTimers }
    }),

  hideAllVariables: () =>
    set((state) => {
      // Clear all timers
      state.revealTimers.forEach((timer) => clearTimeout(timer))

      return {
        revealedVars: new Set(),
        revealTimers: new Map(),
      }
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedEnvironment: (env) => set({ selectedEnvironment: env }),

  moveVariables: (varIds, sourceEnv, targetEnv, operation) =>
    set((state) => {
      const updatedVariables = state.variables.map((variable) => {
        if (!varIds.includes(variable.id)) return variable

        const sourceValue = variable.values[sourceEnv]
        if (!sourceValue) return variable

        const newValues = { ...variable.values }

        // Copy or move the value
        newValues[targetEnv] = sourceValue

        // If moving, remove from source
        if (operation === "move" && sourceEnv !== targetEnv) {
          delete newValues[sourceEnv]
        }

        return {
          ...variable,
          values: newValues,
          updatedAt: new Date(),
        }
      })

      return { variables: updatedVariables }
    }),
}))
