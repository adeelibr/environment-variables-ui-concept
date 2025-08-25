"use client"

import { useState } from "react"
import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { EnvironmentInputs } from "@/components/common/environment-inputs"
import { useEnvState } from "@/hooks/use-env-state"
import { useEnvHistory } from "@/hooks/use-env-history"
import { useChangeSets } from "@/hooks/use-change-sets"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"

interface QuickEditPanelProps {
  variable: EnvironmentVariable | null
  onClose: () => void
}

export function QuickEditPanel({ variable, onClose }: QuickEditPanelProps) {
  const { updateVariable } = useEnvState()
  const { addHistoryEntry } = useEnvHistory()
  const { getOrCreateCurrentChangeSet, addChangeToSet } = useChangeSets()

  const [formData, setFormData] = useState(() => {
    if (!variable) return { name: "", description: "", isSecret: false, values: {} }
    return {
      name: variable.name,
      description: variable.description || "",
      isSecret: variable.isSecret,
      values: { ...variable.values },
    }
  })

  const handleSave = () => {
    if (!variable) return

    const changeSet = getOrCreateCurrentChangeSet()
    const changedEnvs: Environment[] = []
    const changedValues: Record<Environment, { before?: string; after?: string }> = {}
    
    // Check what values changed
    const environments: Environment[] = ["development", "preview", "production"]
    environments.forEach((env) => {
      const oldValue = variable.values[env]
      const newValue = formData.values[env]
      
      if (oldValue !== newValue) {
        changedEnvs.push(env)
        changedValues[env] = { before: oldValue, after: newValue || undefined }
      }
    })

    // Check if metadata changed
    const nameChanged = variable.name !== formData.name
    const descriptionChanged = variable.description !== formData.description
    const secretChanged = variable.isSecret !== formData.isSecret
    
    // Always update the variable directly
    const updates = {
      name: formData.name,
      description: formData.description,
      isSecret: formData.isSecret,
      values: formData.values,
    }

    updateVariable(variable.id, updates)

    // Add to change set if there were actual changes
    if (changedEnvs.length > 0 || nameChanged || descriptionChanged || secretChanged) {
      const metadataChanges: any = {}
      if (nameChanged) metadataChanges.name = { before: variable.name, after: formData.name }
      if (descriptionChanged) metadataChanges.description = { before: variable.description, after: formData.description }
      if (secretChanged) metadataChanges.isSecret = { before: variable.isSecret, after: formData.isSecret }

      addChangeToSet(changeSet.id, {
        varId: variable.id,
        name: formData.name,
        action: "update",
        environments: changedEnvs,
        values: changedValues,
        isSecret: formData.isSecret,
        description: formData.description,
        ...(Object.keys(metadataChanges).length > 0 && { metadataChanges })
      })

      // Track in history for time travel
      addHistoryEntry(
        "variable_updated",
        `Updated ${formData.name}`,
        [{
          id: Date.now().toString(),
          varId: variable.id,
          name: formData.name,
          action: "update",
          environments: changedEnvs.length > 0 ? changedEnvs : ["development"], // Simplified - just track that it was updated
          values: {},
          isSecret: formData.isSecret,
          description: `Updated ${formData.name}`,
        }]
      )
    }

    onClose()
  }

  const handleValueChange = (env: Environment, value: string) => {
    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [env]: value,
      },
    }))
  }

  if (!variable) return null

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-lg z-40 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Edit Variable</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Variable Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Variable Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Secret Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-secret"
              checked={formData.isSecret}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isSecret: checked }))}
            />
            <Label htmlFor="edit-secret">Mark as secret</Label>
          </div>

          {/* Environment Values */}
          <div className="space-y-4">
            <Label>Environment Values</Label>
            <EnvironmentInputs
              values={formData.values}
              onChange={handleValueChange}
              isSecret={formData.isSecret}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
