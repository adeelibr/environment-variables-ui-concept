"use client"

import { useLocalStorage } from "./use-local-storage"
import { useState, useCallback } from "react"

const SELECTION_STORAGE_KEY = "env-selection"
const REVEAL_TIMERS_KEY = "env-reveal-timers"

interface SelectionState {
  selectedVarIds: string[]
  bulkMode: boolean
}

const defaultSelection: SelectionState = {
  selectedVarIds: [],
  bulkMode: false,
}

/**
 * Hook for managing environment variable selection and reveal functionality
 */
export function useEnvSelection() {
  const [selectionState, setSelectionState] = useLocalStorage<SelectionState>(SELECTION_STORAGE_KEY, defaultSelection)
  const [revealedVars, setRevealedVars] = useState<Set<string>>(new Set())
  const [revealTimers, setRevealTimers] = useState<Map<string, NodeJS.Timeout>>(new Map())

  const selectVariable = useCallback((id: string, multi = false) => {
    setSelectionState(prev => {
      if (!multi) {
        return { selectedVarIds: [id], bulkMode: true }
      }

      const isSelected = prev.selectedVarIds.includes(id)
      const newSelection = isSelected 
        ? prev.selectedVarIds.filter((vid) => vid !== id) 
        : [...prev.selectedVarIds, id]

      return {
        selectedVarIds: newSelection,
        bulkMode: newSelection.length > 0,
      }
    })
  }, [setSelectionState])

  const selectAll = useCallback((variableIds: string[]) => {
    setSelectionState({
      selectedVarIds: variableIds,
      bulkMode: variableIds.length > 0,
    })
  }, [setSelectionState])

  const clearSelection = useCallback(() => {
    setSelectionState(defaultSelection)
  }, [setSelectionState])

  const toggleBulkMode = useCallback(() => {
    setSelectionState(prev => ({
      bulkMode: !prev.bulkMode,
      selectedVarIds: prev.bulkMode ? [] : prev.selectedVarIds,
    }))
  }, [setSelectionState])

  const revealVariable = useCallback((id: string) => {
    setRevealedVars(prev => {
      const newRevealed = new Set(prev)
      newRevealed.add(id)
      return newRevealed
    })

    // Clear existing timer
    setRevealTimers(prev => {
      const existingTimer = prev.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set 30-second auto-hide timer
      const newTimers = new Map(prev)
      const timer = setTimeout(() => {
        setRevealedVars(current => {
          const updatedRevealed = new Set(current)
          updatedRevealed.delete(id)
          return updatedRevealed
        })
        setRevealTimers(currentTimers => {
          const updatedTimers = new Map(currentTimers)
          updatedTimers.delete(id)
          return updatedTimers
        })
      }, 30000)

      newTimers.set(id, timer)
      return newTimers
    })
  }, [])

  const hideVariable = useCallback((id: string) => {
    setRevealedVars(prev => {
      const newRevealed = new Set(prev)
      newRevealed.delete(id)
      return newRevealed
    })

    setRevealTimers(prev => {
      const existingTimer = prev.get(id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }
      const newTimers = new Map(prev)
      newTimers.delete(id)
      return newTimers
    })
  }, [])

  const hideAllVariables = useCallback(() => {
    // Clear all timers
    revealTimers.forEach((timer) => clearTimeout(timer))
    setRevealedVars(new Set())
    setRevealTimers(new Map())
  }, [revealTimers])

  return {
    selectedVarIds: selectionState.selectedVarIds,
    bulkMode: selectionState.bulkMode,
    revealedVars,
    selectVariable,
    selectAll,
    clearSelection,
    toggleBulkMode,
    revealVariable,
    hideVariable,
    hideAllVariables,
  }
}