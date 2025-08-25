import type { Environment } from "@/types/env-vars"

/**
 * Available environment types
 */
export const ENVIRONMENTS: Environment[] = ["development", "preview", "production"]

/**
 * Environment configurations with display labels
 */
export const ENVIRONMENT_CONFIG = [
  { key: "development" as Environment, label: "Development" },
  { key: "preview" as Environment, label: "Preview" },
  { key: "production" as Environment, label: "Production" },
] as const

/**
 * Environment configurations with value property (for selects)
 */
export const ENVIRONMENT_OPTIONS = [
  { value: "development" as Environment, label: "Development" },
  { value: "preview" as Environment, label: "Preview" },
  { value: "production" as Environment, label: "Production" },
] as const

/**
 * Get environment label by key
 */
export function getEnvironmentLabel(env: Environment): string {
  const config = ENVIRONMENT_CONFIG.find(item => item.key === env)
  return config?.label || env
}

/**
 * Get all environment keys
 */
export function getAllEnvironments(): Environment[] {
  return [...ENVIRONMENTS]
}
