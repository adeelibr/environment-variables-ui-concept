"use client"

import { useState } from "react"
import { X, GitBranch, Clock, AlertTriangle, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChangeSets } from "@/hooks/use-change-sets"
import { ChangePreview } from "./change-preview"

interface ChangeSetDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangeSetDrawer({ isOpen, onClose }: ChangeSetDrawerProps) {
  const { getCurrentChangeSet, applyChangeSet } = useChangeSets()
  const [isReviewing, setIsReviewing] = useState(false)
  
  const currentChangeSet = getCurrentChangeSet()

  if (!isOpen || !currentChangeSet) return null

  const handleReview = () => {
    setIsReviewing(true)
  }

  const handleApply = async () => {
    applyChangeSet(currentChangeSet.id)
    onClose()
  }

  const changeCount = currentChangeSet.changes.length
  // Note: conflicts functionality would need to be added to use-change-sets hook if needed
  const conflictCount = 0

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-xl z-50"
        >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Change Set</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">{currentChangeSet.name}</h3>
          {currentChangeSet.description && (
            <p className="text-sm text-muted-foreground">{currentChangeSet.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {changeCount} changes
            </div>
            {conflictCount > 0 && (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                {conflictCount} conflicts
              </div>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {currentChangeSet.changes.map((change) => (
            <ChangePreview key={change.id} change={change} />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-2">
        {!isReviewing ? (
          <Button onClick={handleReview} className="w-full" disabled={changeCount === 0}>
            Review Changes ({changeCount})
          </Button>
        ) : (
          <>
            {conflictCount > 0 && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Resolve {conflictCount} conflicts before applying
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsReviewing(false)} className="flex-1">
                Edit More
              </Button>
              <Button onClick={handleApply} disabled={conflictCount > 0} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Apply
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
)
}
