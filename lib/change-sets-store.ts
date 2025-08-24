import { create } from "zustand"
import type { ChangeSet, EnvVarChange, Environment } from "@/types/env-vars"

interface ChangeSetStore {
  currentChangeSet: ChangeSet | null
  changeSets: ChangeSet[]

  // Change-set operations
  createChangeSet: (name: string, description?: string) => void
  addChange: (change: Omit<EnvVarChange, "id" | "timestamp">) => void
  removeChange: (changeId: string) => void
  updateChange: (changeId: string, updates: Partial<EnvVarChange>) => void

  // Bulk operations
  addBulkChanges: (changes: Omit<EnvVarChange, "id" | "timestamp">[]) => void
  applyToEnvironments: (changeId: string, environments: Environment[]) => void

  // Review and apply
  reviewChangeSet: () => void
  applyChangeSet: (changeSetId: string) => Promise<void>
  revertChangeSet: (changeSetId: string) => Promise<void>

  // Conflict detection
  detectConflicts: (changeSet: ChangeSet) => void
  resolveConflict: (conflictId: string, resolution: "keep_current" | "use_change") => void
}

export const useChangeSetStore = create<ChangeSetStore>((set, get) => ({
  currentChangeSet: null,
  changeSets: [],

  createChangeSet: (name, description) => {
    const newChangeSet: ChangeSet = {
      id: crypto.randomUUID(),
      name,
      description,
      changes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      conflicts: [],
    }

    set((state) => ({
      currentChangeSet: newChangeSet,
      changeSets: [...state.changeSets, newChangeSet],
    }))
  },

  addChange: (changeData) => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    const newChange: EnvVarChange = {
      ...changeData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        changes: [...currentChangeSet.changes, newChange],
        updatedAt: new Date(),
      },
    }))
  },

  removeChange: (changeId) => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        changes: currentChangeSet.changes.filter((c) => c.id !== changeId),
        updatedAt: new Date(),
      },
    }))
  },

  updateChange: (changeId, updates) => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        changes: currentChangeSet.changes.map((c) => (c.id === changeId ? { ...c, ...updates } : c)),
        updatedAt: new Date(),
      },
    }))
  },

  addBulkChanges: (changes) => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    const newChanges = changes.map((change) => ({
      ...change,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }))

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        changes: [...currentChangeSet.changes, ...newChanges],
        updatedAt: new Date(),
      },
    }))
  },

  applyToEnvironments: (changeId, environments) => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        changes: currentChangeSet.changes.map((c) => (c.id === changeId ? { ...c, environments } : c)),
        updatedAt: new Date(),
      },
    }))
  },

  reviewChangeSet: () => {
    const { currentChangeSet } = get()
    if (!currentChangeSet) return

    // Detect conflicts before review
    get().detectConflicts(currentChangeSet)

    set((state) => ({
      currentChangeSet: {
        ...currentChangeSet,
        status: "ready",
      },
    }))
  },

  applyChangeSet: async (changeSetId) => {
    // Implementation would apply changes to actual env vars
    set((state) => ({
      changeSets: state.changeSets.map((cs) => (cs.id === changeSetId ? { ...cs, status: "applied" } : cs)),
    }))
  },

  revertChangeSet: async (changeSetId) => {
    // Implementation would revert changes
    set((state) => ({
      changeSets: state.changeSets.map((cs) => (cs.id === changeSetId ? { ...cs, status: "reverted" } : cs)),
    }))
  },

  detectConflicts: (changeSet) => {
    // Mock conflict detection logic
    const conflicts = changeSet.changes
      .filter((change) => change.action === "update")
      .map((change) => ({
        varId: change.varId || "",
        varName: change.name,
        environment: change.environments[0],
        conflictType: "concurrent_edit" as const,
        details: "Another user has modified this variable",
      }))

    set((state) => ({
      currentChangeSet:
        changeSet.id === state.currentChangeSet?.id ? { ...changeSet, conflicts } : state.currentChangeSet,
    }))
  },

  resolveConflict: (conflictId, resolution) => {
    // Implementation would resolve conflicts
  },
}))
