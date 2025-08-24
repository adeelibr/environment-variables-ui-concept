"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
  Plus,
  FileText,
  GitBranch,
  Settings,
  Search,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WalkthroughStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  target?: string
  position?: "top" | "bottom" | "left" | "right"
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: "overview",
    title: "Environment Variables Manager",
    description:
      "Welcome to your environment variables manager! This tool helps you safely manage configuration across Development, Preview, and Production environments using a change-sets approach.",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    id: "search",
    title: "Search & Filter",
    description:
      "Use the search bar to quickly find specific variables by name or description. Filter by environment or secret status to narrow down your view.",
    icon: <Search className="h-5 w-5" />,
    target: "[data-walkthrough='search-bar']",
    position: "bottom",
  },
  {
    id: "add-variable",
    title: "Add New Variable",
    description:
      "Click 'Add Variable' to create a new environment variable. You can set different values for each environment and mark sensitive data as secret.",
    icon: <Plus className="h-5 w-5" />,
    target: "[data-walkthrough='add-variable']",
    position: "bottom",
  },
  {
    id: "bulk-edit",
    title: "Bulk Operations",
    description:
      "Use 'Bulk Edit' to add multiple variables at once using JSON format or KEY=VALUE pairs. Perfect for importing configuration from other sources.",
    icon: <Upload className="h-5 w-5" />,
    target: "[data-walkthrough='bulk-edit']",
    position: "bottom",
  },
  {
    id: "table",
    title: "Variables Table",
    description:
      "View all your environment variables in a clean table format. Each variable shows its name, description, and which environments it's configured for. Secret variables are automatically masked for security.",
    icon: <FileText className="h-5 w-5" />,
    target: "[data-walkthrough='variables-table']",
    position: "top",
  },
  {
    id: "visibility",
    title: "Show/Hide Values",
    description:
      "Click the eye icon to reveal or hide variable values. This is especially useful for secret variables that are masked by default for security.",
    icon: <Eye className="h-5 w-5" />,
    target: "[data-walkthrough='visibility-toggle']",
    position: "left",
  },
  {
    id: "change-sets",
    title: "Change-Sets System",
    description:
      "All modifications are staged in change-sets (like Git commits). This allows you to review changes before applying them, ensuring safe deployments.",
    icon: <GitBranch className="h-5 w-5" />,
    target: "[data-walkthrough='change-sets']",
    position: "left",
  },
  {
    id: "review-apply",
    title: "Review & Apply",
    description:
      "Before changes take effect, review them in the change-sets drawer. You can see exactly what will change, resolve conflicts, and apply changes safely.",
    icon: <Play className="h-5 w-5" />,
    target: "[data-walkthrough='apply-changes']",
    position: "left",
  },
]

interface AppWalkthroughProps {
  isOpen: boolean
  onClose: () => void
}

interface Position {
  top: number
  left: number
}

export function AppWalkthrough({ isOpen, onClose }: AppWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const step = walkthroughSteps[currentStep]

      if (!step.target) {
        // Center the walkthrough for steps without targets
        setPosition({
          top: window.innerHeight / 2 - 200,
          left: window.innerWidth / 2 - 250,
        })
        return
      }

      setTimeout(() => {
        const targetElement = document.querySelector(step.target!)
        if (!targetElement) {
          // Fallback to center if target not found
          setPosition({
            top: window.innerHeight / 2 - 200,
            left: window.innerWidth / 2 - 250,
          })
          return
        }

        const targetRect = targetElement.getBoundingClientRect()
        const cardWidth = 500
        const cardHeight = 300
        const offset = 20

        let newPosition: Position = { top: 0, left: 0 }

        switch (step.position) {
          case "top":
            newPosition = {
              top: targetRect.top - cardHeight - offset + window.scrollY,
              left: targetRect.left + targetRect.width / 2 - cardWidth / 2 + window.scrollX,
            }
            break
          case "bottom":
            newPosition = {
              top: targetRect.bottom + offset + window.scrollY,
              left: targetRect.left + targetRect.width / 2 - cardWidth / 2 + window.scrollX,
            }
            break
          case "left":
            newPosition = {
              top: targetRect.top + targetRect.height / 2 - cardHeight / 2 + window.scrollY,
              left: targetRect.left - cardWidth - offset + window.scrollX,
            }
            break
          case "right":
            newPosition = {
              top: targetRect.top + targetRect.height / 2 - cardHeight / 2 + window.scrollY,
              left: targetRect.right + offset + window.scrollX,
            }
            break
          default:
            newPosition = {
              top: targetRect.bottom + offset + window.scrollY,
              left: targetRect.left + targetRect.width / 2 - cardWidth / 2 + window.scrollX,
            }
        }

        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Ensure the card stays within viewport bounds with more aggressive constraints
        newPosition.top = Math.max(
          20 + window.scrollY,
          Math.min(newPosition.top, viewportHeight + window.scrollY - cardHeight - 40),
        )
        newPosition.left = Math.max(20, Math.min(newPosition.left, viewportWidth - cardWidth - 20))

        // Special handling for the last step to ensure it's visible
        if (currentStep === walkthroughSteps.length - 1) {
          newPosition.top = Math.max(
            20 + window.scrollY,
            Math.min(newPosition.top, viewportHeight + window.scrollY - cardHeight - 80)
          )
        }

        setPosition(newPosition)

        document.querySelectorAll(".walkthrough-highlight").forEach((el) => {
          el.classList.remove("walkthrough-highlight")
        })

        if (targetElement) {
          targetElement.classList.add("walkthrough-highlight")
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }

    updatePosition()

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
      // Clean up highlights
      document.querySelectorAll(".walkthrough-highlight").forEach((el) => {
        el.classList.remove("walkthrough-highlight")
      })
    }
  }, [currentStep, isOpen])

  if (!isOpen) return null

  const step = walkthroughSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === walkthroughSteps.length - 1

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    onClose()
    setCurrentStep(0)
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />

      <Card
        ref={cardRef}
        className="fixed z-50 w-[500px] bg-background border-border shadow-2xl transition-all duration-500 ease-out"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {step.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {walkthroughSteps.length}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

            {/* Progress indicator */}
            <div className="flex gap-1">
              {walkthroughSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    index <= currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} / {walkthroughSteps.length}
            </Badge>

            {isLastStep ? (
              <Button size="sm" onClick={handleFinish} className="flex items-center gap-2">
                Get Started
                <Play className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleNext} className="flex items-center gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
