"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useChangeSetStore } from "@/lib/change-sets-store"
import type { EnvVarChange, Environment } from "@/types/env-vars"

interface ChangePreviewProps {
  change: EnvVarChange
}

export function ChangePreview({ change }: ChangePreviewProps) {
  const { removeChange } = useChangeSetStore()
  const [showValues, setShowValues] = useState(false)

  const getActionIcon = () => {
    switch (change.action) {
      case "create":
        return <Plus className="h-3 w-3" />
      case "update":
        return <Edit className="h-3 w-3" />
      case "delete":
        return <Trash2 className="h-3 w-3" />
    }
  }

  const getActionColor = () => {
    switch (change.action) {
      case "create":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "update":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "delete":
        return "bg-red-500/10 text-red-400 border-red-500/20"
    }
  }

  const renderValueDiff = (env: Environment) => {
    const envValue = change.values[env]
    if (!envValue) return null

    const { before, after } = envValue
    const isSecret = change.isSecret

    return (
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{env}</div>

        {change.action === "delete" ? (
          <div className="text-sm text-red-400 line-through">{isSecret && !showValues ? "••••••••" : before}</div>
        ) : change.action === "create" ? (
          <div className="text-sm text-green-400">{isSecret && !showValues ? "••••••••" : after}</div>
        ) : (
          <div className="space-y-1">
            {before && (
              <div className="text-sm text-red-400 line-through">{isSecret && !showValues ? "••••••••" : before}</div>
            )}
            <div className="text-sm text-green-400">{isSecret && !showValues ? "••••••••" : after}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 bg-muted/30 border border-border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getActionColor()}>
              {getActionIcon()}
              {change.action}
            </Badge>
            <span className="font-medium text-foreground">{change.name}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Environments:</span>
            {change.environments.map((env) => (
              <Badge key={env} variant="secondary" className="text-xs">
                {env}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {change.isSecret && (
            <Button variant="ghost" size="sm" onClick={() => setShowValues(!showValues)} className="h-6 w-6 p-0">
              {showValues ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeChange(change.id)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3">{change.environments.map((env) => renderValueDiff(env))}</div>
    </div>
  )
}
