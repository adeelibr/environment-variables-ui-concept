"use client"

import type React from "react"

import { useState } from "react"
import type { EnvironmentVariable, Environment } from "@/types/env-vars"
import { useEnvState } from "@/hooks/use-env-state"
import { useEnvSelection } from "@/hooks/use-env-selection"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Copy, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface EnvVarCardProps {
  variable: EnvironmentVariable
  environment: Environment
  isSelected: boolean
  isDragging?: boolean
  onSelect: (id: string, multi: boolean) => void
}

export function EnvVarCard({ variable, environment, isSelected, isDragging = false, onSelect }: EnvVarCardProps) {
  const { deleteVariable } = useEnvState()
  const { revealVariable, hideVariable, revealedVars } = useEnvSelection()
  const [copied, setCopied] = useState(false)

  const value = variable.values[environment]
  const isRevealed = revealedVars.has(variable.id)
  const hasValue = value !== undefined

  const handleRevealToggle = () => {
    if (isRevealed) {
      hideVariable(variable.id)
    } else {
      revealVariable(variable.id)
    }
  }

  const handleCopy = async () => {
    if (!value || (!isRevealed && variable.isSecret)) return

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleSelect = (event: React.MouseEvent) => {
    const isMultiSelect = event.metaKey || event.ctrlKey || event.shiftKey
    onSelect(variable.id, isMultiSelect)
  }

  const maskValue = (val: string) => {
    if (val.length <= 8) return "••••••••"
    return val.slice(0, 4) + "••••••••" + val.slice(-4)
  }

  const displayValue = () => {
    if (!hasValue) return "Not set"
    if (variable.isSecret && !isRevealed) return maskValue(value)
    return value
  }

  const getEnvironmentBadges = () => {
    const envs: Environment[] = ["development", "preview", "production"]
    return envs.map((env) => {
      const hasEnvValue = variable.values[env] !== undefined
      return (
        <Badge
          key={env}
          variant={hasEnvValue ? "default" : "secondary"}
          className={cn(
            "text-xs px-1.5 py-0.5",
            hasEnvValue ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {env.charAt(0).toUpperCase()}
        </Badge>
      )
    })
  }

  return (
    <Card
      className={cn(
        "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
        "border border-border bg-card",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isDragging && "opacity-50 rotate-2 scale-105",
        !hasValue && "opacity-60",
      )}
      onClick={handleSelect}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-sm font-medium text-foreground truncate">{variable.name}</h3>
            {variable.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{variable.description}</p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => deleteVariable(variable.id)}>
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Environment badges */}
        <div className="flex gap-1">{getEnvironmentBadges()}</div>

        {/* Value display */}
        {hasValue && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">{displayValue()}</code>

              <div className="flex gap-1">
                {variable.isSecret && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRevealToggle()
                    }}
                  >
                    {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy()
                  }}
                  disabled={variable.isSecret && !isRevealed}
                >
                  <Copy className={cn("h-3 w-3", copied && "text-primary")} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated {new Date(variable.updatedAt).toLocaleDateString()}</span>
          {variable.isSecret && (
            <Badge variant="outline" className="text-xs">
              Secret
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}
