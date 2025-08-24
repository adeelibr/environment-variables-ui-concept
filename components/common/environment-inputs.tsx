"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ENVIRONMENT_CONFIG } from "@/lib/constants"
import type { Environment } from "@/types/env-vars"
import { cn } from "@/lib/utils"

interface EnvironmentInputsProps {
  values: Record<Environment, string>
  onChange: (environment: Environment, value: string) => void
  isSecret?: boolean
  disabled?: boolean
  className?: string
  showLabels?: boolean
}

export function EnvironmentInputs({ 
  values, 
  onChange, 
  isSecret = false, 
  disabled = false,
  className,
  showLabels = true 
}: EnvironmentInputsProps) {
  const [showSecrets, setShowSecrets] = useState(false)

  const handleValueChange = (env: Environment, value: string) => {
    onChange(env, value)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence>
        {isSecret && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center space-x-2"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSecrets(!showSecrets)}
            >
              {showSecrets ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Values
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Values
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {ENVIRONMENT_CONFIG.map(({ key, label }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          {showLabels && (
            <Label htmlFor={`${key}-value`}>{label}</Label>
          )}
          <Input
            id={`${key}-value`}
            type={isSecret && !showSecrets ? "password" : "text"}
            value={values[key] || ""}
            onChange={(e) => handleValueChange(key, e.target.value)}
            placeholder={`${label} value`}
            disabled={disabled}
          />
        </motion.div>
      ))}
    </div>
  )
}