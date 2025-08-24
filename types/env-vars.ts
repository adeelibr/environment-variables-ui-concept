export type Environment = "development" | "preview" | "production"

export interface EnvVar {
  id: string
  name: string
  values: {
    development?: string
    preview?: string
    production?: string
  }
  isSecret: boolean
  createdAt: Date
  updatedAt: Date
  description?: string
}

export interface AuditEvent {
  id: string
  varId: string
  action: "create" | "update" | "delete" | "reveal" | "copy"
  environment?: Environment
  timestamp: Date
  user: string
  details?: string
}

export interface DragOperation {
  type: "copy" | "move"
  sourceEnv: Environment
  targetEnv: Environment
  varIds: string[]
}

export type ChangeAction = "create" | "update" | "delete"

export interface EnvVarChange {
  id: string
  varId?: string // undefined for new variables
  name: string
  action: ChangeAction
  environments: Environment[]
  values: {
    development?: { before?: string; after?: string }
    preview?: { before?: string; after?: string }
    production?: { before?: string; after?: string }
  }
  isSecret: boolean
  description?: string
  timestamp: Date
  metadataChanges?: {
    name?: { before: string; after: string }
    description?: { before?: string; after: string }
    isSecret?: { before: boolean; after: boolean }
  }
}

export interface ChangeSet {
  id: string
  name: string
  description?: string
  changes: EnvVarChange[]
  createdAt: Date
  updatedAt: Date
  status: "draft" | "ready" | "applied" | "reverted"
  conflicts: ConflictInfo[]
}

export interface ConflictInfo {
  varId: string
  varName: string
  environment: Environment
  conflictType: "concurrent_edit" | "missing_dependency" | "circular_reference"
  details: string
}
