"use client"

import { useState } from "react"
import { Save, X, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useChangeSets } from "@/hooks/use-change-sets"
import type { EnvVar, Environment } from "@/types/env-vars"

interface QuickEditPanelProps {
  variable: EnvVar | null
  onClose: () => void
}

export function QuickEditPanel({ variable, onClose }: QuickEditPanelProps) {
  const { addChange } = useChangeSets()

  const [showSecrets, setShowSecrets] = useState(false)
  const [formData, setFormData] = useState(() => {
    if (!variable) return { name: "", description: "", isSecret: false, values: {} }
    return {
      name: variable.name,
      description: variable.description || "",
      isSecret: variable.isSecret,
      values: { ...variable.environments },
    }
  })

  const environments: { key: Environment; label: string }[] = [
    { key: "development", label: "Development" },
    { key: "preview", label: "Preview" },
    { key: "production", label: "Production" },
  ]

  const handleSave = () => {
    if (!variable) return

    const changedEnvs: Environment[] = []
    const values: any = {}

    // Check for changes in each environment
    environments.forEach(({ key }) => {
      const oldValue = variable.environments?.[key]?.value || ""
      const newValue = formData.values[key] || ""

      if (oldValue !== newValue) {
        changedEnvs.push(key)
        values[key] = { before: oldValue || undefined, after: newValue || undefined }
      }
    })

    // Check for metadata changes
    const metadataChanged =
      variable.name !== formData.name ||
      variable.description !== formData.description ||
      variable.isSecret !== formData.isSecret

    if (changedEnvs.length > 0 || metadataChanged) {
      addChange({
        varId: variable.id,
        name: formData.name,
        action: "update",
        environments: changedEnvs.length > 0 ? changedEnvs : ["development"], // At least one env for metadata changes
        values: changedEnvs.length > 0 ? values : {},
        isSecret: formData.isSecret,
        description: `Updated ${formData.name}${changedEnvs.length > 0 ? ` in ${changedEnvs.join(", ")}` : " (metadata)"}`,
        metadataChanges: metadataChanged
          ? {
              name: { before: variable.name, after: formData.name },
              description: { before: variable.description, after: formData.description },
              isSecret: { before: variable.isSecret, after: formData.isSecret },
            }
          : undefined,
      })
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

          {/* Show/Hide Secrets */}
          {formData.isSecret && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowSecrets(!showSecrets)}>
                {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showSecrets ? "Hide" : "Show"} Values
              </Button>
            </div>
          )}

          {/* Environment Values */}
          <div className="space-y-4">
            <Label>Environment Values</Label>
            <div className="space-y-3">
              {environments.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`edit-${key}`} className="text-sm font-medium">
                    {label}
                  </Label>
                  <Input
                    id={`edit-${key}`}
                    value={formData.values[key] || ""}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    placeholder={`Value for ${label.toLowerCase()}`}
                    type={formData.isSecret && !showSecrets ? "password" : "text"}
                    className="font-mono"
                  />
                </div>
              ))}
            </div>
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
