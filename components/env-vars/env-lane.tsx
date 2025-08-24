"use client"

import type { Environment, EnvVar } from "@/types/env-vars"
import { useEnvVarsStore } from "@/lib/env-vars-store"
import { EnvVarCard } from "./env-var-card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EnvLaneProps {
  environment: Environment
  variables: EnvVar[]
  className?: string
}

const environmentConfig = {
  development: {
    title: "Development",
    color: "bg-blue-500/10 border-blue-500/20",
    badgeColor: "bg-blue-500/20 text-blue-400",
  },
  preview: {
    title: "Preview",
    color: "bg-yellow-500/10 border-yellow-500/20",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
  },
  production: {
    title: "Production",
    color: "bg-red-500/10 border-red-500/20",
    badgeColor: "bg-red-500/20 text-red-400",
  },
}

export function EnvLane({ environment, variables, className }: EnvLaneProps) {
  const { selectedVarIds, selectVariable } = useEnvVarsStore()

  const config = environmentConfig[environment]
  const varsWithValues = variables.filter((v) => v.values[environment] !== undefined)
  const varsWithoutValues = variables.filter((v) => v.values[environment] === undefined)

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Lane Header */}
      <div className={cn("p-4 border-b border-border bg-card rounded-t-lg", config.color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground">{config.title}</h2>
            <Badge className={config.badgeColor}>{varsWithValues.length}</Badge>
          </div>

          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lane Content */}
      <div className="flex-1 p-4 space-y-3 bg-muted/30 rounded-b-lg min-h-[400px] overflow-y-auto">
        {/* Variables with values */}
        {varsWithValues.map((variable) => (
          <EnvVarCard
            key={variable.id}
            variable={variable}
            environment={environment}
            isSelected={selectedVarIds.includes(variable.id)}
            onSelect={selectVariable}
          />
        ))}

        {/* Variables without values (dimmed) */}
        {varsWithoutValues.map((variable) => (
          <div key={variable.id} className="opacity-40">
            <EnvVarCard
              variable={variable}
              environment={environment}
              isSelected={selectedVarIds.includes(variable.id)}
              onSelect={selectVariable}
            />
          </div>
        ))}

        {/* Empty state */}
        {variables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No variables in {environment}</p>
            <Button variant="ghost" size="sm" className="mt-2">
              Add variable
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
