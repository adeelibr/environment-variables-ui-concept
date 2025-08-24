"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useChangeSets } from "@/hooks/use-change-sets"
import type { Environment } from "@/types/env-vars"

interface AddVariableFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddVariableForm({ isOpen, onClose }: AddVariableFormProps) {
  const { addChange } = useChangeSets()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isSecret: false,
    values: {
      development: "",
      preview: "",
      production: "",
    },
  })

  const environments: { key: Environment; label: string }[] = [
    { key: "development", label: "Development" },
    { key: "preview", label: "Preview" },
    { key: "production", label: "Production" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    const selectedEnvs = environments.filter((env) => formData.values[env.key].trim() !== "").map((env) => env.key)

    if (selectedEnvs.length === 0) return

    const values: any = {}
    selectedEnvs.forEach((env) => {
      values[env] = { after: formData.values[env] }
    })

    addChange({
      varId: `new-${Date.now()}`,
      name: formData.name,
      action: "create",
      environments: selectedEnvs,
      values,
      isSecret: formData.isSecret,
      description: `Created ${formData.name}`,
    })

    // Reset form
    setFormData({
      name: "",
      description: "",
      isSecret: false,
      values: {
        development: "",
        preview: "",
        production: "",
      },
    })

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Add Environment Variable</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Variable Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Variable Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="API_KEY"
                className="font-mono"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description for this variable"
                rows={2}
              />
            </div>

            {/* Secret Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="secret"
                checked={formData.isSecret}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isSecret: checked }))}
              />
              <Label htmlFor="secret">Mark as secret (values will be masked)</Label>
            </div>

            {/* Environment Values */}
            <div className="space-y-4">
              <Label>Environment Values</Label>
              <div className="space-y-3">
                {environments.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      value={formData.values[key]}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      placeholder={`Value for ${label.toLowerCase()}`}
                      type={formData.isSecret ? "password" : "text"}
                      className="font-mono"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for environments where this variable shouldn't exist
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.name.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
