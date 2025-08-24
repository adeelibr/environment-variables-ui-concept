import { useState } from "react"
import type { Environment } from "@/types/env-vars"
import { ENVIRONMENTS, getAllEnvironments } from "@/lib/constants"

/**
 * Common hook for managing environment selections and operations
 */
export function useEnvironments() {
  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>([...ENVIRONMENTS])

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