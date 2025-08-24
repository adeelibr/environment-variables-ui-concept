import type { Environment } from "@/types/env-vars"
import { ENVIRONMENTS, getAllEnvironments } from "@/lib/constants"
import { useLocalStorage } from "./use-local-storage"

const STORAGE_KEY = "selected-environments"

/**
 * Common hook for managing environment selections and operations
 */
export function useEnvironments() {
  const [selectedEnvironments, setSelectedEnvironments] = useLocalStorage<Environment[]>(STORAGE_KEY, [...ENVIRONMENTS])

  const toggleEnvironment = (env: Environment) => {
    setSelectedEnvironments(prev => 
      prev.includes(env) 
        ? prev.filter(e => e !== env)
        : [...prev, env]
    )
  }

  const selectAllEnvironments = () => {
    setSelectedEnvironments(getAllEnvironments())
  }

  const clearEnvironments = () => {
    setSelectedEnvironments([])
  }

  const isEnvironmentSelected = (env: Environment): boolean => {
    return selectedEnvironments.includes(env)
  }

  const hasSelectedEnvironments = selectedEnvironments.length > 0

  return {
    selectedEnvironments,
    setSelectedEnvironments,
    toggleEnvironment,
    selectAllEnvironments,
    clearEnvironments,
    isEnvironmentSelected,
    hasSelectedEnvironments,
  }
}