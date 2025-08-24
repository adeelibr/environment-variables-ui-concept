"use client"

import { useLocalStorage } from "./use-local-storage"
import { useToast } from "./use-toast"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"
import { mockEnvVariables } from "@/mock/env-variables"

const STORAGE_KEY = "env-variables"

/**
 * Main hook for current environment variables state
 * This is the single source of truth for current variable values
 */
export function useEnvState() {
  const [variables, setVariables, clearVariables] = useLocalStorage<EnvironmentVariable[]>(
    STORAGE_KEY,
    mockEnvVariables,
  )
  const { toast } = useToast()

  const addVariable = (variable: Omit<EnvironmentVariable, "id" | "createdAt" | "updatedAt">) => {
    const newVariable: EnvironmentVariable = {
      ...variable,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setVariables((prev) => [...prev, newVariable])
    
    toast({
      title: "Variable Added",
      description: `${variable.name} has been added successfully.`,
    })
    
    return newVariable
  }

  const updateVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setVariables((prev) =>
      prev.map((variable) =>
        variable.id === id ? { ...variable, ...updates, updatedAt: new Date().toISOString() } : variable,
      ),
    )
    
    toast({
      title: "Variable Updated", 
      description: `Changes have been saved successfully.`,
    })
  }

  const deleteVariable = (id: string) => {
    const variable = variables.find(v => v.id === id)
    setVariables((prev) => prev.filter((variable) => variable.id !== id))
    
    if (variable) {
      toast({
        title: "Variable Deleted",
        description: `${variable.name} has been removed.`,
      })
    }
  }

  const deleteVariables = (ids: string[]) => {
    setVariables((prev) => prev.filter((variable) => !ids.includes(variable.id)))
    
    toast({
      title: "Variables Deleted",
      description: `${ids.length} variables have been removed.`,
    })
  }

  const getVariablesByEnvironment = (environment: Environment) => {
    return variables.filter((variable) => variable.values[environment])
  }

  const bulkUpdate = (updates: Array<{ id: string; updates: Partial<EnvironmentVariable> }>) => {
    setVariables((prev) => 
      prev.map((variable) => {
        const update = updates.find(u => u.id === variable.id)
        return update 
          ? { ...variable, ...update.updates, updatedAt: new Date().toISOString() }
          : variable
      })
    )
    
    toast({
      title: "Bulk Update Complete",
      description: `${updates.length} variables have been updated.`,
    })
  }

  return {
    variables,
    addVariable,
    updateVariable,
    deleteVariable,
    deleteVariables,
    getVariablesByEnvironment,
    bulkUpdate,
    clearVariables,
  }
}