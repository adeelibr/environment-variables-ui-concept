"use client"

import { useMemo } from "react"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"
import { useLocalStorage } from "./use-local-storage"
import { ENVIRONMENTS } from "@/lib/constants"

const STORAGE_KEY = "env-search-filters"

interface SearchFilters {
  searchQuery: string
  selectedEnvironments: Environment[]
  showSecretsOnly: boolean
  sortBy: "name" | "updated" | "created"
  sortOrder: "asc" | "desc"
}

const defaultFilters: SearchFilters = {
  searchQuery: "",
  selectedEnvironments: [...ENVIRONMENTS],
  showSecretsOnly: false,
  sortBy: "name",
  sortOrder: "asc",
}

export function useEnvSearch(variables: EnvironmentVariable[]) {
  const [filters, setFilters] = useLocalStorage<SearchFilters>(STORAGE_KEY, defaultFilters)

  const filteredVariables = useMemo(() => {
    let filtered = variables

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (variable) =>
          variable.name.toLowerCase().includes(query) ||
          variable.description?.toLowerCase().includes(query) ||
          Object.values(variable.values).some((value) => value?.toLowerCase().includes(query)),
      )
    }

    // Filter by environment (show variables that have values in selected environments)
    if (filters.selectedEnvironments.length > 0) {
      filtered = filtered.filter((variable) => filters.selectedEnvironments.some((env) => variable.values[env]))
    }

    // Filter by secrets
    if (filters.showSecretsOnly) {
      filtered = filtered.filter((variable) => variable.isSecret)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "updated":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case "created":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [variables, filters])

  const setSearchQuery = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }))
  }

  const setSelectedEnvironments = (selectedEnvironments: Environment[]) => {
    setFilters(prev => ({ ...prev, selectedEnvironments }))
  }

  const setShowSecretsOnly = (showSecretsOnly: boolean) => {
    setFilters(prev => ({ ...prev, showSecretsOnly }))
  }

  const setSortBy = (sortBy: "name" | "updated" | "created") => {
    setFilters(prev => ({ ...prev, sortBy }))
  }

  const setSortOrder = (sortOrder: "asc" | "desc") => {
    setFilters(prev => ({ ...prev, sortOrder }))
  }

  const toggleEnvironment = (environment: Environment) => {
    setFilters(prev => ({
      ...prev,
      selectedEnvironments: prev.selectedEnvironments.includes(environment) 
        ? prev.selectedEnvironments.filter((env) => env !== environment) 
        : [...prev.selectedEnvironments, environment]
    }))
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  return {
    searchQuery: filters.searchQuery,
    setSearchQuery,
    selectedEnvironments: filters.selectedEnvironments,
    setSelectedEnvironments,
    toggleEnvironment,
    showSecretsOnly: filters.showSecretsOnly,
    setShowSecretsOnly,
    sortBy: filters.sortBy,
    setSortBy,
    sortOrder: filters.sortOrder,
    setSortOrder,
    filteredVariables,
    clearFilters,
    hasActiveFilters: filters.searchQuery || filters.selectedEnvironments.length < ENVIRONMENTS.length || filters.showSecretsOnly,
  }
}
