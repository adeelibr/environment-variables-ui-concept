"use client"

import { useLocalStorage } from "./use-local-storage"
import type { ChangeSet, Change, Environment } from "@/types/env-vars"

const STORAGE_KEY = "env-history"

interface HistoryEntry {
  id: string
  timestamp: string
  action: "variable_created" | "variable_updated" | "variable_deleted" | "bulk_operation"
  description: string
  changes: Change[]
  variablesSnapshot?: any // Store the state at this point for time travel
}

/**
 * Simplified history/change tracking hook
 * Manages git-style change history for time travel functionality
 */
export function useEnvHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(STORAGE_KEY, [])

  const addHistoryEntry = (
    action: HistoryEntry["action"],
    description: string,
    changes: Change[],
    variablesSnapshot?: any
  ) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      action,
      description,
      changes,
      variablesSnapshot,
    }

    setHistory((prev) => [entry, ...prev.slice(0, 49)]) // Keep last 50 entries
  }

  const getHistory = () => history

  const clearHistory = () => {
    setHistory([])
  }

  // Git-style operations
  const getCommitHistory = () => {
    return history.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      message: entry.description,
      action: entry.action,
      changesCount: entry.changes.length,
    }))
  }

  const getCommitDetails = (commitId: string) => {
    return history.find(entry => entry.id === commitId)
  }

  const canTimeTravel = (commitId: string) => {
    const entry = history.find(h => h.id === commitId)
    return entry && entry.variablesSnapshot
  }

  // Simple change-set for staging changes (optional for future use)
  const [pendingChanges, setPendingChanges] = useLocalStorage<Change[]>("pending-changes", [])

  const addPendingChange = (change: Change) => {
    setPendingChanges(prev => {
      // Remove existing change for the same variable and environment
      const filtered = prev.filter(c => 
        !(c.varId === change.varId && JSON.stringify(c.environments) === JSON.stringify(change.environments))
      )
      return [...filtered, change]
    })
  }

  const removePendingChange = (changeId: string) => {
    setPendingChanges(prev => prev.filter(c => c.id !== changeId))
  }

  const clearPendingChanges = () => {
    setPendingChanges([])
  }

  const commitPendingChanges = (message: string, variablesSnapshot?: any) => {
    if (pendingChanges.length === 0) return

    addHistoryEntry("bulk_operation", message, pendingChanges, variablesSnapshot)
    clearPendingChanges()
  }

  return {
    // History operations
    history,
    addHistoryEntry,
    clearHistory,
    
    // Git-style operations  
    getCommitHistory,
    getCommitDetails,
    canTimeTravel,
    
    // Optional change-set staging (for future use)
    pendingChanges,
    addPendingChange,
    removePendingChange,
    clearPendingChanges,
    commitPendingChanges,
  }
}