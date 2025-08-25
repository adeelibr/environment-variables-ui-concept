"use client"

import { useState } from "react"
import { Eye, EyeOff, Edit, Trash2, Copy, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useEnvVariables } from "@/hooks/use-env-variables"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"

interface EnvVarsTableProps {
  variables: EnvironmentVariable[]
  onEditVariable?: (variable: EnvironmentVariable) => void
}

export function EnvVarsTable({ variables, onEditVariable }: EnvVarsTableProps) {
  const { updateVariable, deleteVariable } = useEnvVariables()

  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set())
  const [editingVar, setEditingVar] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<Environment, string>>({
    development: "",
    preview: "",
    production: "",
  })

  const environments: Environment[] = ["development", "preview", "production"]

  const toggleSecretVisibility = (varId: string) => {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(varId)) {
        newSet.delete(varId)
      } else {
        newSet.add(varId)
      }
      return newSet
    })
  }

  const startEditing = (variable: EnvironmentVariable) => {
    setEditingVar(variable.id)
    setEditValues({
      development: variable.values.development || "",
      preview: variable.values.preview || "",
      production: variable.values.production || "",
    })
  }

  const saveChanges = (variable: EnvironmentVariable) => {
    const newVariableValues = { ...variable.values }

    // Update values based on editing state
    const environments: Environment[] = ["development", "preview", "production"]
    environments.forEach((env) => {
      const newValue = editValues[env]
      newVariableValues[env] = newValue || undefined
    })

    // Use unified update - all change tracking handled internally
    updateVariable(variable.id, { values: newVariableValues })
    setEditingVar(null)
  }

  const handleDeleteVariable = (variable: EnvironmentVariable) => {
    // Use unified delete - all change tracking handled internally
    deleteVariable(variable.id)
  }

  const renderValue = (variable: EnvironmentVariable, env: Environment) => {
    const value = variable.values[env]
    const isEditing = editingVar === variable.id
    const isVisible = visibleSecrets.has(variable.id)
    const displayValue = variable.isSecret && !isVisible ? "••••••••" : value

    if (isEditing) {
      return (
        <Input
          value={editValues[env]}
          onChange={(e) => setEditValues((prev) => ({ ...prev, [env]: e.target.value }))}
          className="h-8 text-sm"
          type={variable.isSecret && !isVisible ? "password" : "text"}
        />
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-foreground">
          {value ? displayValue : <span className="text-muted-foreground">—</span>}
        </span>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(value)}
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  if (variables.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No environment variables</h3>
          <p className="text-sm">Get started by adding your first environment variable.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-walkthrough="variables-table">
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[200px_1fr_1fr_1fr_140px] gap-4 p-4 border-b border-border bg-muted/30">
          <div className="font-medium text-sm text-foreground">Variable</div>
          <div className="font-medium text-sm text-foreground">Development</div>
          <div className="font-medium text-sm text-foreground">Preview</div>
          <div className="font-medium text-sm text-foreground">Production</div>
          <div className="font-medium text-sm text-foreground">Actions</div>
        </div>

        {variables.map((variable, index) => (
          <div
            key={variable.id}
            className="grid grid-cols-[200px_1fr_1fr_1fr_140px] gap-4 p-4 border-b border-border last:border-b-0 group hover:bg-muted/20"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{variable.name}</span>
                {variable.isSecret && (
                  <Badge variant="secondary" className="text-xs">
                    Secret
                  </Badge>
                )}
              </div>
              {variable.description && <p className="text-xs text-muted-foreground">{variable.description}</p>}
            </div>

            {environments.map((env) => (
              <div key={env}>{renderValue(variable, env)}</div>
            ))}

            <div className="flex items-center gap-1">
              {variable.isSecret && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSecretVisibility(variable.id)}
                  className="h-8 w-8 p-0"
                  data-walkthrough={index === 0 ? "visibility-toggle" : undefined}
                >
                  {visibleSecrets.has(variable.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}

              {editingVar === variable.id ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => saveChanges(variable)} className="h-8 px-2 text-xs">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingVar(null)} className="h-8 px-2 text-xs">
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  {onEditVariable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditVariable(variable)}
                      className="h-8 w-8 p-0"
                      title="Quick Edit"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => startEditing(variable)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVariable(variable)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          data-walkthrough="apply-changes"
          className="opacity-50 cursor-not-allowed bg-transparent"
          disabled
        >
          Apply Changes (See Change-Sets)
        </Button>
      </div>
    </div>
  )
}
