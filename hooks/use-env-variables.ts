"use client"

import { useCallback } from "react"
import { useEnvState } from "./use-env-state"
import { useChangeSets } from "./use-change-sets"
import { useEnvHistory } from "./use-env-history"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"

/**
 * Unified hook for managing environment variables with integrated change tracking
 * This provides a single source of truth for all variable operations
 * Combines state management, change-sets, and history tracking
 */
export function useEnvVariables() {
  const envState = useEnvState()
  const changeSets = useChangeSets()
  const history = useEnvHistory()

  const createVariable = useCallback((
    variableData: Omit<EnvironmentVariable, "id" | "createdAt" | "updatedAt">
  ) => {
    // 1. Create the variable in state
    const newVariable = envState.addVariable(variableData)

    // 2. Get environments that have values
    const environmentsWithValues = Object.entries(variableData.values)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([env, _]) => env as Environment)

    // 3. Create change-set values structure
    const changeSetValues: Record<Environment, { before?: string; after?: string }> = {}
    environmentsWithValues.forEach((env) => {
      changeSetValues[env] = { 
        before: undefined, 
        after: variableData.values[env] 
      }
    })

    // 4. Add to change set for tracking
    const changeSet = changeSets.getOrCreateCurrentChangeSet()
    changeSets.addChangeToSet(changeSet.id, {
      varId: newVariable.id,
      name: variableData.name,
      action: "create",
      environments: environmentsWithValues,
      values: changeSetValues,
      isSecret: variableData.isSecret,
      description: variableData.description,
    })

    // 5. Track in history for time travel
    history.addHistoryEntry(
      "variable_created",
      `Created ${variableData.name}`,
      [{
        id: Date.now().toString(),
        varId: newVariable.id,
        name: variableData.name,
        action: "create",
        environments: environmentsWithValues,
        values: {},
        isSecret: variableData.isSecret,
        description: `Created ${variableData.name}`,
      }]
    )

    return newVariable
  }, [envState, changeSets, history])

  const updateVariable = useCallback((
    id: string,
    updates: Partial<EnvironmentVariable>
  ) => {
    const currentVariable = envState.variables.find(v => v.id === id)
    if (!currentVariable) {
      console.warn(`Variable with id ${id} not found`)
      return
    }

    // 1. Update the variable in state
    envState.updateVariable(id, updates)

    // 2. Track what changed for change-sets
    const changedEnvs: Environment[] = []
    const changedValues: Record<Environment, { before?: string; after?: string }> = {}
    
    // Check what values changed
    const environments: Environment[] = ["development", "preview", "production"]
    if (updates.values) {
      environments.forEach((env) => {
        const oldValue = currentVariable.values[env]
        const newValue = updates.values?.[env]
        
        if (oldValue !== newValue) {
          changedEnvs.push(env)
          changedValues[env] = { 
            before: oldValue, 
            after: newValue || undefined 
          }
        }
      })
    }

    // Check if metadata changed
    const nameChanged = updates.name && currentVariable.name !== updates.name
    const descriptionChanged = updates.description !== undefined && currentVariable.description !== updates.description
    const secretChanged = updates.isSecret !== undefined && currentVariable.isSecret !== updates.isSecret
    
    // 3. Add to change set if there were actual changes
    if (changedEnvs.length > 0 || nameChanged || descriptionChanged || secretChanged) {
      const metadataChanges: any = {}
      if (nameChanged) metadataChanges.name = { before: currentVariable.name, after: updates.name }
      if (descriptionChanged) metadataChanges.description = { before: currentVariable.description, after: updates.description }
      if (secretChanged) metadataChanges.isSecret = { before: currentVariable.isSecret, after: updates.isSecret }

      const changeSet = changeSets.getOrCreateCurrentChangeSet()
      changeSets.addChangeToSet(changeSet.id, {
        varId: id,
        name: updates.name || currentVariable.name,
        action: "update",
        environments: changedEnvs,
        values: changedValues,
        isSecret: updates.isSecret ?? currentVariable.isSecret,
        description: updates.description ?? currentVariable.description,
        ...(Object.keys(metadataChanges).length > 0 && { metadataChanges })
      })

      // 4. Track in history for time travel
      history.addHistoryEntry(
        "variable_updated",
        `Updated ${updates.name || currentVariable.name}`,
        [{
          id: Date.now().toString(),
          varId: id,
          name: updates.name || currentVariable.name,
          action: "update",
          environments: changedEnvs.length > 0 ? changedEnvs : ["development"], // Simplified
          values: {},
          isSecret: updates.isSecret ?? currentVariable.isSecret,
          description: `Updated ${updates.name || currentVariable.name}`,
        }]
      )
    }
  }, [envState, changeSets, history])

  const deleteVariable = useCallback((id: string) => {
    const currentVariable = envState.variables.find(v => v.id === id)
    if (!currentVariable) {
      console.warn(`Variable with id ${id} not found`)
      return
    }

    // 1. Remove from state
    envState.deleteVariable(id)

    // 2. Add to change set
    const changeSet = changeSets.getOrCreateCurrentChangeSet()
    changeSets.addChangeToSet(changeSet.id, {
      varId: id,
      name: currentVariable.name,
      action: "delete",
      environments: Object.keys(currentVariable.values).filter(env => 
        currentVariable.values[env as Environment]
      ) as Environment[],
      values: {},
      isSecret: currentVariable.isSecret,
      description: currentVariable.description,
    })

    // 3. Track in history
    history.addHistoryEntry(
      "variable_deleted",
      `Deleted ${currentVariable.name}`,
      [{
        id: Date.now().toString(),
        varId: id,
        name: currentVariable.name,
        action: "delete",
        environments: [],
        values: {},
        isSecret: currentVariable.isSecret,
        description: `Deleted ${currentVariable.name}`,
      }]
    )
  }, [envState, changeSets, history])

  // Re-export useful methods from sub-hooks
  return {
    // Core variable data
    variables: envState.variables,
    
    // Unified operations (recommended)
    createVariable,
    updateVariable,
    deleteVariable,
    
    // Change tracking data
    changeSets: changeSets.changeSets,
    getCurrentChangeSet: changeSets.getCurrentChangeSet,
    historyEntries: history.history, // Renamed for clarity
    
    // Direct access to sub-hook methods if needed
    envState,
    changeSets,
    historyHook: history, // Renamed for clarity
    
    // Utility methods
    getVariablesByEnvironment: envState.getVariablesByEnvironment,
    bulkUpdate: envState.bulkUpdate,
    clearVariables: envState.clearVariables,
  }
}