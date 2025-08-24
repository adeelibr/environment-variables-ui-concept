"use client"

import { useEnvVarsStore } from "@/lib/env-vars-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Move, Eye, EyeOff, Trash2, Download, X, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Environment } from "@/types/env-vars"

export function BulkActionsBar() {
  const { selectedVarIds, bulkMode, clearSelection, deleteVariables, revealedVars, variables } = useEnvVarsStore()

  if (!bulkMode || selectedVarIds.length === 0) return null

  const selectedVariables = variables.filter((v) => selectedVarIds.includes(v.id))
  const allRevealed = selectedVariables.every((v) => revealedVars.has(v.id))

  const handleCopyTo = (targetEnv: Environment) => {
    // Implementation for copying selected variables to target environment
    console.log("Copy to", targetEnv, selectedVarIds)
  }

  const handleMoveTo = (targetEnv: Environment) => {
    // Implementation for moving selected variables to target environment
    console.log("Move to", targetEnv, selectedVarIds)
  }

  const handleBulkReveal = () => {
    // Implementation for bulk reveal/hide
    console.log("Bulk reveal/hide", selectedVarIds)
  }

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedVarIds.length} variables?`)) {
      deleteVariables(selectedVarIds)
    }
  }

  const handleExport = () => {
    // Implementation for exporting selected variables
    console.log("Export", selectedVarIds)
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedVarIds.length} selected</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Copy to environment */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Copy to
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleCopyTo("development")}>Development</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyTo("preview")}>Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopyTo("production")}>Production</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Move to environment */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Move className="h-4 w-4 mr-1" />
                  Move to
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleMoveTo("development")}>Development</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMoveTo("preview")}>Preview</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMoveTo("production")}>Production</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reveal/Hide */}
            <Button variant="ghost" size="sm" onClick={handleBulkReveal}>
              {allRevealed ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Reveal
                </>
              )}
            </Button>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as .env
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Close button */}
          <Button variant="ghost" size="sm" onClick={clearSelection} className="ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
