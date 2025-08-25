import type { Environment } from "@/types/env-vars"

/**
 * Form validation utilities
 */
export const validators = {
  /**
   * Validates variable name format
   */
  variableName: (name: string): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: "Variable name is required" }
    }
    
    // Check for valid environment variable name format
    const nameRegex = /^[A-Z_][A-Z0-9_]*$/
    if (!nameRegex.test(name)) {
      return { 
        isValid: false, 
        error: "Variable name must start with A-Z or _, and contain only A-Z, 0-9, and _" 
      }
    }
    
    return { isValid: true }
  },

  /**
   * Validates that at least one environment has a value
   */
  environmentValues: (values: Record<Environment, string>): { isValid: boolean; error?: string } => {
    const hasValue = Object.values(values).some(value => value.trim() !== "")
    
    if (!hasValue) {
      return { isValid: false, error: "At least one environment must have a value" }
    }
    
    return { isValid: true }
  }
}

/**
 * Data transformation utilities
 */
export const transformers = {
  /**
   * Parse JSON input for bulk operations
   */
  parseJsonVariables: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      const variables: Array<{ name: string; value: string; isSecret?: boolean }> = []

      if (Array.isArray(parsed)) {
        // Array format: [{"name": "API_KEY", "value": "123", "isSecret": true}]
        variables.push(...parsed)
      } else if (typeof parsed === "object") {
        // Object format: {"API_KEY": "123", "DB_URL": "postgres://..."}
        Object.entries(parsed).forEach(([key, value]) => {
          variables.push({
            name: key,
            value: String(value),
            isSecret: false,
          })
        })
      }

      return { success: true, variables, errors: [] }
    } catch (error) {
      return { 
        success: false, 
        variables: [], 
        errors: [`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      }
    }
  },

  /**
   * Parse key-value pairs for bulk operations
   */
  parseKeyValuePairs: (kvString: string) => {
    const lines = kvString.split('\n').filter(line => line.trim())
    const variables: Array<{ name: string; value: string; isSecret?: boolean }> = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const [, name, value] = match
        variables.push({
          name: name.trim(),
          value: value.trim(),
          isSecret: false,
        })
      } else {
        errors.push(`Line ${index + 1}: Invalid format. Expected KEY=value`)
      }
    })

    return { success: errors.length === 0, variables, errors }
  }
}

/**
 * Copy text to clipboard with error handling
 */
export async function copyToClipboard(text: string): Promise<{ success: boolean; error?: string }> {
  try {
    await navigator.clipboard.writeText(text)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to copy: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

/**
 * Generate unique ID for new items
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}
