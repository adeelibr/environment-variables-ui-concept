import type { ChangeSet } from "@/types/env-vars"

export const mockChangeSets: ChangeSet[] = [
  {
    id: "changeset-1",
    name: "Add Analytics Configuration",
    description: "Adding Google Analytics and tracking variables",
    changes: [
      {
        id: "change-1",
        type: "create",
        variableName: "GOOGLE_ANALYTICS_ID",
        environments: ["development", "preview", "production"],
        newValues: {
          development: "GA-DEV-123456",
          preview: "GA-PREVIEW-789012",
          production: "GA-PROD-345678",
        },
        metadata: {
          isSecret: false,
          description: "Google Analytics tracking ID",
        },
      },
      {
        id: "change-2",
        type: "create",
        variableName: "ANALYTICS_SECRET",
        environments: ["development", "preview", "production"],
        newValues: {
          development: "analytics-dev-secret",
          preview: "analytics-preview-secret",
          production: "analytics-prod-secret",
        },
        metadata: {
          isSecret: true,
          description: "Secret key for analytics API",
        },
      },
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
]
