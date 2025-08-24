"use client"

import { useState } from "react"
import { useEnvVarsStore } from "@/lib/env-vars-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Upload, Download, Settings, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Environment } from "@/types/env-vars"
import { cn } from "@/lib/utils"

const environmentOptions = [
  { value: "all" as const, label: "All Environments" },
  { value: "development" as Environment, label: "Development" },
  { value: "preview" as Environment, label: "Preview" },
  { value: "production" as Environment, label: "Production" },
]

export function EnvVarsHeader() {
  const { searchQuery, setSearchQuery, selectedEnvironment, setSelectedEnvironment, selectAll, variables } =
    useEnvVarsStore()

  const [showImport, setShowImport] = useState(false)

  const handleImport = () => {
    setShowImport(true)
    // Implementation for import functionality
  }

  const handleExport = () => {
    // Implementation for export functionality
    console.log("Export all variables")
  }

  const handleNewVariable = () => {
    // Implementation for creating new variable
    console.log("Create new variable")
  }

  const currentEnvLabel =
    environmentOptions.find((opt) => opt.value === selectedEnvironment)?.label || "All Environments"

  return (
    <div className="border-b border-border bg-card">
      <div className="p-6">
        {/* Title and main actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Environment Variables</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your application configuration across environments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button onClick={handleNewVariable}>
              <Plus className="h-4 w-4 mr-2" />
              New Variable
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search variables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Environment filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[160px] justify-between bg-transparent">
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {currentEnvLabel}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {environmentOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedEnvironment(option.value)}
                  className={cn(selectedEnvironment === option.value && "bg-accent")}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk select */}
          <Button variant="outline" onClick={selectAll}>
            Select All
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
          <span>{variables.length} total variables</span>
          <span>{variables.filter((v) => v.values.development).length} in development</span>
          <span>{variables.filter((v) => v.values.preview).length} in preview</span>
          <span>{variables.filter((v) => v.values.production).length} in production</span>
        </div>
      </div>
    </div>
  )
}
