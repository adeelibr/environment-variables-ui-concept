"use client"

import { useState, useEffect } from "react"
import { Plus, FileText, Code, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useChangeSets } from "@/hooks/use-change-sets"
import { useEnvVariables } from "@/hooks/use-env-variables"
import type { Environment } from "@/types/env-vars"

interface BulkEditDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkEditDialog({ isOpen, onClose }: BulkEditDialogProps) {
  const { addChange } = useChangeSets()
  const { variables } = useEnvVariables()
  const [jsonInput, setJsonInput] = useState("")
  const [keyValueInput, setKeyValueInput] = useState("")
  const [selectedEnvironments, setSelectedEnvironments] = useState<Environment[]>(["development"])
  const [errors, setErrors] = useState<string[]>([])

  const environments: { value: Environment; label: string }[] = [
    { value: "development", label: "Development" },
    { value: "preview", label: "Preview" },
    { value: "production", label: "Production" },
  ]

  const handleEnvironmentToggle = (env: Environment) => {
    setSelectedEnvironments((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]))
  }

  const parseJsonInput = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const variables: Array<{ name: string; value: string; isSecret?: boolean }> = []

      if (Array.isArray(parsed)) {
        // Array format: [{"name": "API_KEY", "value": "123", "isSecret": true}]
        variables.push(...parsed)
      } else if (typeof parsed === "object") {
        // Object format: {"API_KEY": "123", "DB_URL": "postgres://..."}
        Object.entries(parsed).forEach(([key, value]) => {
          variables.push({
            name: key,
            value: String(value),
            isSecret:
              key.toLowerCase().includes("secret") ||
              key.toLowerCase().includes("key") ||
              key.toLowerCase().includes("password"),
          })
        })
      }

      return variables
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  const parseKeyValueInput = () => {
    const lines = keyValueInput.split("\n").filter((line) => line.trim())
    const variables: Array<{ name: string; value: string; isSecret?: boolean }> = []

    for (const line of lines) {
      const equalIndex = line.indexOf("=")
      if (equalIndex === -1) {
        throw new Error(`Invalid format in line: "${line}". Expected KEY=VALUE format.`)
      }

      const name = line.substring(0, equalIndex).trim()
      const value = line.substring(equalIndex + 1).trim()

      if (!name) {
        throw new Error(`Empty variable name in line: "${line}"`)
      }

      variables.push({
        name,
        value,
        isSecret:
          name.toLowerCase().includes("secret") ||
          name.toLowerCase().includes("key") ||
          name.toLowerCase().includes("password"),
      })
    }

    return variables
  }

  const handleSubmit = () => {
    setErrors([])

    if (selectedEnvironments.length === 0) {
      setErrors(["Please select at least one environment"])
      return
    }

    try {
      let variables: Array<{ name: string; value: string; isSecret?: boolean }> = []

      if (jsonInput.trim()) {
        variables = parseJsonInput()
      } else if (keyValueInput.trim()) {
        variables = parseKeyValueInput()
      } else {
        setErrors(["Please provide variables in either JSON or KEY=VALUE format"])
        return
      }

      if (variables.length === 0) {
        setErrors(["No variables found to add"])
        return
      }

      variables.forEach((variable) => {
        const values: any = {}
        selectedEnvironments.forEach((env) => {
          values[env] = { after: variable.value }
        })

        addChange({
          varId: `bulk-${Date.now()}-${variable.name}`,
          name: variable.name,
          action: "create",
          environments: selectedEnvironments,
          values,
          isSecret: variable.isSecret || false,
          description: `Bulk imported ${variable.name}`,
        })
      })

      // Reset form and close
      setJsonInput("")
      setKeyValueInput("")
      setSelectedEnvironments(["development"])
      onClose()
    } catch (error) {
      setErrors([error instanceof Error ? error.message : "Failed to parse variables"])
    }
  }

  const jsonExample = `{
  "API_KEY": "your-api-key-here",
  "DATABASE_URL": "postgres://user:pass@host:5432/db",
  "REDIS_URL": "redis://localhost:6379"
}`

  const keyValueExample = `API_KEY=your-api-key-here
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379
DEBUG=true`

  useEffect(() => {
    if (isOpen && variables && variables.length > 0) {
      const jsonData: Record<string, string> = {}
      const keyValueLines: string[] = []

      variables.forEach((variable) => {
        if (!variable?.name || !variable?.environments) return

        // Get the first available value from any environment
        const environments = variable.environments
        const devValue = environments.development?.value
        const previewValue = environments.preview?.value
        const prodValue = environments.production?.value
        const value = devValue || previewValue || prodValue || ""

        if (value) {
          jsonData[variable.name] = value
          keyValueLines.push(`${variable.name}=${value}`)
        }
      })

      // Only update if we have data
      if (Object.keys(jsonData).length > 0) {
        setJsonInput(JSON.stringify(jsonData, null, 2))
        setKeyValueInput(keyValueLines.join("\n"))
      }
    }
  }, [isOpen, variables])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Bulk Edit Variables
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Environment Selection */}
          <div>
            <Label className="text-sm font-medium">Target Environments</Label>
            <div className="flex gap-2 mt-2">
              {environments.map((env) => (
                <Button
                  key={env.value}
                  variant={selectedEnvironments.includes(env.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleEnvironmentToggle(env.value)}
                >
                  {env.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Tabs */}
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                JSON Format
              </TabsTrigger>
              <TabsTrigger value="keyvalue" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                KEY=VALUE Format
              </TabsTrigger>
            </TabsList>

            <TabsContent value="json" className="space-y-3">
              <Label htmlFor="json-input">JSON Variables</Label>
              <Textarea
                id="json-input"
                placeholder={jsonExample}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Supports object format {`{"KEY": "value"}`} or array format{" "}
                {`[{"name": "KEY", "value": "value", "isSecret": true}]`}
              </p>
            </TabsContent>

            <TabsContent value="keyvalue" className="space-y-3">
              <Label htmlFor="keyvalue-input">KEY=VALUE Variables</Label>
              <Textarea
                id="keyvalue-input"
                placeholder={keyValueExample}
                value={keyValueInput}
                onChange={(e) => setKeyValueInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                One variable per line in KEY=VALUE format. Variables with "key", "secret", or "password" in the name
                will be marked as secrets.
              </p>
            </TabsContent>
          </Tabs>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Variables to Change Set</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
