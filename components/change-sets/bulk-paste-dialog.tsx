"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useChangeSets } from "@/hooks/use-change-sets"
import { ENVIRONMENTS, getEnvironmentLabel } from "@/lib/constants"
import { transformers, generateId } from "@/lib/common-utils"
import type { Environment } from "@/types/env-vars"

interface BulkPasteDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkPasteDialog({ isOpen, onClose }: BulkPasteDialogProps) {
  const { addChange } = useChangeSets()
  const [pasteText, setPasteText] = useState("")
  const [selectedEnvs, setSelectedEnvs] = useState<Environment[]>(["development"])
  const [isSecret, setIsSecret] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handlePaste = () => {
    // Parse key-value pairs using common utility
    const parseResult = transformers.parseKeyValuePairs(pasteText)
    
    if (!parseResult.success) {
      setErrors(parseResult.errors)
      return
    }

    setErrors([])
    
    // Add each variable as a separate change
    parseResult.variables.forEach((variable) => {
      const values: any = {}
      selectedEnvs.forEach((env) => {
        values[env] = { after: variable.value }
      })

      addChange({
        varId: `new-${generateId()}`,
        name: variable.name,
        action: "create" as const,
        environments: selectedEnvs,
        values,
        isSecret: isSecret || variable.isSecret,
        description: `Bulk imported variable`,
      })
    })

    setPasteText("")
    setErrors([])
    onClose()
  }

  const toggleEnvironment = (env: Environment) => {
    setSelectedEnvs((prev) => (prev.includes(env) ? prev.filter((e) => e !== env) : [...prev, env]))
  }

  const previewCount = pasteText.split("\n").filter((line) => line.trim()).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Variables</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Paste Variables (KEY=VALUE format, one per line)
            </label>
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`DATABASE_URL=postgresql://...
API_KEY=sk_test_...
REDIS_URL=redis://...`}
              className="min-h-32 font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Apply to Environments</label>
            <div className="flex gap-2">
              {ENVIRONMENTS.map((env) => (
                <div key={env} className="flex items-center space-x-2">
                  <Checkbox
                    id={env}
                    checked={selectedEnvs.includes(env)}
                    onCheckedChange={() => toggleEnvironment(env)}
                  />
                  <label htmlFor={env} className="text-sm">
                    {getEnvironmentLabel(env)}
                  </label>
                </div>
              ))}
            </div>
          </div>

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

          <div className="flex items-center space-x-2">
            <Checkbox id="secret" checked={isSecret} onCheckedChange={(checked) => setIsSecret(!!checked)} />
            <label htmlFor="secret" className="text-sm">
              Mark as secret variables
            </label>
          </div>

          {previewCount > 0 && (
            <div className="p-3 bg-muted/30 border border-border rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span>Will create</span>
                <Badge variant="secondary">{previewCount} variables</Badge>
                <span>in</span>
                {selectedEnvs.map((env) => (
                  <Badge key={env} variant="outline" className="capitalize">
                    {env}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePaste} disabled={!pasteText.trim() || selectedEnvs.length === 0}>
              Add to Change Set
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
