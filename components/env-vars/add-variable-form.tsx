"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EnvironmentInputs } from "@/components/common/environment-inputs"
import { useEnvVariables } from "@/hooks/use-env-variables"
import { validators, generateId } from "@/lib/common-utils"
import { ENVIRONMENT_CONFIG } from "@/lib/constants"
import type { Environment } from "@/types/env-vars"

interface AddVariableFormProps {
  isOpen: boolean
  onClose: () => void
}

export function AddVariableForm({ isOpen, onClose }: AddVariableFormProps) {
  const { createVariable } = useEnvVariables()

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

  const [errors, setErrors] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: string[] = []

    // Validate variable name
    const nameValidation = validators.variableName(formData.name)
    if (!nameValidation.isValid) {
      newErrors.push(nameValidation.error!)
    }

    // Validate environment values
    const valuesValidation = validators.environmentValues(formData.values)
    if (!valuesValidation.isValid) {
      newErrors.push(valuesValidation.error!)
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])

    // Create the new variable using the unified hook - all change tracking handled internally
    createVariable({
      name: formData.name,
      description: formData.description,
      isSecret: formData.isSecret,
      values: {
        development: formData.values.development || undefined,
        preview: formData.values.preview || undefined,
        production: formData.values.production || undefined,
      },
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Add Environment Variable</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

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
              <EnvironmentInputs
                values={formData.values}
                onChange={handleValueChange}
                isSecret={formData.isSecret}
                showLabels={false}
              />
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
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
)
}
