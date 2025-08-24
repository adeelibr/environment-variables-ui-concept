"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useChangeSetStore } from "@/lib/change-sets-store"
import type { Environment } from "@/types/env-vars"

interface BulkPasteDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkPasteDialog({ isOpen, onClose }: BulkPasteDialogProps) {
  const { addBulkChanges } = useChangeSetStore()
  const [pasteText, setPasteText] = useState("")
  const [selectedEnvs, setSelectedEnvs] = useState<Environment[]>(["development"])
  const [isSecret, setIsSecret] = useState(false)

  const environments: Environment[] = ["development", "preview", "production"]

  const handlePaste = () => {
    const lines = pasteText.split("\n").filter((line) => line.trim())
    const changes = lines.map((line) => {
      const [name, ...valueParts] = line.split("=")
      const value = valueParts.join("=")

      const values: any = {}
      selectedEnvs.forEach((env) => {
        values[env] = { after: value }
      })

      return {
        varId: undefined,
        name: name.trim(),
        action: "create" as const,
        environments: selectedEnvs,
        values,
        isSecret,
        description: `Bulk imported variable`,
      }
    })

    addBulkChanges(changes)
    setPasteText("")
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
              {environments.map((env) => (
                <div key={env} className="flex items-center space-x-2">
                  <Checkbox
                    id={env}
                    checked={selectedEnvs.includes(env)}
                    onCheckedChange={() => toggleEnvironment(env)}
                  />
                  <label htmlFor={env} className="text-sm capitalize">
                    {env}
                  </label>
                </div>
              ))}
            </div>
          </div>

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
