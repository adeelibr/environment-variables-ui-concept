"use client"

import { useState, useMemo } from "react"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"

const STORAGE_KEY = "env-search-filters"

export function useEnvSearch(variables: EnvironmentVariable[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>([
    "development",
    "preview",
    "production",
  ])
  const [showSecretsOnly, setShowSecretsOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "updated" | "created">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const filteredVariables = useMemo(() => {
    let filtered = variables

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (variable) =>
          variable.name.toLowerCase().includes(query) ||
          variable.description?.toLowerCase().includes(query) ||
          Object.values(variable.values).some((value) => value?.toLowerCase().includes(query)),
      )
    }

    // Filter by environment (show variables that have values in selected environments)
    if (selectedEnvironments.length > 0) {
      filtered = filtered.filter((variable) => selectedEnvironments.some((env) => variable.values[env]))
    }

    // Filter by secrets
    if (showSecretsOnly) {
      filtered = filtered.filter((variable) => variable.isSecret)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
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

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [variables, searchQuery, selectedEnvironments, showSecretsOnly, sortBy, sortOrder])

  const toggleEnvironment = (environment: Environment) => {
    setSelectedEnvironments((prev) =>
      prev.includes(environment) ? prev.filter((env) => env !== environment) : [...prev, environment],
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedEnvironments(["development", "preview", "production"])
    setShowSecretsOnly(false)
    setSortBy("name")
    setSortOrder("asc")
  }

  return {
    searchQuery,
    setSearchQuery,
    selectedEnvironments,
    setSelectedEnvironments,
    toggleEnvironment,
    showSecretsOnly,
    setShowSecretsOnly,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredVariables,
    clearFilters,
    hasActiveFilters: searchQuery || selectedEnvironments.length < 3 || showSecretsOnly,
  }
}
