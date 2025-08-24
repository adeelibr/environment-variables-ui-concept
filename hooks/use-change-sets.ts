"use client"

import { useLocalStorage } from "./use-local-storage"
import type { ChangeSet, Change, Environment } from "@/types/env-vars"
import { useToast } from "./use-toast"
import { mockChangeSets } from "@/mock/change-sets"

const STORAGE_KEY = "env-change-sets"

export function useChangeSets() {
  const [changeSets, setChangeSets, clearChangeSets] = useLocalStorage<ChangeSet[]>(STORAGE_KEY, mockChangeSets)
  const { toast } = useToast()

  const createChangeSet = (name: string, description?: string): ChangeSet => {
    const newChangeSet: ChangeSet = {
      id: Date.now().toString(),
      name,
      description,
      changes: [],
      environments: ["development"],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setChangeSets((prev) => [newChangeSet, ...prev])
    return newChangeSet
  }

  const addChangeToSet = (changeSetId: string, change: Omit<Change, "id">) => {
    const newChange: Change = {
      ...change,
      id: Date.now().toString(),
    }

    setChangeSets((prev) =>
      prev.map((changeSet) =>
        changeSet.id === changeSetId
          ? {
              ...changeSet,
              changes: [...changeSet.changes, newChange],
              updatedAt: new Date().toISOString(),
            }
          : changeSet,
      ),
    )
    return newChange
  }

  const removeChangeFromSet = (changeSetId: string, changeId: string) => {
    setChangeSets((prev) =>
      prev.map((changeSet) =>
        changeSet.id === changeSetId
          ? {
              ...changeSet,
              changes: changeSet.changes.filter((change) => change.id !== changeId),
              updatedAt: new Date().toISOString(),
            }
          : changeSet,
      ),
    )
  }

  const updateChangeSetEnvironments = (changeSetId: string, environments: Environment[]) => {
    setChangeSets((prev) =>
      prev.map((changeSet) =>
        changeSet.id === changeSetId ? { ...changeSet, environments, updatedAt: new Date().toISOString() } : changeSet,
      ),
    )
  }

  const applyChangeSet = (changeSetId: string) => {
    setChangeSets((prev) =>
      prev.map((changeSet) =>
        changeSet.id === changeSetId
          ? {
              ...changeSet,
              status: "applied" as const,
              appliedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : changeSet,
      ),
    )

    toast({
      title: "Changes Applied",
      description: "Your environment variables have been updated successfully.",
    })
  }

  const deleteChangeSet = (changeSetId: string) => {
    setChangeSets((prev) => prev.filter((changeSet) => changeSet.id !== changeSetId))
  }

  const getCurrentChangeSet = () => {
    return changeSets.find((changeSet) => changeSet.status === "draft") || null
  }

  const getOrCreateCurrentChangeSet = () => {
    const current = getCurrentChangeSet()
    if (current) return current

    return createChangeSet(`Changes ${new Date().toLocaleDateString()}`)
  }

  const addChange = (change: Omit<Change, "id">) => {
    const currentChangeSet = getOrCreateCurrentChangeSet()
    return addChangeToSet(currentChangeSet.id, change)
  }

  return {
    changeSets,
    createChangeSet,
    addChangeToSet,
    removeChangeFromSet,
    updateChangeSetEnvironments,
    applyChangeSet,
    deleteChangeSet,
    getCurrentChangeSet,
    getOrCreateCurrentChangeSet,
    clearChangeSets,
    addChange, // Added to exports
  }
}
