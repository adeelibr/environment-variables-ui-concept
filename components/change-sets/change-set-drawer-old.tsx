"use client"

import { useState } from "react"
import { X, History, Clock, FileText } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useEnvHistory } from "@/hooks/use-env-history"

interface ChangeSetDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ChangeSetDrawer({ isOpen, onClose }: ChangeSetDrawerProps) {
  const { getCommitHistory, getCommitDetails } = useEnvHistory()
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null)
  
  const commitHistory = getCommitHistory()
  const selectedDetails = selectedCommit ? getCommitDetails(selectedCommit) : null

  if (!isOpen) return null

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "variable_created": return "bg-green-500/10 text-green-500 border-green-500/20"
      case "variable_updated": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "variable_deleted": return "bg-red-500/10 text-red-500 border-red-500/20"
      case "bulk_operation": return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      default: return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

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
              <History className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Change History</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">
              {commitHistory.length} changes tracked
            </p>
          </div>

          <ScrollArea className="flex-1">
            {selectedDetails ? (
              <div className="p-4 space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCommit(null)}
                  className="mb-4"
                >
                  ← Back to history
                </Button>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{selectedDetails.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(selectedDetails.timestamp)}
                    </p>
                  </div>
                  
                  <Badge className={getActionColor(selectedDetails.action)}>
                    {selectedDetails.action.replace('_', ' ')}
                  </Badge>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Changes:</h4>
                    {selectedDetails.changes.map((change) => (
                      <div key={change.id} className="p-2 bg-muted/30 rounded text-sm">
                        <div className="font-mono">{change.name}</div>
                        <div className="text-muted-foreground capitalize">
                          {change.action} • {change.environments.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {commitHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No changes yet</p>
                    <p className="text-sm">Start by adding or editing variables</p>
                  </div>
                ) : (
                  commitHistory.map((commit) => (
                    <div
                      key={commit.id}
                      className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedCommit(commit.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {commit.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getActionColor(commit.action)}`}
                            >
                              {commit.action.replace('_', ' ')}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(commit.timestamp)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {commit.changesCount}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
)
}
