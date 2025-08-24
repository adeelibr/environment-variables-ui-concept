"use client"

import { useLocalStorage } from "./use-local-storage"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"
import { mockEnvVariables } from "@/mock/env-variables"

const STORAGE_KEY = "env-variables"

export function useEnvVariables() {
  const [variables, setVariables, clearVariables] = useLocalStorage<EnvironmentVariable[]>(
    STORAGE_KEY,
    mockEnvVariables,
  )

  const addVariable = (variable: Omit<EnvironmentVariable, "id" | "createdAt" | "updatedAt">) => {
    const newVariable: EnvironmentVariable = {
      ...variable,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setVariables((prev) => [...prev, newVariable])
    return newVariable
  }

  const updateVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setVariables((prev) =>
      prev.map((variable) =>
        variable.id === id ? { ...variable, ...updates, updatedAt: new Date().toISOString() } : variable,
      ),
    )
  }

  const deleteVariable = (id: string) => {
    setVariables((prev) => prev.filter((variable) => variable.id !== id))
  }

  const deleteVariables = (ids: string[]) => {
    setVariables((prev) => prev.filter((variable) => !ids.includes(variable.id)))
  }

  const getVariablesByEnvironment = (environment: Environment) => {
    return variables.filter((variable) => variable.values[environment])
  }

  return {
    variables,
    addVariable,
    updateVariable,
    deleteVariable,
    deleteVariables,
    getVariablesByEnvironment,
    clearVariables,
  }
}
