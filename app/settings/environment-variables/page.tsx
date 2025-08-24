"use client"

import { useState, useEffect } from "react"
import { Plus, GitBranch, Upload, Download, Search, Filter, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEnvState } from "@/hooks/use-env-state"
import { useEnvHistory } from "@/hooks/use-env-history"
import { useEnvSearch } from "@/hooks/use-env-search"
import { useWalkthrough } from "@/hooks/use-walkthrough"
import { ChangeSetDrawer } from "@/components/change-sets/change-set-drawer"
import { BulkPasteDialog } from "@/components/change-sets/bulk-paste-dialog"
import { EnvVarsTable } from "@/components/env-vars/env-vars-table"
import { AddVariableForm } from "@/components/env-vars/add-variable-form"
import { QuickEditPanel } from "@/components/env-vars/quick-edit-panel"
import { BulkEditDialog } from "@/components/env-vars/bulk-edit-dialog"
import { AppWalkthrough } from "@/components/walkthrough/app-walkthrough"
import type { EnvironmentVariable } from "@/types/env-vars"

export default function EnvironmentVariablesPage() {
  const { variables } = useEnvState()
  const { getCommitHistory } = useEnvHistory()
  const { hasCompletedWalkthrough, markWalkthroughComplete } = useWalkthrough()
  const {
    searchQuery,
    setSearchQuery,
    selectedEnvironments,
    toggleEnvironment,
    showSecretsOnly,
    setShowSecretsOnly,
    filteredVariables,
    hasActiveFilters,
    clearFilters,
  } = useEnvSearch(variables)

  const commitHistory = getCommitHistory()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false)

  useEffect(() => {
    if (!hasCompletedWalkthrough) {
      setIsWalkthroughOpen(true)
    }
  }, [hasCompletedWalkthrough])

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true)
  }

  const handleAddVariable = () => {
    setIsAddFormOpen(true)
  }

  const handleEditVariable = (variable: EnvironmentVariable) => {
    setEditingVariable(variable)
  }

  const handleBulkEdit = () => {
    setIsBulkEditOpen(true)
  }

  const handleBulkImport = () => {
    setIsBulkPasteOpen(true)
  }

  const handleWalkthroughClose = () => {
    setIsWalkthroughOpen(false)
    markWalkthroughComplete()
  }

  const handleShowWalkthrough = () => {
    setIsWalkthroughOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Environment Variables</h1>
              <p className="text-muted-foreground mt-1">
                Manage your environment variables with change-sets for safe, reviewable updates
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleShowWalkthrough}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>

              <Button variant="outline" size="sm" onClick={handleAddVariable} data-walkthrough="add-variable">
                <Plus className="h-4 w-4 mr-2" />
                Add Variable
              </Button>

              <Button variant="outline" size="sm" onClick={handleBulkEdit} data-walkthrough="bulk-edit">
                <Plus className="h-4 w-4 mr-2" />
                Bulk Edit
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button variant="outline" size="sm" onClick={handleBulkImport}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>

              <Button onClick={handleOpenDrawer} className="relative" data-walkthrough="change-sets">
                <GitBranch className="h-4 w-4 mr-2" />
                History {commitHistory.length > 0 && `(${commitHistory.length})`}
                {commitHistory.length > 0 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md" data-walkthrough="search-bar">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search variables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "border-primary" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && <div className="ml-2 h-2 w-2 bg-primary rounded-full" />}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Environments:</span>
                  {(["development", "preview", "production"] as const).map((env) => (
                    <Button
                      key={env}
                      variant={selectedEnvironments.includes(env) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleEnvironment(env)}
                      className="capitalize"
                    >
                      {env}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={showSecretsOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowSecretsOnly(!showSecretsOnly)}
                  >
                    Secrets Only
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {hasActiveFilters && (
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredVariables.length} of {variables.length} variables
          </div>
        )}

        <EnvVarsTable
          variables={filteredVariables}
          onEditVariable={handleEditVariable}
          data-walkthrough="variables-table"
        />
      </div>

      {/* Drawers and Dialogs */}
      <ChangeSetDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <BulkPasteDialog isOpen={isBulkPasteOpen} onClose={() => setIsBulkPasteOpen(false)} />

      <AddVariableForm isOpen={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} />

      <QuickEditPanel variable={editingVariable} onClose={() => setEditingVariable(null)} />

      <BulkEditDialog isOpen={isBulkEditOpen} onClose={() => setIsBulkEditOpen(false)} />

      <AppWalkthrough isOpen={isWalkthroughOpen} onClose={handleWalkthroughClose} />
    </div>
  )
}
